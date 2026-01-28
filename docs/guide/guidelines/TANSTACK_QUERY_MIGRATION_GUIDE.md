# Migration Guide: From Vuex to TanStack Query

This guide demonstrates how to migrate from Vuex/Pinia store patterns to TanStack Query for server state management, using the Sensors page as a real-world example.

## Table of Contents

- [Why Migrate?](#why-migrate)
- [Key Differences](#key-differences)
- [Migration Steps](#migration-steps)
- [Real Example: Sensors Page](#real-example-sensors-page)
- [Pattern for Other Pages](#pattern-for-other-pages)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## Why Migrate?

### Problems with Vuex for Server State

```javascript
// ❌ OLD: Vuex/Pinia Store (SensorsStore.js)
export const SensorsStore = defineStore('sensors', {
  state: () => ({
    sensors: [],
  }),
  actions: {
    async getAllSensors() {
      // Manual loading state management
      // Manual error handling
      // Manual caching logic
      // Manual refetching logic
      // No request deduplication
      // No background updates
    }
  }
});
```

**Issues:**
- ❌ Manual state management (loading, error, data)
- ❌ No automatic caching
- ❌ No background refetching
- ❌ No request deduplication
- ❌ Stale data without manual refresh
- ❌ Complex code for simple data fetching

### Benefits of TanStack Query

```javascript
// ✅ NEW: TanStack Query
const { data, isLoading, error } = useQuery({
  queryKey: ['sensors'],
  queryFn: fetchSensors,
});
```

**Benefits:**
- ✅ Automatic loading/error states
- ✅ Automatic caching
- ✅ Automatic background refetching
- ✅ Automatic request deduplication
- ✅ Stale-while-revalidate pattern
- ✅ Simple, declarative code

## Key Differences

| Aspect | Vuex/Pinia | TanStack Query |
|--------|------------|----------------|
| **Purpose** | Client state | Server state |
| **Caching** | Manual | Automatic |
| **Refetching** | Manual | Automatic |
| **Loading states** | Manual | Automatic |
| **Deduplication** | Manual | Automatic |
| **Background updates** | Manual | Automatic |
| **Code complexity** | High | Low |

**Recommendation:** Use both!
- **TanStack Query**: For server data (API responses)
- **Pinia**: For client state (UI preferences, form data)

## Migration Steps

### Step 1: Install TanStack Query

```bash
npm install @tanstack/vue-query
```

### Step 2: Set Up Query Client

```javascript
// main.js
import { VueQueryPlugin } from '@tanstack/vue-query';

app.use(VueQueryPlugin, {
  queryClientConfig: {
    defaultOptions: {
      queries: {
        staleTime: 30000,  // 30 seconds
        gcTime: 300000,    // 5 minutes
        refetchOnWindowFocus: true,
        retry: 2,
      },
    },
  },
});
```

### Step 3: Create Service Layer

Move API calls from store to service:

```javascript
// src/api/services/yourService.js
import api from '@/store/api';

export const fetchYourData = async () => {
  const { data } = await api.get('/redfish/v1/YourEndpoint');
  return data;
};
```

### Step 4: Create Query Composable

```javascript
// src/components/Composables/useYourQuery.js
import { useQuery } from '@tanstack/vue-query';
import { fetchYourData } from '@/api/services/yourService';

export function useYourQuery() {
  return useQuery({
    queryKey: ['yourData'],
    queryFn: fetchYourData,
    staleTime: 30000,
    gcTime: 300000,
  });
}
```

### Step 5: Use in Component

```vue
<script setup>
import { useYourQuery } from '@/components/Composables/useYourQuery';

const { data, isLoading, isError, error } = useYourQuery();
</script>

<template>
  <div v-if="isLoading">Loading...</div>
  <div v-else-if="isError">Error: {{ error.message }}</div>
  <div v-else>{{ data }}</div>
</template>
```

## Real Example: Sensors Page

### Before: Vuex Store Pattern

#### 1. Store (SensorsStore.js) - 171 lines

```javascript
// ❌ OLD: Complex store with manual state management
import { defineStore } from 'pinia';
import api from '@/store/api';
import { uniqBy } from 'lodash';

export const SensorsStore = defineStore('sensors', {
  state: () => ({
    sensors: [],  // Manual state
  }),

  getters: {
    getSensors: (state) => state.sensors,
  },

  actions: {
    async getAllSensors() {
      const collection = await this.getChassisCollection();
      if (!collection) return;
      this.resetSensors();
      
      // Manual promise management
      const promises = collection.reduce((acc, id) => {
        acc.push(this.fetchSensors(id));
        acc.push(this.getThermalSensors(id));
        acc.push(this.getPowerSensors(id));
        return acc;
      }, []);
      
      return await api.all(promises);
    },

    async getChassisCollection() {
      return await api
        .get('/redfish/v1/Chassis')
        .then(({ data: { Members } }) =>
          Members.map((member) => member['@odata.id']),
        )
        .catch((error) => console.log(error));
    },

    resetSensors() {
      this.sensors = [];
    },

    async fetchSensors(id) {
      // Check for expand support
      await api
        .get('/redfish/v1/')
        .then(({ data }) => {
          if (data?.ProtocolFeaturesSupported?.ExpandQuery?.MaxLevels > 0) {
            return this.getSensorsUsingQueryParams(id);
          } else {
            return this.getSensorsWithoutQueryParams(id);
          }
        })
        .catch((error) => console.log(error));
    },

    async getSensorsWithoutQueryParams(id) {
      // Fetch collection, then each sensor individually
      const sensors = await api
        .get(`${id}/Sensors`)
        .then((response) => response.data.Members)
        .catch((error) => console.log(error));
      
      if (!sensors) return;
      
      const promises = sensors.map((sensor) => {
        return api.get(sensor['@odata.id']).catch((error) => {
          console.log(error);
          return error;
        });
      });
      
      return await api.all(promises).then((responses) => {
        const sensorData = [];
        responses.forEach((response) => {
          if (response.data) {
            sensorData.push({
              name: response.data.Name,
              status: response.data.Status?.Health,
              currentValue: response.data.Reading,
              // ... more fields
            });
          }
        });
        this.setSensors(sensorData);
      });
    },

    async getSensorsUsingQueryParams(id) {
      // Similar complexity for expand query
      // ...
    },

    async getThermalSensors(id) {
      // Fetch thermal sensors
      // ...
    },

    async getPowerSensors(id) {
      // Fetch power sensors
      // ...
    },

    setSensors(sensors) {
      this.sensors = uniqBy([...sensors, ...this.sensors], 'name');
    },
  },
});
```

#### 2. Component Usage

```vue
<script>
import { mapState } from 'pinia';
import { SensorsStore } from '@/store/modules/HardwareStatus/SensorsStore';

export default {
  data() {
    return {
      isLoading: false,
      error: null,
    };
  },
  computed: {
    ...mapState(SensorsStore, ['sensors']),
  },
  async mounted() {
    this.isLoading = true;
    try {
      await SensorsStore().getAllSensors();
    } catch (error) {
      this.error = error;
    } finally {
      this.isLoading = false;
    }
  },
};
</script>
```

**Problems:**
- 171 lines of complex store code
- Manual loading/error state management
- No automatic caching
- No background refetching
- No request deduplication
- Complex promise orchestration

### After: TanStack Query Pattern

#### 1. Generic Composables (Reusable!)

```typescript
// ✅ NEW: useRedfishRoot.ts (99 lines, reusable)
import { useQuery } from '@tanstack/vue-query';
import api from '@/store/api';

export function useRedfishRoot() {
  const query = useQuery({
    queryKey: ['redfish', 'serviceRoot'],
    queryFn: async () => {
      const { data } = await api.get('/redfish/v1/');
      return data;
    },
    staleTime: Infinity,  // Cache forever
    gcTime: Infinity,
    refetchOnWindowFocus: false,
  });

  const supportsExpand = () => {
    return query.data.value?.ProtocolFeaturesSupported?.ExpandQuery?.MaxLevels > 0;
  };

  return { ...query, supportsExpand };
}
```

```typescript
// ✅ NEW: useAllSubResources.ts (293 lines, reusable for ANY collection!)
import { useQuery } from '@tanstack/vue-query';
import { fetchRedfishCollection, fetchCollectionMembers } from './useRedfishCollection';
import { useRedfishRoot } from './useRedfishRoot';

export function useAllSubResources(
  collectionPath,
  subResourceName,
  options = {}
) {
  const incrementalData = ref([]);
  
  const query = useQuery({
    queryKey: ['redfish', 'subResources', collectionPath, subResourceName],
    queryFn: async () => {
      incrementalData.value = [];
      const results = await fetchAllSubResources(
        collectionPath,
        subResourceName,
        incrementalData  // Pushes partial results for progressive UI
      );
      return results;
    },
    staleTime: options.staleTime ?? 30000,
    gcTime: options.gcTime ?? 300000,
    refetchOnWindowFocus: true,
    retry: 2,
  });
  
  return {
    ...query,
    incrementalData,  // For progressive rendering
  };
}
```

#### 2. Simple Query Composable

```javascript
// ✅ NEW: useSensorsQuery.js (21 lines!)
import { useAllSubResources } from '@/api/composables/useAllSubResources';

export function useSensorsQuery() {
  return useAllSubResources('/redfish/v1/Chassis', 'Sensors', {
    queryKey: ['sensors'],
    staleTime: 30000,
    gcTime: 300000,
  });
}
```

#### 3. Component Usage

```vue
<script setup>
import { useSensorsQuery } from '@/components/Composables/useSensorsQuery';

// ✅ That's it! One line!
const { data: sensorsData, isLoading, isError, error } = useSensorsQuery();
</script>

<template>
  <div v-if="isLoading">Loading...</div>
  <div v-else-if="isError">Error: {{ error.message }}</div>
  <b-table v-else :items="sensorsData" />
</template>
```

**Benefits:**
- 21 lines vs 171 lines (87% reduction!)
- Automatic loading/error states
- Automatic caching
- Automatic background refetching
- Automatic request deduplication
- Progressive UI updates via `incrementalData`
- Reusable for Memory, Processors, Drives, etc.

### Side-by-Side Comparison

| Aspect | Vuex Store | TanStack Query |
|--------|------------|----------------|
| **Lines of code** | 171 | 21 |
| **Complexity** | High | Low |
| **Reusability** | Low | High |
| **Caching** | Manual | Automatic |
| **Loading states** | Manual | Automatic |
| **Error handling** | Manual | Automatic |
| **Refetching** | Manual | Automatic |
| **Deduplication** | None | Automatic |
| **Progressive UI** | Manual | Built-in |

## Pattern for Other Pages

### Memory Page Migration

```javascript
// ✅ NEW: useMemoryQuery.js
import { useAllSubResources } from '@/api/composables/useAllSubResources';

export function useMemoryQuery() {
  return useAllSubResources('/redfish/v1/Systems', 'Memory', {
    queryKey: ['memory'],
    staleTime: 30000,
    gcTime: 300000,
  });
}
```

```vue
<script setup>
import { useMemoryQuery } from '@/components/Composables/useMemoryQuery';

const { data: memoryData, isLoading, isError, error } = useMemoryQuery();
</script>
```

### Processors Page Migration

```javascript
// ✅ NEW: useProcessorsQuery.js
import { useAllSubResources } from '@/api/composables/useAllSubResources';

export function useProcessorsQuery() {
  return useAllSubResources('/redfish/v1/Systems', 'Processors', {
    queryKey: ['processors'],
    staleTime: 30000,
    gcTime: 300000,
  });
}
```

### Drives Page Migration

```javascript
// ✅ NEW: useDrivesQuery.js
import { useAllSubResources } from '@/api/composables/useAllSubResources';

export function useDrivesQuery() {
  return useAllSubResources('/redfish/v1/Storage', 'Drives', {
    queryKey: ['drives'],
    staleTime: 30000,
    gcTime: 300000,
  });
}
```

**Pattern:** Same generic composable, different paths!

## Best Practices

### 1. Choose Appropriate Stale Time

```javascript
// Static data (rarely changes)
staleTime: Infinity  // ServiceRoot, system info

// Frequently changing data
staleTime: 10000  // 10 seconds - sensor readings

// Moderate updates
staleTime: 60000  // 1 minute - configuration
```

### 2. Use Hierarchical Query Keys

```javascript
// Good - Easy to invalidate related queries
queryKey: ['redfish', 'chassis', chassisId, 'sensors']

// Can invalidate all chassis queries:
queryClient.invalidateQueries({ queryKey: ['redfish', 'chassis'] });
```

### 3. Preserve Redfish Property Names

```javascript
// ✅ Good - Use Redfish PascalCase
sensor.Name
sensor.Status.Health
sensor.Reading
sensor.Thresholds.LowerCritical.Reading

// ❌ Bad - Don't create wrapper interfaces
sensor.name
sensor.statusHealth
sensor.currentValue
```

### 4. Handle Mutations

```javascript
import { useMutation, useQueryClient } from '@tanstack/vue-query';

const queryClient = useQueryClient();

const mutation = useMutation({
  mutationFn: updateSensor,
  onSuccess: () => {
    // Invalidate and refetch
    queryClient.invalidateQueries({ queryKey: ['sensors'] });
  },
});
```

### 5. Optimistic Updates

```javascript
const mutation = useMutation({
  mutationFn: updateSensor,
  onMutate: async (newSensor) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey: ['sensors'] });
    
    // Snapshot previous value
    const previousSensors = queryClient.getQueryData(['sensors']);
    
    // Optimistically update
    queryClient.setQueryData(['sensors'], (old) => {
      return old.map((s) => s.id === newSensor.id ? newSensor : s);
    });
    
    return { previousSensors };
  },
  onError: (err, newSensor, context) => {
    // Rollback on error
    queryClient.setQueryData(['sensors'], context.previousSensors);
  },
});
```

## Troubleshooting

### Issue: Data not updating

**Problem:** Component shows stale data

**Solution:** Check stale time and refetch settings

```javascript
useQuery({
  queryKey: ['sensors'],
  queryFn: fetchSensors,
  staleTime: 30000,  // Data fresh for 30s
  refetchOnWindowFocus: true,  // Refetch when user returns
});
```

### Issue: Too many requests

**Problem:** Multiple components causing duplicate requests

**Solution:** Use same query key

```javascript
// Component A
const { data } = useQuery({ queryKey: ['sensors'], ... });

// Component B (same key = shared cache!)
const { data } = useQuery({ queryKey: ['sensors'], ... });
```

### Issue: Need to refetch manually

**Problem:** Need to refresh data after mutation

**Solution:** Invalidate queries

```javascript
import { useQueryClient } from '@tanstack/vue-query';

const queryClient = useQueryClient();

// After update
await updateSensor(sensorId, newValue);
queryClient.invalidateQueries({ queryKey: ['sensors'] });
```

### Issue: TypeScript errors with .ts files

**Problem:** Can't import TypeScript files from JavaScript

**Solution:** Configure TypeScript support

```json
// tsconfig.json
{
  "compilerOptions": {
    "allowJs": true,
    "checkJs": false,
    // ...
  }
}
```

```javascript
// vue.config.js
chainWebpack: (config) => {
  config.resolve.extensions.prepend('.ts').prepend('.tsx');
  
  config.module
    .rule('ts')
    .test(/\.tsx?$/)
    .use('babel-loader')
    .loader('babel-loader')
    .end()
    .use('ts-loader')
    .loader('ts-loader')
    .options({
      appendTsSuffixTo: [/\.vue$/],
      transpileOnly: true,
    });
}
```

## Migration Checklist

- [ ] Install @tanstack/vue-query
- [ ] Set up VueQueryPlugin in main.js
- [ ] Create service layer (move API calls from store)
- [ ] Create query composable
- [ ] Update component to use query composable
- [ ] Remove Vuex/Pinia store (if only used for server state)
- [ ] Test loading states
- [ ] Test error states
- [ ] Test data fetching
- [ ] Test background refetching
- [ ] Verify caching works
- [ ] Check for duplicate requests (should be none!)

## Summary

**Before (Vuex):**
- ❌ 171 lines of complex store code
- ❌ Manual state management
- ❌ No automatic caching
- ❌ No background updates
- ❌ Not reusable

**After (TanStack Query):**
- ✅ 21 lines of simple code
- ✅ Automatic state management
- ✅ Automatic caching
- ✅ Automatic background updates
- ✅ Reusable for all pages

**Result:** 87% less code, 100% more features! 🎉

## Additional Resources

- [TanStack Query Documentation](https://tanstack.com/query/latest)
- [TANSTACK_QUERY_EXPLANATION.md](../../../TANSTACK_QUERY_EXPLANATION.md)
- [QUERY_KEY_DEEP_DIVE.md](../../../QUERY_KEY_DEEP_DIVE.md)
- [Sensors Implementation Example](../../../src/components/Composables/useSensorsQuery.js)