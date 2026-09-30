import { vi } from 'vitest';

const { dispatch } = vi.hoisted(() => ({
  dispatch: vi.fn(() => Promise.resolve(true)),
}));

vi.mock('@/store', () => ({
  default: {
    state: {
      authentication: {
        sessionURI: '/redfish/v1/SessionService/Sessions/1',
        authError: false,
      },
    },
    getters: {
      'authentication/isLoggedIn': true,
      'authentication/token': 'xsrf-token',
    },
    dispatch,
  },
}));

import { useAuthStore } from '@/stores/auth';

describe('useAuthStore', () => {
  beforeEach(() => {
    dispatch.mockClear();
    dispatch.mockImplementation(() => Promise.resolve(true));
  });

  test('reads session state from the Vuex authentication module', () => {
    const authStore = useAuthStore();

    expect(authStore.sessionURI).toBe('/redfish/v1/SessionService/Sessions/1');
    expect(authStore.isLoggedIn).toBe(true);
    expect(authStore.authError).toBe(false);
    expect(authStore.token).toBe('xsrf-token');
  });

  test('logout returns the authentication action promise', async () => {
    let resolveLogout;
    dispatch.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveLogout = resolve;
        }),
    );

    const pending = useAuthStore().logout();
    let settled = false;
    pending.then(() => {
      settled = true;
    });

    expect(dispatch).toHaveBeenCalledWith('authentication/logout');
    expect(settled).toBe(false);

    resolveLogout();
    await pending;
    expect(settled).toBe(true);
  });

  test('login forwards credentials and the password-expired result', async () => {
    dispatch.mockResolvedValue(true);

    const passwordExpired = await useAuthStore().login('root', '0penBmc');

    expect(dispatch).toHaveBeenCalledWith('authentication/login', {
      username: 'root',
      password: '0penBmc',
    });
    expect(passwordExpired).toBe(true);
  });
});
