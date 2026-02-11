import { useMutation, useQueryClient } from '@tanstack/vue-query';
import api from '@/store/api';
import { useRedfishCollection } from '@/api/composables/useRedfishCollection';
import type { Session } from '@/api/types/redfish';

export type { Session };

export const SESSIONS_COLLECTION_PATH =
  '/redfish/v1/SessionService/Sessions' as const;

export interface DisconnectResult {
  successCount: number;
  errorCount: number;
  /** True when the caller's own session was among those actually disconnected. */
  currentDisconnected: boolean;
}

/**
 * Active Redfish sessions with $expand fallback via useRedfishCollection.
 */
export function useSessions() {
  return useRedfishCollection<Session>(SESSIONS_COLLECTION_PATH, {
    expand: true,
    expandLevels: 1,
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
    mutationFn: async ({
      uris,
      currentSessionUri,
    }: {
      uris: string[];
      currentSessionUri?: string | null;
    }): Promise<DisconnectResult> => {
      // Delete every other session first and wait for them to settle while we
      // still hold a valid token, then delete the current session last. Firing
      // them all at once could 401 the sibling requests if our own session is
      // torn down first.
      const deletesCurrent =
        !!currentSessionUri && uris.includes(currentSessionUri);
      const otherUris = deletesCurrent
        ? uris.filter((uri) => uri !== currentSessionUri)
        : uris;

      const settled = await Promise.allSettled(
        otherUris.map((uri) => api.delete(uri)),
      );

      let currentDisconnected = false;
      if (deletesCurrent && currentSessionUri) {
        const [currentResult] = await Promise.allSettled([
          api.delete(currentSessionUri),
        ]);
        settled.push(currentResult);
        currentDisconnected = currentResult.status === 'fulfilled';
      }

      const successCount = settled.filter(
        (r) => r.status === 'fulfilled',
      ).length;
      const errorCount = settled.filter((r) => r.status === 'rejected').length;

      // Surface a total failure to the caller's onError. Partial failures are
      // reported through the counts in onSuccess.
      if (successCount === 0 && errorCount > 0) {
        throw new Error(`Failed to disconnect ${errorCount} session(s)`);
      }

      return { successCount, errorCount, currentDisconnected };
    },
    onSuccess: (result, { uris }) => {
      queryClient.setQueriesData(
        { queryKey: ['redfish', 'collection', SESSIONS_COLLECTION_PATH] },
        (old: Session[] | undefined) => {
          if (!old) return [];
          return old.filter((session) => !uris.includes(session['@odata.id']));
        },
      );
      // When we disconnected our own session the token is now invalid; skip the
      // refetch (it would 401) and let the view drive a clean sign-out instead.
      if (!result.currentDisconnected) {
        queryClient.invalidateQueries({
          queryKey: ['redfish', 'collection', SESSIONS_COLLECTION_PATH],
        });
      }
    },
  });
}
