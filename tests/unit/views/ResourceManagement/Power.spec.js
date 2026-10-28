import { mount, flushPromises } from '@vue/test-utils';
import { ref } from 'vue';
import { vi } from 'vitest';
import Power from '@/views/ResourceManagement/Power';
import { bootstrapStubs } from '../../testUtils';

const mocks = vi.hoisted(() => ({
  state: null,
  submitPowerControl: vi.fn(),
}));

vi.mock('@/components/Composables/usePowerControl', async () => {
  const { ref, computed } = await import('vue');
  return {
    usePowerControl: () => {
      const s = mocks.state;
      return {
        powerConsumptionValue: computed(
          () => s.environmentMetrics.value?.PowerWatts?.Reading ?? null,
        ),
        powerCapMin: computed(
          () =>
            s.environmentMetrics.value?.PowerLimitWatts?.AllowableMin ?? null,
        ),
        powerCapMax: computed(
          () =>
            s.environmentMetrics.value?.PowerLimitWatts?.AllowableMax ?? null,
        ),
        environmentMetrics: s.environmentMetrics,
        submitPowerControl: mocks.submitPowerControl,
        metricsQuery: { isLoading: ref(false), isError: ref(false) },
        mutation: { isPending: ref(false) },
      };
    },
  };
});
vi.mock('@/components/Composables/useToast', () => ({
  useToast: () => ({ successToast: vi.fn(), errorToast: vi.fn() }),
}));
vi.mock('@/components/Composables/useLoadingBar', () => ({
  useLoadingBar: () => ({
    startLoader: vi.fn(),
    endLoader: vi.fn(),
    hideLoader: vi.fn(),
  }),
}));

function metrics(powerLimitWatts = {}) {
  return {
    '@odata.id': '/redfish/v1/Chassis/chassis/EnvironmentMetrics',
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

function mountPower(environmentMetrics = metrics()) {
  mocks.state = { environmentMetrics: ref(environmentMetrics) };
  return mount(Power, {
    global: {
      stubs: {
        ...bootstrapStubs,
        // Forward the native submit event so `@submit.prevent` works
        'b-form': {
          template: '<form @submit="$emit(\'submit\', $event)"><slot /></form>',
          emits: ['submit'],
        },
        'page-title': true,
      },
    },
  });
}

const checkbox = (w) =>
  w.find('[data-test-id="power-checkbox-togglePowerCapField"] input');
const input = (w) => w.find('[data-test-id="power-input-powerCapValue"]');
const submit = async (w) => {
  await w.find('form').trigger('submit');
  await flushPromises();
};

describe('Power.vue', () => {
  let wrapper;

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.submitPowerControl.mockResolvedValue(undefined);
  });

  afterEach(() => wrapper?.unmount());

  describe('dirty-sync from server data', () => {
    it('enables the field with the server SetPoint for active modes', async () => {
      wrapper = mountPower();
      await flushPromises();
      expect(checkbox(wrapper).element.checked).toBe(true);
      expect(input(wrapper).element.value).toBe('500');
    });

    it.each(['Manual', 'Override'])(
      'treats %s as an enabled power cap',
      async (mode) => {
        wrapper = mountPower(metrics({ ControlMode: mode }));
        await flushPromises();
        expect(checkbox(wrapper).element.checked).toBe(true);
      },
    );

    it('disables the field when ControlMode is Disabled', async () => {
      wrapper = mountPower(metrics({ ControlMode: 'Disabled' }));
      await flushPromises();
      expect(checkbox(wrapper).element.checked).toBe(false);
    });

    it('syncs the form when server data arrives after mount', async () => {
      wrapper = mountPower(null);
      await flushPromises();
      expect(checkbox(wrapper).element.checked).toBe(false);

      mocks.state.environmentMetrics.value = metrics({ SetPoint: 300 });
      await flushPromises();

      expect(checkbox(wrapper).element.checked).toBe(true);
      expect(input(wrapper).element.value).toBe('300');
    });

    it('picks up server changes while the form is pristine', async () => {
      wrapper = mountPower();
      await flushPromises();

      mocks.state.environmentMetrics.value = metrics({ SetPoint: 300 });
      await flushPromises();

      expect(input(wrapper).element.value).toBe('300');
    });

    it('does not overwrite in-progress edits when data refreshes', async () => {
      wrapper = mountPower();
      await flushPromises();

      // An invalid submit touches the form (dirty) without resetting it
      await input(wrapper).setValue('5000');
      await submit(wrapper);
      expect(mocks.submitPowerControl).not.toHaveBeenCalled();

      await input(wrapper).setValue('800');
      mocks.state.environmentMetrics.value = metrics({ SetPoint: 300 });
      await flushPromises();

      expect(input(wrapper).element.value).toBe('800');
    });
  });

  describe('checkbox caching', () => {
    it('restores the previously entered value when re-enabled', async () => {
      wrapper = mountPower();
      await flushPromises();

      await checkbox(wrapper).setValue(false);
      expect(input(wrapper).element.value).toBe('');

      await checkbox(wrapper).setValue(true);
      expect(input(wrapper).element.value).toBe('500');
    });

    it('restores the edited value, not the server value, when re-enabled', async () => {
      wrapper = mountPower();
      await flushPromises();

      await input(wrapper).setValue('700');
      await checkbox(wrapper).setValue(false);
      await checkbox(wrapper).setValue(true);

      expect(input(wrapper).element.value).toBe('700');
    });

    it('falls back to the server SetPoint when nothing is cached', async () => {
      wrapper = mountPower(metrics({ ControlMode: 'Disabled', SetPoint: 400 }));
      await flushPromises();

      await checkbox(wrapper).setValue(true);
      expect(input(wrapper).element.value).toBe('400');
    });
  });

  describe('validation', () => {
    it.each([
      ['below the minimum', '50'],
      ['above the maximum', '5000'],
      ['not a number', 'abc'],
    ])('blocks submit when the value is %s', async (_label, value) => {
      wrapper = mountPower();
      await flushPromises();

      await input(wrapper).setValue(value);
      await submit(wrapper);

      expect(mocks.submitPowerControl).not.toHaveBeenCalled();
    });

    it('blocks submit when the enabled field is empty', async () => {
      wrapper = mountPower();
      await flushPromises();

      await input(wrapper).setValue('');
      await submit(wrapper);

      expect(mocks.submitPowerControl).not.toHaveBeenCalled();
    });

    it('accepts values at the allowable boundaries', async () => {
      wrapper = mountPower();
      await flushPromises();

      for (const value of ['100', '1000']) {
        await input(wrapper).setValue(value);
        await submit(wrapper);
      }

      expect(mocks.submitPowerControl).toHaveBeenNthCalledWith(1, 100, true);
      expect(mocks.submitPowerControl).toHaveBeenNthCalledWith(2, 1000, true);
    });

    it('uses the default 1-10000 range when no limits are reported', async () => {
      wrapper = mountPower(
        metrics({ AllowableMin: undefined, AllowableMax: undefined }),
      );
      await flushPromises();

      for (const value of ['0', '10001']) {
        await input(wrapper).setValue(value);
        await submit(wrapper);
      }
      expect(mocks.submitPowerControl).not.toHaveBeenCalled();

      await input(wrapper).setValue('10000');
      await submit(wrapper);
      expect(mocks.submitPowerControl).toHaveBeenCalledWith(10000, true);
    });

    it('does not validate the range while the cap is disabled', async () => {
      wrapper = mountPower();
      await flushPromises();

      await checkbox(wrapper).setValue(false);
      await submit(wrapper);

      expect(mocks.submitPowerControl).toHaveBeenCalledWith(null, false);
    });

    it('clears validation errors when the cap is turned off', async () => {
      wrapper = mountPower();
      await flushPromises();

      await input(wrapper).setValue('5000');
      await submit(wrapper);
      expect(wrapper.text()).toContain('global.form.invalidValue');

      await checkbox(wrapper).setValue(false);
      expect(wrapper.text()).not.toContain('global.form.invalidValue');
    });

    it('shows the matching message for required and out-of-range errors', async () => {
      wrapper = mountPower();
      await flushPromises();

      await input(wrapper).setValue('');
      await submit(wrapper);
      expect(wrapper.text()).toContain('global.form.fieldRequired');

      await input(wrapper).setValue('5000');
      await submit(wrapper);
      expect(wrapper.text()).toContain('global.form.invalidValue');
      expect(wrapper.text()).not.toContain('global.form.fieldRequired');
    });
  });
});
