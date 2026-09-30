import { vi } from 'vitest';
import Cookies from 'js-cookie';

async function loadClient() {
  vi.resetModules();
  return import('@/api/client');
}

describe('X-Auth-Token persistence', () => {
  beforeEach(() => {
    Cookies.remove('X-Auth-Token');
    vi.unstubAllEnvs();
  });

  test('set_auth_token follows configureApiClient even when the env var is set', async () => {
    vi.stubEnv('VITE_STORE_SESSION', 'true');
    const { configureApiClient, default: api, apiInstance } = await loadClient();

    configureApiClient({}, { shouldPersistAuthToken: false });
    api.set_auth_token('secret');

    expect(Cookies.get('X-Auth-Token')).toBeUndefined();
    expect(apiInstance.defaults.headers.common['X-Auth-Token']).toBe('secret');

    api.set_auth_token(null);
    expect(apiInstance.defaults.headers.common['X-Auth-Token']).toBeUndefined();
  });

  test('set_auth_token writes the cookie when persistence is enabled', async () => {
    vi.stubEnv('VITE_STORE_SESSION', 'false');
    const { configureApiClient, default: api } = await loadClient();

    configureApiClient({}, { shouldPersistAuthToken: true });
    api.set_auth_token('secret');

    expect(Cookies.get('X-Auth-Token')).toBe('secret');

    api.set_auth_token(null);
    expect(Cookies.get('X-Auth-Token')).toBeUndefined();
  });
});
