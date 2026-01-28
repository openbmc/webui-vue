import { useQuery } from '@tanstack/vue-query';
import { getAllSensors } from '@/api/services/sensorsService';

/**
 * TanStack Query hook for fetching all sensors data
 *
 * Query Key Structure: ['sensors']
 * - Simple key since we're fetching all sensors across all chassis
 *
 * @returns {Object} TanStack Query result object
 * @property {Array} data - Array of sensor objects
 * @property {boolean} isLoading - True while initial fetch is in progress
 * @property {boolean} isFetching - True while any fetch is in progress (including background refetch)
 * @property {boolean} isError - True if the query encountered an error
 * @property {Error} error - The error object if isError is true
 * @property {Function} refetch - Function to manually trigger a refetch
 */
export function useSensorsQuery() {
  return useQuery({
    queryKey: ['sensors'],
    queryFn: getAllSensors,
    staleTime: 30000, // Consider data fresh for 30 seconds
    cacheTime: 300000, // Keep unused data in cache for 5 minutes
    refetchOnWindowFocus: true, // Refetch when user returns to the tab
    refetchOnReconnect: true, // Refetch when network reconnects
    retry: 2, // Retry failed requests twice
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });
}
