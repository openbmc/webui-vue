import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import api from '@/store/api';
import { shouldRetry } from '@/api/composables/useAllSubResources';

/**
 * Session data from Redfish API
 * Using Redfish property names directly (no translation layer)
 */
interface Session {
  Id: string;
  Description: string;
  Name: string;
  Oem?: {
    OpenBMC?: {
      '@odata.type': string;
      ClientOriginIPAddress?: string;
    };
  };
  UserName: string;
  '@odata.id': string;
  '@odata.type': string;
  Context?: string;
  ClientOriginIPAddress?: string;
  uri?: string;
}

export type { Session };

export interface DisconnectResult {
  successCount: number;
  errorCount: number;
}

/**
 * Query key for sessions data
 */
export const sessionsQueryKey = ['redfish', 'sessions'] as const;

/**
 * Composable for fetching all active sessions
 * Uses TanStack Query for caching and state management
 *
 * @returns TanStack Query result with sessions data
 */
export function useSessions() {
  return useQuery({
    queryKey: sessionsQueryKey,
    queryFn: async (): Promise<Session[]> => {
      const response = await api.get<{
        Members: Array<{ '@odata.id': string }>;
      }>('/redfish/v1/SessionService/Sessions');
      const sessionUris = response.data.Members.map(
        (session: { '@odata.id': string }) => session['@odata.id'],
      );
      const sessionResponses = (await api.all(
        sessionUris.map((uri: string) => api.get(uri)),
      )) as Array<{ data: Session }>;

      // Return Redfish data directly without translation
      return sessionResponses.map((sessionResponse, index) => {
        const session = sessionResponse.data;
        return {
          ...session,
          // Ensure the URI is present even if missing in individual response
          '@odata.id': session['@odata.id'] || sessionUris[index],
          // Add uri alias for easier access in JS
          uri: session['@odata.id'] || sessionUris[index],
        };
      });
    },
    staleTime: 30000, // 30 seconds - data is considered fresh for this duration
    gcTime: 300000, // Keep in cache for 5 minutes after component unmount
    refetchOnMount: true, // Refetch when component remounts
    refetchOnWindowFocus: true, // Refetch when window regains focus
    refetchOnReconnect: true, // Refetch on network reconnect
    placeholderData: (prev) => prev, // Keep previous data while refetching
    retry: shouldRetry, // Smart retry logic (skips 4xx errors)
    retryDelay: (attemptIndex: number) =>
      Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

/**
 * Composable for disconnecting sessions
 * Uses TanStack Query mutation for optimistic updates
 *
 * @returns TanStack Query mutation for disconnecting sessions
 */
export function useDisconnectSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (uris: string[]): Promise<DisconnectResult> => {
      const promises = uris.map((uri) =>
        api.delete(uri).catch((error: unknown) => {
          console.error(error);
          throw error;
        }),
      );
      const results = await Promise.allSettled(promises);
      const successCount = results.filter((r) => r.status === 'fulfilled')
        .length;
      const errorCount = results.filter((r) => r.status === 'rejected').length;
      return { successCount, errorCount };
    },
    onSuccess: (result, uris) => {
      // Optimistic update: remove deleted sessions immediately
      queryClient.setQueryData(sessionsQueryKey, (old: Session[] | undefined) => {
        if (!old) return [];
        return old.filter((s) => !uris.includes(s['@odata.id']));
      });
      // Then invalidate for server sync
      queryClient.invalidateQueries({ queryKey: sessionsQueryKey });
    },
  });
}
