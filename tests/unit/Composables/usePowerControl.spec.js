import { mount, flushPromises } from '@vue/test-utils';
import { defineComponent, ref } from 'vue';
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query';
import { vi } from 'vitest';
import api from '@/store/api';
import {
  usePowerControl,
  powerControlQueryKey,
} from '@/components/Composables/usePowerControl';

vi.mock('@/store/api', () => ({
  default: { get: vi.fn(), patch: vi.fn() },
}));
vi.mock('@/api/composables/useRedfishRoot', () => ({
  useRedfishRoot: vi.fn(),
}));

const chassisData = ref([]);
vi.mock('@/api/composables/useRedfishCollection', () => ({
  useRedfishCollection: () => ({ data: chassisData }),
}));

const METRICS_URI = '/redfish/v1/Chassis/chassis/EnvironmentMetrics';

function metrics(powerLimitWatts = {}) {
  return {
    '@odata.id': METRICS_URI,
    PowerWatts: { Reading: 250 },
    PowerLimitWatts: {
      AllowableMin: 100,
      AllowableMax: 1000,
      ControlMode: 'Automatic',
      SetPoint: 500,
      ...powerLimitWatts,
    },
  };
}

async function setup(metricsResponse = metrics()) {
  api.get.mockResolvedValue({ data: metricsResponse });
  api.patch.mockResolvedValue({ data: {} });

  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  let result;
  const Host = defineComponent({
    setup() {
      result = usePowerControl();
      return () => null;
    },
  });
  mount(Host, {
    global: { plugins: [[VueQueryPlugin, { queryClient }]] },
  });
  await flushPromises();
  return { result, queryClient };
}

describe('usePowerControl', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    chassisData.value = [
      { '@odata.id': '/redfish/v1/Chassis/other' },
      {
        '@odata.id': '/redfish/v1/Chassis/chassis',
        EnvironmentMetrics: { '@odata.id': METRICS_URI },
      },
    ];
  });

  it('keys the metrics query by the EnvironmentMetrics URI', async () => {
    const { queryClient } = await setup();
    const queries = queryClient
      .getQueryCache()
      .findAll({ queryKey: powerControlQueryKey });
    expect(queries).toHaveLength(1);
    expect(queries[0].queryKey).toEqual([...powerControlQueryKey, METRICS_URI]);
  });

  describe('submitPowerControl PATCH payload', () => {
    it('sends SetPoint and keeps Automatic when enabling', async () => {
      const { result } = await setup();
      await result.submitPowerControl(600, true);
      expect(api.patch).toHaveBeenCalledWith(METRICS_URI, {
        PowerLimitWatts: { ControlMode: 'Automatic', SetPoint: 600 },
      });
    });

    it.each(['Manual', 'Override'])(
      'preserves the %s control mode when enabling',
      async (mode) => {
        const { result } = await setup(metrics({ ControlMode: mode }));
        await result.submitPowerControl(600, true);
        expect(api.patch).toHaveBeenCalledWith(METRICS_URI, {
          PowerLimitWatts: { ControlMode: mode, SetPoint: 600 },
        });
      },
    );

    it('defaults to Automatic when enabling from Disabled', async () => {
      const { result } = await setup(metrics({ ControlMode: 'Disabled' }));
      await result.submitPowerControl(600, true);
      expect(api.patch).toHaveBeenCalledWith(METRICS_URI, {
        PowerLimitWatts: { ControlMode: 'Automatic', SetPoint: 600 },
      });
    });

    it('disables without a SetPoint', async () => {
      const { result } = await setup();
      await result.submitPowerControl(600, false);
      expect(api.patch).toHaveBeenCalledWith(METRICS_URI, {
        PowerLimitWatts: { ControlMode: 'Disabled' },
      });
    });

    it('omits SetPoint when enabling with a null value', async () => {
      const { result } = await setup();
      await result.submitPowerControl(null, true);
      expect(api.patch).toHaveBeenCalledWith(METRICS_URI, {
        PowerLimitWatts: { ControlMode: 'Automatic' },
      });
    });
  });
});
