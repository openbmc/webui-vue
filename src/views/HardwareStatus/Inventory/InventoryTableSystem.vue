<template>
  <page-section :section-title="$t('pageInventory.system')">
    <b-table
      responsive="md"
      hover
      show-empty
      :items="systems"
      :fields="fields"
      :empty-text="$t('global.table.emptyMessage')"
      :busy="isBusy"
    >
      <!-- Expand chevron icon -->
      <template #cell(expandRow)="row">
        <b-button
          variant="link"
          data-test-id="hardwareStatus-button-expandSystem"
          :title="expandRowLabel"
          class="btn-icon-only"
          @click="toggleRowDetails(row)"
        >
          <icon-chevron />
          <span class="sr-only">{{ expandRowLabel }}</span>
        </b-button>
      </template>

      <!-- Health -->
      <template #cell(health)="{ value }">
        <status-icon :status="statusIcon(value)" />
        {{ value }}
      </template>

      <template #cell(locationIndicatorActive)="{ item }">
        <b-form-checkbox
          id="identifyLedSwitchSystem"
          v-model="item.locationIndicatorActive"
          data-test-id="inventorySystem-toggle-identifyLed"
          switch
          @change="toggleIdentifyLedSwitch"
        >
          <span v-if="item.locationIndicatorActive">
            {{ $t('global.status.on') }}
          </span>
          <span v-else>{{ $t('global.status.off') }}</span>
        </b-form-checkbox>
      </template>

      <template #row-details="{ item }">
        <b-container fluid>
          <b-row>
            <b-col class="mt-2" sm="6">
              <dl>
                <!-- Serial number -->
                <dt>{{ $t('pageInventory.table.serialNumber') }}:</dt>
                <dd>{{ dataFormatter(item.serialNumber) }}</dd>
                <!-- Model -->
                <dt>{{ $t('pageInventory.table.model') }}:</dt>
                <dd>{{ dataFormatter(item.model) }}</dd>
                <!-- Asset tag -->
                <dt>{{ $t('pageInventory.table.assetTag') }}:</dt>
                <dd class="mb-2">
                  {{ dataFormatter(item.assetTag) }}
                </dd>
              </dl>
            </b-col>
            <b-col class="mt-2" sm="6">
              <dl>
                <!-- Status state -->
                <dt>{{ $t('pageInventory.table.statusState') }}:</dt>
                <dd>{{ dataFormatter(item.statusState) }}</dd>
                <!-- Power state -->
                <dt>{{ $t('pageInventory.table.power') }}:</dt>
                <dd>{{ dataFormatter(item.powerState) }}</dd>
                <!-- Health rollup -->
                <dt>{{ $t('pageInventory.table.healthRollup') }}:</dt>
                <dd>{{ dataFormatter(item.healthRollup) }}</dd>
              </dl>
            </b-col>
          </b-row>
          <div class="section-divider mb-3 mt-3"></div>
          <b-row>
            <b-col class="mt-1" sm="6">
              <dl>
                <!-- Manufacturer -->
                <dt>{{ $t('pageInventory.table.manufacturer') }}:</dt>
                <dd>{{ dataFormatter(item.manufacturer) }}</dd>
                <!-- Description -->
                <dt>{{ $t('pageInventory.table.description') }}:</dt>
                <dd>{{ dataFormatter(item.description) }}</dd>
                <!-- Sub Model -->
                <dt>{{ $t('pageInventory.table.subModel') }}:</dt>
                <dd>
                  {{ dataFormatter(item.subModel) }}
                </dd>
                <!-- System Type -->
                <dt>{{ $t('pageInventory.table.systemType') }}:</dt>
                <dd>
                  {{ dataFormatter(item.systemType) }}
                </dd>
              </dl>
            </b-col>
            <b-col sm="6">
              <!-- Memory Summary -->
              <p class="mt-1 mb-2 h6 float-none m-0">
                {{ $t('pageInventory.table.memorySummary') }}
              </p>
              <dl class="ml-4">
                <!-- Total system memory -->
                <dt>{{ $t('pageInventory.table.totalSystemMemoryGiB') }}:</dt>
                <dd>
                  {{ dataFormatter(item.totalSystemMemoryGiB) }}
                  {{ $t('unit.GiB') }}
                </dd>
              </dl>
              <!-- Processor Summary -->
              <p class="mt-1 mb-2 h6 float-none m-0">
                {{ $t('pageInventory.table.processorSummary') }}
              </p>
              <dl class="ml-4">
                <!-- Count -->
                <dt>{{ $t('pageInventory.table.count') }}:</dt>
                <dd>{{ dataFormatter(item.processorSummaryCount) }}</dd>
                <!-- Core Count -->
                <dt>{{ $t('pageInventory.table.coreCount') }}:</dt>
                <dd>{{ dataFormatter(item.processorSummaryCoreCount) }}</dd>
              </dl>
              <!-- Serial console -->
              <p class="mt-1 mb-2 h6 float-none m-0">
                {{ $t('pageInventory.table.serialConsole') }}
              </p>
              <dl class="ml-4">
                <dt>{{ $t('pageInventory.table.maxConcurrentSessions') }}:</dt>
                <dd>{{ dataFormatter(item.serialConsoleMaxSessions) }}</dd>
                <dt>{{ $t('pageInventory.table.serviceEnabled') }}:</dt>
                <dd>{{ dataFormatter(item.serialConsoleEnabled) }}</dd>
              </dl>
            </b-col>
          </b-row>
        </b-container>
      </template>
    </b-table>
  </page-section>
</template>

<script>
import BVToastMixin from '@/components/Mixins/BVToastMixin';
import PageSection from '@/components/Global/PageSection';
import IconChevron from '@carbon/icons-vue/es/chevron--down/20';

import StatusIcon from '@/components/Global/StatusIcon';

import TableRowExpandMixin, {
  expandRowLabel,
} from '@/components/Mixins/TableRowExpandMixin';
import DataFormatterMixin from '@/components/Mixins/DataFormatterMixin';
import { useI18n } from 'vue-i18n';
import i18n from '@/i18n';

export default {
  components: { IconChevron, PageSection, StatusIcon },
  mixins: [BVToastMixin, TableRowExpandMixin, DataFormatterMixin],
  data() {
    return {
      $t: useI18n().t,
      isBusy: true,
      fields: [
        {
          key: 'expandRow',
          label: '',
          tdClass: 'table-row-expand',
        },
        {
          key: 'id',
          label: i18n.global.t('pageInventory.table.id'),
          formatter: this.dataFormatter,
        },
        {
          key: 'hardwareType',
          label: i18n.global.t('pageInventory.table.hardwareType'),
          formatter: this.dataFormatter,
          tdClass: 'text-nowrap',
        },
        {
          key: 'health',
          label: i18n.global.t('pageInventory.table.health'),
          formatter: this.dataFormatter,
          tdClass: 'text-nowrap',
        },
        {
          key: 'locationNumber',
          label: i18n.global.t('pageInventory.table.locationNumber'),
          formatter: this.dataFormatter,
        },
        {
          key: 'locationIndicatorActive',
          label: i18n.global.t('pageInventory.table.identifyLed'),
          formatter: this.dataFormatter,
        },
      ],
      expandRowLabel: expandRowLabel,
    };
  },
  computed: {
    systems() {
      return this.$store.getters['system/systems'];
    },
  },
  created() {
    this.$store.dispatch('system/getSystem').finally(() => {
      // Emit initial data fetch complete to parent component
      this.$root.$emit('hardware-status-system-complete');
      this.isBusy = false;
    });
  },
  methods: {
    toggleIdentifyLedSwitch(state) {
      this.$store
        .dispatch('system/changeIdentifyLedState', state)
        .then((message) => this.successToast(message))
        .catch(({ message }) => this.errorToast(message));
    },
  },
};
</script>
