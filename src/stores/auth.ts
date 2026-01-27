import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import type { Session } from '@/api/model/Session';
import api from '@/store/api';
import { setAuthToken as setOrvalAuthToken } from '@/api/mutator/axios-instance';
import Cookies from 'js-cookie';

// Lazy import router to avoid circular dependency
// (router imports useAuthStore, so we can't import router at top level)
const getRouter = () => import('@/router').then((m) => m.default);

const shouldPersistAuthToken =
  import.meta.env.VITE_STORE_SESSION === 'true' ||
  import.meta.env.STORE_SESSION === 'true';

export const useAuthStore = defineStore('auth', () => {
  // State - Redfish-first naming
  const Session = ref<Session | null>(null);
  const sessionURI = ref<string | null>(localStorage.getItem('sessionURI'));
  const xsrfCookie = ref<string | undefined>(Cookies.get('XSRF-TOKEN'));
  const isAuthenticatedCookie = ref<string | undefined>(
    Cookies.get('IsAuthenticated'),
  );
  const xAuthToken = ref<string | null>(
    shouldPersistAuthToken ? Cookies.get('X-Auth-Token') || null : null,
  );
  const authError = ref<boolean>(false);
  const consoleWindow = ref<boolean | null>(null);

  // Getters
  const isLoggedIn = computed(
    () =>
      xsrfCookie.value !== undefined ||
      isAuthenticatedCookie.value === 'true' ||
      !!xAuthToken.value,
  );

  const UserName = computed(() => Session.value?.UserName ?? null);

  const Roles = computed(() =>
    (Session.value?.Roles ?? []).filter((r): r is string => r !== null),
  );

  // Token getter for WebSocket authentication
  const token = computed(() => xsrfCookie.value);

  // Actions
  async function login(
    username: string,
    password: string,
  ): Promise<{ Session: Session; passwordExpired: boolean }> {
    authError.value = false;

    try {
      const { headers, data } = await api.post(
        '/redfish/v1/SessionService/Sessions',
        {
          UserName: username,
          Password: password,
        },
      );

      // Update state from response
      const NewSession = data as Session;
      Session.value = NewSession;

      // Handle session URI from Location header
      const locationUri = headers['location'];
      if (locationUri) {
        sessionURI.value = locationUri;
        localStorage.setItem('sessionURI', locationUri);
      }

      // Update cookies
      xsrfCookie.value = Cookies.get('XSRF-TOKEN');
      isAuthenticatedCookie.value = Cookies.get('IsAuthenticated');

      // If no XSRF cookie, use X-Auth-Token header (non-bmcweb implementations)
      if (xsrfCookie.value === undefined) {
        const headerToken = headers['x-auth-token'];
        if (headerToken) {
          api.set_auth_token(headerToken);
          setOrvalAuthToken(headerToken);
          xAuthToken.value = headerToken;
        }
      }

      // Check if password is expired
      const passwordExpired = isPasswordExpiredResponse(data);

      return { Session: NewSession, passwordExpired };
    } catch (error) {
      authError.value = true;
      throw error;
    }
  }

  async function logout(navigate: boolean = true): Promise<void> {
    // Delete session on server if we have a session URI
    if (sessionURI.value) {
      try {
        await api.delete(sessionURI.value);
      } catch (e) {
        console.warn('Failed to delete session on server:', e);
      }
    }

    // Clear client state
    Session.value = null;
    sessionURI.value = null;
    xAuthToken.value = null;
    xsrfCookie.value = undefined;
    isAuthenticatedCookie.value = undefined;
    consoleWindow.value = false;

    // Clear cookies and storage
    Cookies.remove('XSRF-TOKEN');
    Cookies.remove('IsAuthenticated');
    api.set_auth_token(undefined);
    setOrvalAuthToken(null);
    localStorage.removeItem('sessionURI');
    localStorage.removeItem('storedUsername');

    // Navigate to login page
    if (navigate) {
      const router = await getRouter();
      router.push('/login');
    }
  }

  /**
   * Fetch session privilege from server (used on page refresh)
   * Restores Session data to Pinia store
   */
  async function getSessionPrivilege(): Promise<void> {
    if (!sessionURI.value) {
      throw new Error('No session URI available');
    }

    const { data } = await api.get(sessionURI.value);
    Session.value = data as Session;
  }

  function resetStoreState(): void {
    authError.value = false;
    xsrfCookie.value = Cookies.get('XSRF-TOKEN');
    isAuthenticatedCookie.value = Cookies.get('IsAuthenticated');
    if (shouldPersistAuthToken) {
      xAuthToken.value = Cookies.get('X-Auth-Token') || null;
    }
  }

  return {
    // State
    Session,
    sessionURI,
    xAuthToken,
    authError,
    consoleWindow,
    // Getters
    isLoggedIn,
    UserName,
    Roles,
    token,
    // Actions
    login,
    logout,
    resetStoreState,
    getSessionPrivilege,
  };
});

// Helper to check if password is expired from response
function isPasswordExpiredResponse(data: unknown): boolean {
  if (!data || typeof data !== 'object') return false;
  const extInfoMsgs = (data as Record<string, unknown>)?.['@Message.ExtendedInfo'];
  if (!Array.isArray(extInfoMsgs)) return false;

  return extInfoMsgs.some((msg) => {
    const messageId = msg?.MessageId;
    if (typeof messageId !== 'string') return false;
    const words = messageId.split('.');
    return words[words.length - 1] === 'PasswordChangeRequired' && words[0] === 'Base';
  });
}
