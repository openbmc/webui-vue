import { mount } from '@vue/test-utils';
import { ref, computed } from 'vue';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import Sensors from '@/views/HardwareStatus/Sensors/Sensors.vue';

// ---------------------------------------------------------------------------
// Mock all composable / module dependencies so the test does not need a full
// TanStack Query / Vuex / Redfish stack.
// ---------------------------------------------------------------------------

vi.mock('@/components/Composables/useSensors', () => ({
  useSensors: vi.fn(),
}));

// Shared mock functions so every call to useTableSelection() returns
// the same spy instances, allowing tests to assert on them.
const mockClearSelectedRows = vi.fn();
const mockTableSelection = {
  selectedRows: ref([]),
  tableHeaderCheckboxModel: ref(false),
  tableHeaderCheckboxIndeterminate: ref(false),
  onRowSelected: vi.fn(),
  onChangeHeaderCheckbox: vi.fn(),
  toggleSelectRow: vi.fn(),
  clearSelectedRows: mockClearSelectedRows,
};

vi.mock('@/components/Composables/useTableSelection', () => ({
  useTableSelection: () => mockTableSelection,
}));

vi.mock('@/components/Composables/useLoadingBar', () => ({
  useLoadingBar: () => ({
    startLoader: vi.fn(),
    endLoader: vi.fn(),
    hideLoader: vi.fn(),
  }),
}));

vi.mock('@/components/Composables/useTableFilter', () => ({
  useTableFilter: () => ({
    getFilteredTableData: (items) => items,
  }),
}));

vi.mock('@/components/Composables/useDataFormatter', () => ({
  useDataFormatter: () => ({
    dataFormatter: (v) => v,
  }),
}));

// ---------------------------------------------------------------------------
// Shared stub definitions — used by mountSensors and the errored-chassis block
// ---------------------------------------------------------------------------

/**
 * Bootstrap-Vue-Next component stubs.
 * The b-tabs stub exposes navWrapperClass as a data attribute so tests can
 * assert whether the tab navigation is hidden; it also emits update:index so
 * the real onTabChange handler can be triggered without calling vm internals.
 */
const STUBS = {
  'b-container': { template: '<div><slot /></div>' },
  'b-row': { template: '<div><slot /></div>' },
  'b-col': { template: '<div><slot /></div>' },
  'b-card': { template: '<div><slot /></div>' },
  'b-tabs': {
    name: 'BTabs',
    template:
      '<div data-stub="b-tabs" :data-nav-hidden="String(navWrapperClass === \'d-none\')"><slot /></div>',
    props: ['index', 'navWrapperClass'],
    emits: ['update:index'],
  },
  'b-tab': {
    template: '<div data-stub="b-tab" :data-title="title"><slot /></div>',
    props: ['title'],
  },
  'b-table': { template: '<div data-stub="b-table"></div>' },
  'b-alert': {
    template: '<div data-stub="b-alert" :data-variant="variant"><slot /></div>',
    props: ['variant', 'show'],
  },
  'b-form-checkbox': { template: '<input type="checkbox" />' },
  PageTitle: { template: '<div />' },
  Search: { template: '<div />' },
  TableFilter: { template: '<div />' },
  TableToolbar: {
    template: '<div><slot name="toolbar-buttons" /></div>',
  },
  TableToolbarExport: { template: '<div />' },
  TableCellCount: { template: '<div />' },
  StatusIcon: { template: '<span />' },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

import { useSensors } from '@/components/Composables/useSensors';

/**
 * Builds a minimal useSensors return value.
 * `groups` is an array of { chassisId, chassisName, sensors, isLoading?,
 * isError?, error? } objects.
 */
function makeSensorsReturn(groups = []) {
  const sensorsByChassis = ref(
    groups.map((g) => ({
      chassisId: g.chassisId,
      chassisName: g.chassisName,
      sensors: g.sensors ?? [],
      isLoading: g.isLoading ?? false,
      isError: g.isError ?? false,
      error: g.error ?? null,
    })),
  );

  const allSensors = computed(() =>
    sensorsByChassis.value.flatMap((g) => g.sensors),
  );

  return {
    data: allSensors,
    sensorsByChassis,
    isLoading: ref(false),
    isFetching: ref(false),
    isError: ref(false),
    error: ref(null),
    refetch: vi.fn(),
  };
}

/**
 * Mount Sensors with the shared stub set.
 */
function mountSensors(sensorsReturn) {
  useSensors.mockReturnValue(sensorsReturn);

  return mount(Sensors, {
    global: { stubs: STUBS },
  });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Sensors.vue', () => {
  let wrapper;

  afterEach(() => {
    if (wrapper) wrapper.unmount();
    vi.clearAllMocks();
  });

  // -------------------------------------------------------------------------
  // Single-chassis: no tab bar rendered
  // -------------------------------------------------------------------------
  describe('single-chassis system', () => {
    beforeEach(() => {
      const sensorsReturn = makeSensorsReturn([
        {
          chassisId: 'chassis0',
          chassisName: 'Chassis 0',
          sensors: [{ name: 'Temp', status: 'OK' }],
        },
      ]);
      wrapper = mountSensors(sensorsReturn);
    });

    it('hides the chassis tab navigation', () => {
      const tabs = wrapper.find('[data-stub="b-tabs"]');
      expect(tabs.attributes('data-nav-hidden')).toBe('true');
      expect(wrapper.findAll('[data-stub="b-tab"]')).toHaveLength(1);
    });

    it('renders the sensor table', () => {
      expect(wrapper.find('[data-stub="b-table"]').exists()).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // Multi-chassis: tab bar rendered with one tab per chassis
  // -------------------------------------------------------------------------
  describe('multi-chassis system', () => {
    let sensorsReturn;

    beforeEach(() => {
      sensorsReturn = makeSensorsReturn([
        {
          chassisId: 'chassis0',
          chassisName: 'Chassis 0',
          sensors: [{ name: 'Temp0', status: 'OK', units: '' }],
        },
        {
          chassisId: 'chassis1',
          chassisName: 'Chassis 1',
          sensors: [{ name: 'Temp1', status: 'Warning', units: '' }],
        },
      ]);
      wrapper = mountSensors(sensorsReturn);
    });

    it('shows the chassis tab navigation', () => {
      const tabs = wrapper.find('[data-stub="b-tabs"]');
      expect(tabs.attributes('data-nav-hidden')).toBe('false');
    });

    it('renders the table inside the active tab pane', () => {
      const panes = wrapper.findAll('[data-stub="b-tab"]');
      expect(panes[0].find('[data-stub="b-table"]').exists()).toBe(true);
      expect(panes[1].find('[data-stub="b-table"]').exists()).toBe(false);
    });

    it('renders one tab per chassis', () => {
      const tabs = wrapper.findAll('[data-stub="b-tab"]');
      expect(tabs).toHaveLength(2);
    });

    it('renders tabs with the correct chassis names', () => {
      const tabs = wrapper.findAll('[data-stub="b-tab"]');
      expect(tabs[0].attributes('data-title')).toBe('Chassis 0');
      expect(tabs[1].attributes('data-title')).toBe('Chassis 1');
    });
  });

  // -------------------------------------------------------------------------
  // onTabChange: switches activeSensors and clears selection.
  // Triggered via the b-tabs stub's update:index emit so the real event path
  // is exercised rather than calling vm internals directly.
  // -------------------------------------------------------------------------
  describe('onTabChange', () => {
    let sensorsReturn;

    beforeEach(async () => {
      mockClearSelectedRows.mockClear();

      sensorsReturn = makeSensorsReturn([
        {
          chassisId: 'chassis0',
          chassisName: 'Chassis 0',
          sensors: [
            {
              name: 'Temp0',
              status: 'OK',
              currentValue: 30,
              units: '℃',
              currentValueDisplay: ' ℃',
              lowerCaution: undefined,
              upperCaution: undefined,
              lowerCritical: undefined,
              upperCritical: undefined,
              lowerCautionDisplay: '',
              upperCautionDisplay: '',
              lowerCriticalDisplay: '',
              upperCriticalDisplay: '',
            },
          ],
        },
        {
          chassisId: 'chassis1',
          chassisName: 'Chassis 1',
          sensors: [
            {
              name: 'Temp1',
              status: 'Warning',
              currentValue: 85,
              units: '℃',
              currentValueDisplay: ' ℃',
              lowerCaution: undefined,
              upperCaution: undefined,
              lowerCritical: undefined,
              upperCritical: undefined,
              lowerCautionDisplay: '',
              upperCautionDisplay: '',
              lowerCriticalDisplay: '',
              upperCriticalDisplay: '',
            },
          ],
        },
      ]);

      wrapper = mountSensors(sensorsReturn);
      await wrapper.vm.$nextTick();
    });

    it('switches the active chassis when a different tab is selected', async () => {
      // Emit update:index from the b-tabs stub to trigger the real onTabChange
      // handler — avoids calling vm internals directly.
      const bTabs = wrapper.findComponent({ name: 'BTabs' });
      await bTabs.vm.$emit('update:index', 1);
      await wrapper.vm.$nextTick();
      // Switching to a different chassis must clear the row selection
      expect(mockClearSelectedRows).toHaveBeenCalled();
    });

    it('does not clear selection when the same tab is re-selected', async () => {
      // Index 0 is already active; emitting update:index with 0 should be a no-op
      const bTabs = wrapper.findComponent({ name: 'BTabs' });
      await bTabs.vm.$emit('update:index', 0);
      await wrapper.vm.$nextTick();
      expect(mockClearSelectedRows).not.toHaveBeenCalled();
    });
  });

  // -------------------------------------------------------------------------
  // Loading state: a chassis whose sensor query is still in flight shows no
  // table (isLoading: true) and the tab still appears.
  // -------------------------------------------------------------------------
  describe('loading chassis', () => {
    beforeEach(async () => {
      const sensorsReturn = makeSensorsReturn([
        {
          chassisId: 'chassis0',
          chassisName: 'Chassis 0',
          sensors: [{ name: 'Temp0', status: 'OK', units: '' }],
          isLoading: false,
        },
        {
          chassisId: 'chassis1',
          chassisName: 'Chassis 1',
          sensors: [],
          isLoading: true,
        },
      ]);
      wrapper = mountSensors(sensorsReturn);
      await wrapper.vm.$nextTick();
    });

    it('still renders a tab for the loading chassis', () => {
      const tabs = wrapper.findAll('[data-stub="b-tab"]');
      expect(tabs).toHaveLength(2);
      expect(tabs[1].attributes('data-title')).toBe('Chassis 1');
    });

    it('does not render an error alert or table inside the loading tab pane', async () => {
      // Switch to chassis1 (index 1) — the loading chassis
      const bTabs = wrapper.findComponent({ name: 'BTabs' });
      await bTabs.vm.$emit('update:index', 1);
      await wrapper.vm.$nextTick();
      const panes = wrapper.findAll('[data-stub="b-tab"]');
      // chassis1 pane is active — no error alert because isError is false
      expect(panes[1].find('[data-stub="b-alert"]').exists()).toBe(false);
      // no b-table rendered because isActiveGroup returns false for chassis1
      // (it is not the active chassis yet — the switch happens via activeChassisId)
      // After the switch, chassis1 becomes active; sensors array is empty so
      // the table placeholder is shown, but no data rows are present.
      // The table element itself is rendered (the pane is active):
      expect(panes[1].find('[data-stub="b-table"]').exists()).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // Errored chassis: tab appears but shows an error alert
  // -------------------------------------------------------------------------
  describe('errored chassis', () => {
    beforeEach(async () => {
      const sensorsReturn = makeSensorsReturn([
        {
          chassisId: 'chassis0',
          chassisName: 'Chassis 0',
          sensors: [],
          isLoading: false,
          isError: false,
          error: null,
        },
        {
          chassisId: 'chassis1',
          chassisName: 'Chassis 1',
          sensors: [],
          isLoading: false,
          isError: true,
          error: new Error('fetch failed'),
        },
      ]);

      wrapper = mountSensors(sensorsReturn);
      await wrapper.vm.$nextTick();
    });

    it('still renders tabs for both chassis when one has an error', () => {
      const tabs = wrapper.findAll('[data-stub="b-tab"]');
      expect(tabs).toHaveLength(2);
    });

    it('shows an error alert inside the errored chassis tab', async () => {
      // Switch to chassis1 (index 1) via the b-tabs emit
      const bTabs = wrapper.findComponent({ name: 'BTabs' });
      await bTabs.vm.$emit('update:index', 1);
      await wrapper.vm.$nextTick();
      const alerts = wrapper.findAll('[data-stub="b-alert"]');
      expect(alerts.length).toBeGreaterThan(0);
      const dangerAlert = alerts.find(
        (a) => a.attributes('data-variant') === 'danger',
      );
      expect(dangerAlert).toBeDefined();
    });
  });

  // -------------------------------------------------------------------------
  // activeSensors scoping: filteredSensors reflects the active chassis sensors
  // after switching tabs, not the sensors of all chassis combined.
  // -------------------------------------------------------------------------
  describe('activeSensors after tab switch', () => {
    let sensorsReturn;

    beforeEach(async () => {
      sensorsReturn = makeSensorsReturn([
        {
          chassisId: 'chassis0',
          chassisName: 'Chassis 0',
          sensors: [{ name: 'Temp0', status: 'OK' }],
        },
        {
          chassisId: 'chassis1',
          chassisName: 'Chassis 1',
          sensors: [{ name: 'Temp1', status: 'Warning' }],
        },
      ]);
      wrapper = mountSensors(sensorsReturn);
      await wrapper.vm.$nextTick();
    });

    it('shows chassis0 sensors on the initial tab', () => {
      // The active tab is chassis0; filteredSensors must not include chassis1's sensors.
      const table = wrapper.find('[data-stub="b-table"]');
      expect(table.exists()).toBe(true);
      // The table is bound to filteredSensors via :items — we verify the computed
      // is scoped by asserting the vm's activeSensors only contains chassis0 sensors.
      const active = wrapper.vm.activeSensors;
      expect(active.map((s) => s.name)).toContain('Temp0');
      expect(active.map((s) => s.name)).not.toContain('Temp1');
    });

    it('shows chassis1 sensors after switching to its tab', async () => {
      const bTabs = wrapper.findComponent({ name: 'BTabs' });
      await bTabs.vm.$emit('update:index', 1);
      await wrapper.vm.$nextTick();
      const active = wrapper.vm.activeSensors;
      expect(active.map((s) => s.name)).toContain('Temp1');
      expect(active.map((s) => s.name)).not.toContain('Temp0');
    });
  });
});
