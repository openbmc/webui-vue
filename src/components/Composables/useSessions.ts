import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import api from '@/store/api';

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
}

export type { Session };

export interface DisconnectResult {
    successCount: number;
    errorCount: number;
}

export const useSessions = () => {
    return useQuery({
        queryKey: ['sessions'],
        queryFn: async (): Promise<Session[]> => {
            const response = await api.get('/redfish/v1/SessionService/Sessions');
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
        placeholderData: (prev) => prev,
    });
};

export const useDisconnectSession = () => {
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
            queryClient.setQueryData(['sessions'], (old: Session[] | undefined) => {
                if (!old) return [];
                return old.filter((s) => !uris.includes(s['@odata.id']));
            });
            // Then invalidate for server sync
            queryClient.invalidateQueries({ queryKey: ['sessions'] });
        },
    });
};
