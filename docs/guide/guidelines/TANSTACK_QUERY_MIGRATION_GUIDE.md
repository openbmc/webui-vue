# TanStack Query (Vue Query) - Migration Guide

## What is TanStack Query?

TanStack Query (formerly React Query, now supports Vue) is a powerful data-fetching and state management library that handles:
- **Caching**: Stores fetched data in memory
- **Background refetching**: Automatically updates stale data
- **Request deduplication**: Prevents duplicate requests
- **Loading/error states**: Manages UI states automatically
- **Optimistic updates**: Updates UI before server confirms
- **Pagination & infinite scroll**: Built-in support

## Why Use TanStack Query?

### Before (Traditional Approach):
```javascript
// Manual state management
const data = ref([]);
const isLoading = ref(false);
const error = ref(null);

async function fetchData() {
  isLoading.value = true;
  try {
    const response = await api.get('/endpoint');
    data.value = response.data;
  } catch (err) {
    error.value = err;
  } finally {
    isLoading.value = false;
  }
}

// Need to manually:
// - Call fetchData() on mount
// - Handle refetching
// - Manage cache
// - Prevent duplicate requests
// - Handle race conditions
```

### After (TanStack Query):
```javascript
const { data, isLoading, error } = useQuery({
  queryKey: ['sensors'],
  queryFn: fetchSensors,
});

// Automatically handles:
// ✅ Fetching on mount
// ✅ Caching
// ✅ Background refetching
// ✅ Deduplication
// ✅ Loading/error states
```

## Core Concepts

### 1. **Query Key** (Unique Identifier)
```javascript
queryKey: ['sensors']  // Simple key
queryKey: ['sensors', chassisId]  // Key with parameter
queryKey: ['redfish', 'subResources', '/redfish/v1/Chassis', 'Sensors']  // Hierarchical
```

**Purpose**: 
- Uniquely identifies the query in the cache
- Used for cache invalidation and refetching
- Queries with the same key share the same cache

### 2. **Query Function** (Data Fetcher)
```javascript
queryFn: async () => {
  const response = await api.get('/redfish/v1/Chassis');
  return response.data;
}
```

**Purpose**:
- Async function that fetches the data
- Must return a Promise
- Called automatically when needed

### 3. **Stale Time** (Freshness Duration)
```javascript
staleTime: 30000  // 30 seconds
```

**What it means**:
- Data is considered "fresh" for 30 seconds
- During this time, no refetching occurs
- After 30 seconds, data becomes "stale"
- Stale data triggers background refetch on:
  - Component remount
  - Window refocus
  - Network reconnection

**Example Timeline**:
```
0s:  Fetch data → Data is FRESH
30s: Data becomes STALE
31s: User switches tabs → No refetch (data still in cache)
35s: User returns to tab → Background refetch (data is stale)
```

### 4. **GC Time** (Garbage Collection Time)
```javascript
gcTime: 300000  // 5 minutes (formerly called cacheTime)
```

**What it means**:
- How long UNUSED data stays in cache
- After 5 minutes of no components using this query, data is removed
- Prevents memory leaks from old data

**Example**:
```
0s:   Component mounts → Fetch data
10s:  Component unmounts → Start GC timer
310s: (5 min later) → Data removed from cache
```

### 5. **Refetch Options**
```javascript
refetchOnWindowFocus: true   // Refetch when user returns to tab
refetchOnMount: true         // Refetch when component mounts
refetchOnReconnect: true     // Refetch when internet reconnects
```

### 6. **Retry Logic**
```javascript
retry: 2  // Retry failed requests 2 times
retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
// Exponential backoff: 1s, 2s, 4s, 8s, 16s, 30s (max)
```

## How It Works in Our Implementation

### 1. useRedfishRoot.ts (ServiceRoot Caching)
```typescript
export function useRedfishRoot() {
  return useQuery({
    queryKey: ['redfish', 'serviceRoot'],
    queryFn: async () => {
      const { data } = await api.get('/redfish/v1/');
      return data;
    },
    staleTime: Infinity,         // Never becomes stale
    gcTime: Infinity,            // Never garbage collected
    refetchOnWindowFocus: false, // Don't refetch
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
}
```

**Why these settings?**
- ServiceRoot rarely changes, so cache it forever
- Contains OData feature detection (ProtocolFeaturesSupported)
- No need to refetch - it's essentially static
- Saves unnecessary network requests

**Usage in other composables:**
```typescript
const { data: serviceRoot } = useRedfishRoot();
const supportsExpand = serviceRoot?.ProtocolFeaturesSupported?.ExpandQuery?.MaxLevels > 0;
```

### 2. useSensors.ts (Actual Implementation)
```typescript
export function useSensors() {
  return useQuery({
    queryKey: ['sensors'],
    queryFn: getAllSensors,
    staleTime: 30000,            // Fresh for 30 seconds
    gcTime: 300000,              // Keep in cache for 5 minutes
    refetchOnWindowFocus: true,  // Refetch when user returns
    refetchOnReconnect: true,    // Refetch when internet reconnects
    retry: 2,                    // Retry failed requests twice
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

async function getAllSensors(): Promise<SensorDisplay[]> {
  // 1. Get all chassis
  const chassisCollection = await getChassisCollection();
  
  // 2. Check OData support
  const supportsExpand = await supportsExpandQuery();
  
  // 3. Fetch sensors from each chassis
  const sensorPromises = chassisCollection.map((chassisId) =>
    supportsExpand
      ? getSensorsWithExpand(chassisId)      // Use $expand for efficiency
      : getSensorsWithoutExpand(chassisId)   // Fallback to individual requests
  );
  
  // 4. Combine and deduplicate
  const sensorArrays = await Promise.all(sensorPromises);
  return uniqBy(sensorArrays.flat(), 'name');
}
```

**Why these settings?**
- Sensor data changes frequently → 30s stale time
- Keep in cache for 5 min → Fast navigation between pages
- Refetch on focus → Always show current data when user returns
- Retry with exponential backoff → Handle temporary network issues
- No retry on 4xx errors (client errors don't benefit from retry)

**OData Optimization:**
```typescript
// With OData $expand (1 request per chassis)
async function getSensorsWithExpand(chassisId: string) {
  const { data } = await api.get(`${chassisId}/Sensors?$expand=.($levels=1)`);
  return data.Members.map(transformSensorData);
}

// Without OData (N+1 requests: 1 for collection + N for each sensor)
async function getSensorsWithoutExpand(chassisId: string) {
  const { data } = await api.get(`${chassisId}/Sensors`);
  const promises = data.Members.map(sensor =>
    api.get(sensor['@odata.id'])
  );
  const responses = await Promise.all(promises);
  return responses.map(r => transformSensorData(r.data));
}
```

### 3. useAllSubResources.ts (Generic Pattern - Future Use)
```typescript
export function useAllSubResources<T>(
  collectionPath: string,
  subResourceName: string
) {
  return useQuery({
    queryKey: ['redfish', 'subResources', collectionPath, subResourceName],
    queryFn: async () => {
      // 1. Get parent collection
      const parents = await fetchCollection(collectionPath);
      
      // 2. Use $select to find which parents have the sub-resource
      const parentsWithSubResource = await checkForSubResource(
        parents,
        subResourceName
      );
      
      // 3. Use $expand to fetch all sub-resources efficiently
      const results = await Promise.all(
        parentsWithSubResource.map(parent =>
          fetchSubResourcesWithExpand(parent, subResourceName)
        )
      );
      
      return results.flat();
    },
    staleTime: 30000,
    gcTime: 300000,
    refetchOnWindowFocus: true,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}
```

**Future usage examples:**
```typescript
// All Memory from all Systems
const { data: memory } = useAllSubResources<Memory>(
  '/redfish/v1/Systems',
  'Memory'
);

// All Drives from all Storage
const { data: drives } = useAllSubResources<Drive>(
  '/redfish/v1/Storage',
  'Drives'
);

// All Processors from all Systems
const { data: processors } = useAllSubResources<Processor>(
  '/redfish/v1/Systems',
  'Processors'
);
```

## Return Values

```javascript
const {
  data,           // The fetched data (undefined until loaded)
  isLoading,      // true during initial fetch
  isFetching,     // true during any fetch (including background)
  isError,        // true if query failed
  error,          // Error object if failed
  isSuccess,      // true if query succeeded
  refetch,        // Function to manually refetch
  status,         // 'pending' | 'error' | 'success'
} = useQuery({ ... });
```

## Advanced: Incremental Updates

Our implementation adds incremental updates:

```typescript
const incrementalData = ref([]);  // Reactive ref for partial results

const query = useQuery({
  queryFn: async () => {
    incrementalData.value = [];  // Reset
    
    // As data arrives, push to incrementalData
    const results = await fetchAllSubResources(
      collectionPath,
      subResourceName,
      incrementalData  // ← Receives partial results
    );
    
    return results;  // Final complete data
  },
});

return {
  ...query,
  incrementalData,  // UI can use this for progressive rendering
};
```

**Benefits**:
- UI shows data as it arrives (progressive rendering)
- Better perceived performance
- User sees partial results immediately

## Cache Behavior Examples

### Example 1: Multiple Components Using Same Query
```javascript
// Component A
const { data: sensors1 } = useQuery({ queryKey: ['sensors'], ... });

// Component B (mounted later)
const { data: sensors2 } = useQuery({ queryKey: ['sensors'], ... });
```

**What happens**:
1. Component A mounts → Fetch data
2. Component B mounts → Uses cached data (no fetch!)
3. Both components share the same data
4. One background refetch updates both

### Example 2: Stale Data Refetch
```javascript
const { data } = useQuery({
  queryKey: ['sensors'],
  queryFn: fetchSensors,
  staleTime: 30000,  // 30 seconds
});
```

**Timeline**:
```
0s:   Mount → Fetch data → Data is FRESH
15s:  User navigates away
20s:  User returns → Uses cached data (still fresh)
35s:  User navigates away
40s:  User returns → Background refetch (data is stale)
```

### Example 3: Cache Invalidation
```javascript
// Manually invalidate cache
import { useQueryClient } from '@tanstack/vue-query';

const queryClient = useQueryClient();

// After updating a sensor
await updateSensor(sensorId, newValue);

// Invalidate to trigger refetch
queryClient.invalidateQueries({ queryKey: ['sensors'] });
```

## Best Practices

### 1. **Choose Appropriate Stale Time**
```javascript
// Static data (rarely changes)
staleTime: Infinity  // ServiceRoot, system info

// Frequently changing data
staleTime: 10000  // 10 seconds - sensor readings

// Moderate updates
staleTime: 60000  // 1 minute - configuration
```

### 2. **Use Hierarchical Query Keys**
```javascript
// Good - Easy to invalidate related queries
['redfish', 'chassis', chassisId, 'sensors']
['redfish', 'systems', systemId, 'memory']

// Can invalidate all chassis queries:
queryClient.invalidateQueries({ queryKey: ['redfish', 'chassis'] });
```

### 3. **Enable/Disable Queries Conditionally**
```javascript
const { data } = useQuery({
  queryKey: ['sensor', sensorId],
  queryFn: () => fetchSensor(sensorId),
  enabled: !!sensorId,  // Only fetch if sensorId exists
});
```

## Comparison with Vuex/Pinia

| Feature | Vuex/Pinia | TanStack Query |
|---------|------------|----------------|
| **Purpose** | Global state | Server state |
| **Caching** | Manual | Automatic |
| **Refetching** | Manual | Automatic |
| **Loading states** | Manual | Automatic |
| **Deduplication** | Manual | Automatic |
| **Background updates** | Manual | Automatic |
| **Best for** | Client state (UI, forms) | Server data (API) |

**Recommendation**: Use both!
- **TanStack Query**: For server data (sensors, memory, etc.)
- **Pinia**: For client state (UI preferences, form data)

## Summary

TanStack Query is like having a smart assistant that:
1. **Fetches data** when you need it
2. **Caches it** so you don't fetch twice
3. **Keeps it fresh** by refetching in the background
4. **Handles errors** and retries automatically
5. **Manages loading states** for you
6. **Deduplicates requests** to save bandwidth
7. **Cleans up** old data to prevent memory leaks

All you do is:
```javascript
const { data, isLoading, error } = useQuery({
  queryKey: ['myData'],
  queryFn: fetchMyData,
});
```

And it handles everything else!
