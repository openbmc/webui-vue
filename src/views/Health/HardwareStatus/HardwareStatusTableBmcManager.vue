<template>
  <page-section :section-title="$t('pageHardwareStatus.bmcManager')">
    <b-table
      responsive="md"
      hover
      :items="items"
      :fields="fields"
      show-empty
      :empty-text="$t('global.table.emptyMessage')"
    >
      <!-- Expand chevron icon -->
      <template #cell(expandRow)="row">
        <b-button
          variant="link"
          data-test-id="hardwareStatus-button-expandBmc"
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

      <template #row-details="{ item }">
        <b-container fluid>
          <b-row>
            <b-col sm="6">
              <dl>
                <!-- Description -->
                <dt class="float-none">
                  {{ $t('pageHardwareStatus.table.description') }}:
                </dt>
                <dd class="mb-4">
                  {{ tableFormatter(item.description) }}
                </dd>
                <!-- Firmware version -->
                <dt class="float-none">
                  {{ $t('pageHardwareStatus.table.firmwareVersion') }}:
                </dt>
                <dd class="mb-4">
                  {{ tableFormatter(item.firmwareVersion) }}
                </dd>
                <!-- Service entry point UUID -->
                <dt class="float-none">
                  {{ $t('pageHardwareStatus.table.serviceEntryPointUuid') }}:
                </dt>
                <dd class="mb-4">
                  {{ tableFormatter(item.serviceEntryPointUuid) }}
                </dd>
                <!-- UUID -->
                <dt class="float-none">
                  {{ $t('pageHardwareStatus.table.uuid') }}:
                </dt>
                <dd class="mb-4">
                  {{ tableFormatter(item.uuid) }}
                </dd>
              </dl>
            </b-col>
            <b-col sm="6">
              <dl>
                <!-- Power state -->
                <dt>{{ $t('pageHardwareStatus.table.powerState') }}:</dt>
                <dd>{{ tableFormatter(item.powerState) }}</dd>

                <!-- Model -->
                <dt>{{ $t('pageHardwareStatus.table.model') }}:</dt>
                <dd>{{ tableFormatter(item.model) }}</dd>

                <!-- Health rollup -->
                <dt>
                  {{ $t('pageHardwareStatus.table.statusHealthRollup') }}:
                </dt>
                <dd>{{ tableFormatter(item.healthRollup) }}</dd>

                <!-- Status state -->
                <dt>{{ $t('pageHardwareStatus.table.statusState') }}:</dt>
                <dd>{{ tableFormatter(item.statusState) }}</dd>

                <!-- Graphical console -->
                <dt class="font-weight-bold mt-3 mb-2 float-none">
                  {{ $t('pageHardwareStatus.table.graphicalConsole') }}
                </dt>
                <dt>
                  {{ $t('pageHardwareStatus.table.connectTypesSupported') }}:
                </dt>
                <dd>
                  {{ tableFormatterArray(item.graphicalConsoleConnectTypes) }}
                </dd>
                <dt>
                  {{ $t('pageHardwareStatus.table.maxConcurrentSessions') }}:
                </dt>
                <dd>{{ tableFormatter(item.graphicalConsoleMaxSessions) }}</dd>
                <dt>{{ $t('pageHardwareStatus.table.serviceEnabled') }}:</dt>
                <dd>{{ tableFormatter(item.graphicalConsoleEnabled) }}</dd>

                <!-- Serial console -->
                <dt class="font-weight-bold mt-3 mb-2 float-none">
                  {{ $t('pageHardwareStatus.table.serialConsole') }}
                </dt>
                <dt>
                  {{ $t('pageHardwareStatus.table.connectTypesSupported') }}:
                </dt>
                <dd>
                  {{ tableFormatterArray(item.serialConsoleConnectTypes) }}
                </dd>
                <dt>
                  {{ $t('pageHardwareStatus.table.maxConcurrentSessions') }}:
                </dt>
                <dd>{{ tableFormatter(item.serialConsoleMaxSessions) }}</dd>
                <dt>{{ $t('pageHardwareStatus.table.serviceEnabled') }}:</dt>
                <dd>{{ tableFormatter(item.serialConsoleEnabled) }}</dd>
              </dl>
            </b-col>
          </b-row>
        </b-container>
      </template>
    </b-table>
  </page-section>
</template>

<script>
import PageSection from '@/components/Global/PageSection';
import IconChevron from '@carbon/icons-vue/es/chevron--down/20';

import StatusIcon from '@/components/Global/StatusIcon';

import TableRowExpandMixin, {
  expandRowLabel,
} from '@/components/Mixins/TableRowExpandMixin';
import TableDataFormatterMixin from '@/components/Mixins/TableDataFormatterMixin';

export default {
  components: { IconChevron, PageSection, StatusIcon },
  mixins: [TableRowExpandMixin, TableDataFormatterMixin],
  data() {
    return {
      fields: [
        {
          key: 'expandRow',
          label: '',
          tdClass: 'table-row-expand',
        },
        {
          key: 'id',
          label: this.$t('pageHardwareStatus.table.id'),
          formatter: this.tableFormatter,
        },
        {
          key: 'health',
          label: this.$t('pageHardwareStatus.table.health'),
          formatter: this.tableFormatter,
          tdClass: 'text-nowrap',
        },
        {
          key: 'partNumber',
          label: this.$t('pageHardwareStatus.table.partNumber'),
          formatter: this.tableFormatter,
        },
        {
          key: 'serialNumber',
          label: this.$t('pageHardwareStatus.table.serialNumber'),
          formatter: this.tableFormatter,
        },
      ],
      expandRowLabel: expandRowLabel,
    };
  },
  computed: {
    bmc() {
      return this.$store.getters['bmc/bmc'];
    },
    items() {
      if (this.bmc) {
        return [this.bmc];
      } else {
        return [];
      }
    },
  },
  created() {
    this.$store.dispatch('bmc/getBmcInfo').finally(() => {
      // Emit initial data fetch complete to parent component
      this.$root.$emit('hardware-status-bmc-manager-complete');
    });
  },
};
</script>
