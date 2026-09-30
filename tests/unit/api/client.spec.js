import { vi } from 'vitest';
import {
  apiInstance,
  clearRedfishGetCache,
  REDFISH_GET_CACHE_PREFIX,
} from '@/api/client';
import AuthenticationStore from '@/store/modules/Authentication/AuthenticanStore';

vi.mock('@/router', () => ({
  default: { push: vi.fn() },
}));
vi.mock('@/router/routes', () => ({
  roles: { administrator: 'Administrator' },
}));

function cacheBlob() {
  return Object.keys(localStorage)
    .filter((key) => key.startsWith(REDFISH_GET_CACHE_PREFIX))
    .map((key) => localStorage.getItem(key))
    .join('\n');
}

function adapterReturning(data) {
  return (config) =>
    Promise.resolve({
      data,
      status: 200,
      statusText: 'OK',
      headers: { etag: '"etag"' },
      config,
    });
}

const taskBody = {
  Id: '1',
  Payload: {
    HttpOperation: 'POST',
    TargetUri: '/redfish/v1/AccountService/Accounts',
    JsonBody: '{"Password":"secret"}',
  },
};

describe('Redfish GET cache', () => {
  beforeEach(() => {
    clearRedfishGetCache();
  });

  test('task GET drops JsonBody before the body is persisted', async () => {
    const response = await apiInstance.get('/redfish/v1/TaskService/Tasks/1', {
      adapter: adapterReturning(structuredClone(taskBody)),
    });

    expect(response.data.Payload.JsonBody).toBeUndefined();
    expect(response.data.Payload.HttpOperation).toBe('POST');
    expect(response.data.Payload.TargetUri).toContain('AccountService');
    expect(cacheBlob()).not.toContain('secret');
    expect(cacheBlob()).toContain('POST');
  });

  test('expanded task collection members lose JsonBody too', async () => {
    const response = await apiInstance.get(
      '/redfish/v1/TaskService/Tasks?$expand=.($levels=1)',
      {
        adapter: adapterReturning({
          Members: [structuredClone(taskBody), { '@odata.id': '/redfish/v1/TaskService/Tasks/2' }],
        }),
      },
    );

    expect(response.data.Members[0].Payload.JsonBody).toBeUndefined();
    expect(response.data.Members[0].Payload.HttpOperation).toBe('POST');
    expect(response.data.Members[1]['@odata.id']).toContain('/Tasks/2');
    expect(cacheBlob()).not.toContain('secret');
  });

  test('task monitor GET drops JsonBody', async () => {
    const response = await apiInstance.get(
      '/redfish/v1/TaskService/TaskMonitors/1',
      { adapter: adapterReturning(structuredClone(taskBody)) },
    );

    expect(response.data.Payload.JsonBody).toBeUndefined();
    expect(cacheBlob()).not.toContain('secret');
  });

  test('other resources keep their response body', async () => {
    const response = await apiInstance.get(
      '/redfish/v1/AccountService/Accounts/1',
      { adapter: adapterReturning(structuredClone(taskBody)) },
    );

    expect(response.data.Payload.JsonBody).toContain('secret');
    expect(cacheBlob()).toContain('secret');
  });

  test('clearRedfishGetCache removes only the etag prefix', () => {
    localStorage.setItem(`${REDFISH_GET_CACHE_PREFIX}abc`, '{"Password":"secret"}');
    localStorage.setItem('sessionURI', '/redfish/v1/SessionService/Sessions/1');

    clearRedfishGetCache();

    expect(localStorage.getItem(`${REDFISH_GET_CACHE_PREFIX}abc`)).toBeNull();
    expect(localStorage.getItem('sessionURI')).toBe(
      '/redfish/v1/SessionService/Sessions/1',
    );
  });

  test('logout drops the etag cache with the session', () => {
    localStorage.setItem(`${REDFISH_GET_CACHE_PREFIX}abc`, '{"Password":"secret"}');
    localStorage.setItem('sessionURI', '/redfish/v1/SessionService/Sessions/1');
    localStorage.setItem('storedUsername', 'alice');

    AuthenticationStore.mutations.logout({
      xsrfCookie: 'x',
      isAuthenticatedCookie: 'true',
      sessionURI: '/redfish/v1/SessionService/Sessions/1',
      xAuthToken: 'tok',
      consoleWindow: false,
      authError: false,
    });

    expect(localStorage.getItem(`${REDFISH_GET_CACHE_PREFIX}abc`)).toBeNull();
    expect(localStorage.getItem('sessionURI')).toBeNull();
    expect(localStorage.getItem('storedUsername')).toBeNull();
  });
});
