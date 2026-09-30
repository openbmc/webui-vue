import { defineComponent, h } from 'vue';
import { flushPromises, mount } from '@vue/test-utils';
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query';
import { beforeEach, describe, expect, test, vi } from 'vitest';

vi.mock('@/store/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

import api from '@/store/api';
import { useManager } from '@/api/composables/useManager';

const managerUri = '/redfish/v1/Managers/bmc';
const otherUri = '/redfish/v1/Managers/other';
const resetTarget = `${managerUri}/Actions/Manager.Reset`;

function serviceRoot(providingUri = managerUri) {
  return {
    data: {
      ManagerProvidingService: providingUri
        ? { '@odata.id': providingUri }
        : undefined,
    },
  };
}

function managerPayload(overrides = {}) {
  return {
    '@odata.id': managerUri,
    LastResetTime: '2020-01-02T03:04:05Z',
    Actions: {
      '#Manager.Reset': { target: resetTarget },
    },
    ...overrides,
  };
}

function mockGets({
  ServiceRoot = serviceRoot(),
  Manager = managerPayload(),
  Managers,
} = {}) {
  api.get.mockImplementation((url) => {
    if (url === '/redfish/v1/') return Promise.resolve(ServiceRoot);
    if (url === '/redfish/v1/Managers') {
      return Promise.resolve(
        Managers ?? { data: { Members: [{ '@odata.id': managerUri }] } },
      );
    }
    if (url === managerUri || url === otherUri) {
      const body = typeof Manager === 'function' ? Manager(url) : Manager;
      return Promise.resolve({ data: body });
    }
    return Promise.reject(new Error(`unexpected ${url}`));
  });
}

function mountReboot(queryClient = new QueryClient(), options) {
  let result;
  const wrapper = mount(
    defineComponent({
      setup() {
        result = useManager(options);
        return () => h('div');
      },
    }),
    {
      global: {
        plugins: [[VueQueryPlugin, { queryClient }]],
      },
    },
  );
  return { wrapper, result, queryClient };
}

beforeEach(() => {
  api.get.mockReset();
  api.post.mockReset();
});

describe('useManager', () => {
  test('does not reset when the BMC path cannot be resolved', async () => {
    mockGets({
      ServiceRoot: serviceRoot(null),
      Managers: { data: { Members: [] } },
    });
    const { result } = mountReboot();
    await flushPromises();

    expect(result.canReset.value).toBe(false);
    expect(result.Manager.value).toBe(null);
    expect(result.lastRebootTime.value).toBe(null);
    await expect(result.reset()).rejects.toThrow(
      'Manager resource not available',
    );
    expect(api.post).not.toHaveBeenCalled();
    expect(api.get.mock.calls.map((call) => call[0])).toEqual([
      '/redfish/v1/',
      '/redfish/v1/Managers',
    ]);
  });

  test('resets the manager from ManagerProvidingService', async () => {
    mockGets();
    api.post.mockResolvedValue({ data: {} });
    const { result } = mountReboot();

    await vi.waitFor(() => {
      expect(result.canReset.value).toBe(true);
    });

    expect(api.get.mock.calls.map((call) => call[0])).toEqual([
      '/redfish/v1/',
      managerUri,
    ]);
    expect(result.lastRebootTime.value?.toISOString()).toBe(
      '2020-01-02T03:04:05.000Z',
    );

    await result.reset();
    expect(api.post).toHaveBeenCalledWith(resetTarget, {
      ResetType: 'GracefulRestart',
    });
  });

  test('uses the first Managers member when ManagerProvidingService is absent', async () => {
    mockGets({ ServiceRoot: serviceRoot(null) });
    api.post.mockResolvedValue({ data: {} });
    const { result } = mountReboot();

    await vi.waitFor(() => expect(result.canReset.value).toBe(true));
    await result.reset();

    expect(api.get.mock.calls.map((call) => call[0])).toEqual([
      '/redfish/v1/',
      '/redfish/v1/Managers',
      managerUri,
    ]);
    expect(api.post).toHaveBeenCalledWith(resetTarget, {
      ResetType: 'GracefulRestart',
    });
  });

  test('does not reset a manager that does not match the BMC path', async () => {
    mockGets({
      Manager: managerPayload({
        '@odata.id': otherUri,
        Actions: {
          '#Manager.Reset': {
            target: `${otherUri}/Actions/Manager.Reset`,
          },
        },
      }),
    });
    const { result } = mountReboot();

    await vi.waitFor(() => expect(api.get).toHaveBeenCalledWith(
      managerUri,
      expect.any(Object),
    ));
    await flushPromises();

    expect(result.canReset.value).toBe(false);
    expect(result.Manager.value).toBe(null);
    expect(result.lastRebootTime.value).toBe(null);
    await expect(result.reset()).rejects.toThrow(
      'Manager resource not available',
    );
    expect(api.post).not.toHaveBeenCalled();
  });

  test('refetches LastResetTime on the next visit', async () => {
    let managerReads = 0;
    mockGets({
      Manager: () => {
        managerReads += 1;
        const lastReset =
          managerReads === 1
            ? '2020-01-02T03:04:05Z'
            : '2024-05-06T07:08:09Z';
        return managerPayload({ LastResetTime: lastReset });
      },
    });
    const queryClient = new QueryClient();
    const first = mountReboot(queryClient);

    await vi.waitFor(() =>
      expect(first.result.canReset.value).toBe(true),
    );
    expect(first.result.lastRebootTime.value?.toISOString()).toBe(
      '2020-01-02T03:04:05.000Z',
    );

    first.wrapper.unmount();
    const second = mountReboot(queryClient);

    await vi.waitFor(() =>
      expect(second.result.lastRebootTime.value?.toISOString()).toBe(
        '2024-05-06T07:08:09.000Z',
      ),
    );
    expect(managerReads).toBe(2);
    expect(api.post).not.toHaveBeenCalled();
  });

  test('resets the manager URI it is given', async () => {
    const target = `${otherUri}/Actions/Manager.Reset`;
    mockGets({
      Manager: managerPayload({
        '@odata.id': otherUri,
        Actions: { '#Manager.Reset': { target } },
      }),
    });
    api.post.mockResolvedValue({ data: {} });
    const { result } = mountReboot(new QueryClient(), { managerUri: otherUri });

    await vi.waitFor(() => expect(result.canReset.value).toBe(true));
    await result.reset();

    expect(api.get.mock.calls.map((call) => call[0])).toEqual([otherUri]);
    expect(api.post).toHaveBeenCalledWith(target, {
      ResetType: 'GracefulRestart',
    });
  });

  test('posts the requested ResetType', async () => {
    mockGets();
    api.post.mockResolvedValue({ data: {} });
    const { result } = mountReboot(new QueryClient(), {
      ResetType: 'ForceRestart',
    });

    await vi.waitFor(() => expect(result.canReset.value).toBe(true));
    await result.reset();

    expect(api.post).toHaveBeenCalledWith(resetTarget, {
      ResetType: 'ForceRestart',
    });
  });

  test('does not offer a ResetType the manager does not allow', async () => {
    mockGets({
      Manager: managerPayload({
        Actions: {
          '#Manager.Reset': {
            target: resetTarget,
            'ResetType@Redfish.AllowableValues': ['ForceRestart'],
          },
        },
      }),
    });
    const { result } = mountReboot();

    await vi.waitFor(() =>
      expect(api.get).toHaveBeenCalledWith(managerUri, expect.any(Object)),
    );
    await flushPromises();

    expect(result.allowableResetTypes()).toEqual(['ForceRestart']);
    expect(result.canReset.value).toBe(false);
    await expect(result.reset()).rejects.toThrow(
      'Manager resource not available',
    );
    expect(api.post).not.toHaveBeenCalled();
  });

  function mountStatic(setup) {
    return mount(
      defineComponent({
        setup,
      }),
      {
        global: {
          plugins: [[VueQueryPlugin, { queryClient: new QueryClient() }]],
        },
      },
    );
  }

  test('returns the service manager URI', async () => {
    mockGets();
    let result;
    mountStatic(() => {
      result = useManager.ManagerProvidingService();
      return () => h('div');
    });

    await vi.waitFor(() => expect(result.data.value).toBe(managerUri));
    expect(api.get.mock.calls.map((call) => call[0])).toEqual(['/redfish/v1/']);
  });

  test('uses the first Managers member when ManagerProvidingService is absent on the static call', async () => {
    mockGets({ ServiceRoot: serviceRoot(null) });
    let result;
    mountStatic(() => {
      result = useManager.ManagerProvidingService();
      return () => h('div');
    });

    await vi.waitFor(() => expect(result.data.value).toBe(managerUri));
    expect(api.get.mock.calls.map((call) => call[0])).toEqual([
      '/redfish/v1/',
      '/redfish/v1/Managers',
    ]);
  });

  test('loads Managers from ServiceRoot without a caller-supplied URI', async () => {
    const hmc = managerPayload({
      '@odata.id': otherUri,
      Id: 'hmc',
    });
    api.get.mockImplementation((url) => {
      if (url === '/redfish/v1/') {
        return Promise.resolve({
          data: {
            Managers: { '@odata.id': '/redfish/v1/Managers' },
            ProtocolFeaturesSupported: { ExpandQuery: { MaxLevels: 1 } },
          },
        });
      }
      if (String(url).startsWith('/redfish/v1/Managers')) {
        return Promise.resolve({
          data: { Members: [managerPayload(), hmc] },
        });
      }
      return Promise.reject(new Error(`unexpected ${url}`));
    });

    let result;
    mount(
      defineComponent({
        setup() {
          result = useManager.Managers();
          return () => h('div');
        },
      }),
      {
        global: {
          plugins: [[VueQueryPlugin, { queryClient: new QueryClient() }]],
        },
      },
    );

    await vi.waitFor(() => expect(result.data.value).toHaveLength(2));
    expect(result.data.value[1].Id).toBe('hmc');
    expect(api.post).not.toHaveBeenCalled();
  });

  test('falls back to the conventional Reset action path', async () => {
    mockGets({ Manager: managerPayload({ Actions: undefined }) });
    api.post.mockResolvedValue({ data: {} });
    const { result } = mountReboot();

    await vi.waitFor(() => expect(result.canReset.value).toBe(true));
    expect(result.allowableResetTypes()).toEqual([]);
    await result.reset();

    expect(api.post).toHaveBeenCalledWith(resetTarget, {
      ResetType: 'GracefulRestart',
    });
  });
});
