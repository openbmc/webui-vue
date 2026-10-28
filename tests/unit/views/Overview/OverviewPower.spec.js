import { mount } from '@vue/test-utils';
import { ref, nextTick } from 'vue';
import { vi } from 'vitest';
import OverviewPower from '@/views/Overview/OverviewPower';
import eventBus from '@/eventBus';

const mocks = vi.hoisted(() => ({ state: null }));

vi.mock('@/components/Composables/usePowerControl', () => ({
  usePowerControl: () => {
    const s = mocks.state;
    return {
      powerConsumptionValue: ref(null),
      environmentMetrics: ref(null),
      environmentMetricsUri: s.environmentMetricsUri,
      chassisQuery: { isFetched: s.chassisFetched },
      metricsQuery: {
        isFetched: s.metricsFetched,
        isFetching: s.metricsFetching,
      },
    };
  },
}));

function setState(overrides = {}) {
  mocks.state = {
    environmentMetricsUri: ref('/redfish/v1/Chassis/c/EnvironmentMetrics'),
    chassisFetched: ref(false),
    metricsFetched: ref(false),
    metricsFetching: ref(false),
    ...overrides,
  };
  return mocks.state;
}

function mountCard() {
  return mount(OverviewPower, {
    global: {
      stubs: {
        'overview-card': { template: '<div><slot /></div>' },
        'b-row': { template: '<div><slot /></div>' },
        'b-col': { template: '<div><slot /></div>' },
      },
    },
  });
}

describe('OverviewPower.vue settled / emit logic', () => {
  let wrapper;
  let handler;

  beforeEach(() => {
    handler = vi.fn();
    eventBus.$on('overview-power-complete', handler);
  });

  afterEach(() => {
    eventBus.$off('overview-power-complete', handler);
    wrapper?.unmount();
  });

  it('does not emit before the chassis collection is fetched', async () => {
    setState();
    wrapper = mountCard();
    await nextTick();
    expect(handler).not.toHaveBeenCalled();
  });

  it('does not emit while the metrics query is still pending', async () => {
    setState({ chassisFetched: ref(true) });
    wrapper = mountCard();
    await nextTick();
    expect(handler).not.toHaveBeenCalled();
  });

  it('does not emit while the metrics query is refetching', async () => {
    setState({
      chassisFetched: ref(true),
      metricsFetched: ref(true),
      metricsFetching: ref(true),
    });
    wrapper = mountCard();
    await nextTick();
    expect(handler).not.toHaveBeenCalled();
  });

  it('emits once the metrics query has completed', async () => {
    const s = setState({ chassisFetched: ref(true) });
    wrapper = mountCard();
    await nextTick();
    expect(handler).not.toHaveBeenCalled();

    s.metricsFetched.value = true;
    await nextTick();
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('emits when no chassis exposes EnvironmentMetrics', async () => {
    setState({
      chassisFetched: ref(true),
      environmentMetricsUri: ref(null),
    });
    wrapper = mountCard();
    await nextTick();
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('emits only once across later refetches', async () => {
    const s = setState({
      chassisFetched: ref(true),
      metricsFetched: ref(true),
    });
    wrapper = mountCard();
    await nextTick();
    expect(handler).toHaveBeenCalledTimes(1);

    s.metricsFetching.value = true;
    await nextTick();
    s.metricsFetching.value = false;
    await nextTick();
    expect(handler).toHaveBeenCalledTimes(1);
  });
});
