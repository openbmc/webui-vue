<template>
  <page-section :section-title="$t('pageInventoryAndLeds.bmcManager')">
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
                <dt class="d-block">
                  {{ $t('pageInventoryAndLeds.table.description') }}:
                </dt>
                <dd class="mb-4">
                  {{ tableFormatter(item.description) }}
                </dd>
                <br />
                <!-- Firmware version -->
                <dt class="d-block">
                  {{ $t('pageInventoryAndLeds.table.firmwareVersion') }}:
                </dt>
                <dd class="mb-4">
                  {{ tableFormatter(item.firmwareVersion) }}
                </dd>
                <br />
                <!-- Service entry point UUID -->
                <dt class="d-block">
                  {{ $t('pageInventoryAndLeds.table.serviceEntryPointUuid') }}:
                </dt>
                <dd class="mb-4">
                  {{ tableFormatter(item.serviceEntryPointUuid) }}
                </dd>
                <br />
                <!-- UUID -->
                <dt class="d-block">
                  {{ $t('pageInventoryAndLeds.table.uuid') }}:
                </dt>
                <dd class="mb-4">
                  {{ tableFormatter(item.uuid) }}
                </dd>
              </dl>
            </b-col>
            <b-col sm="6">
              <dl>
                <!-- Power state -->
                <dt>{{ $t('pageInventoryAndLeds.table.powerState') }}:</dt>
                <dd>{{ tableFormatter(item.powerState) }}</dd>
                <br />

                <!-- Model -->
                <dt>{{ $t('pageInventoryAndLeds.table.model') }}:</dt>
                <dd>{{ tableFormatter(item.model) }}</dd>
                <br />

                <!-- Health rollup -->
                <dt>
                  {{ $t('pageInventoryAndLeds.table.statusHealthRollup') }}:
                </dt>
                <dd>{{ tableFormatter(item.healthRollup) }}</dd>
                <br />

                <!-- Status state -->
                <dt>{{ $t('pageInventoryAndLeds.table.statusState') }}:</dt>
                <dd>{{ tableFormatter(item.statusState) }}</dd>
                <br />

                <!-- Graphical console -->
                <dt class="font-weight-bold mt-3 mb-2 d-block">
                  {{ $t('pageInventoryAndLeds.table.graphicalConsole') }}
                </dt>
                <dt>
                  {{ $t('pageInventoryAndLeds.table.connectTypesSupported') }}:
                </dt>
                <dd>
                  {{ tableFormatterArray(item.graphicalConsoleConnectTypes) }}
                </dd>
                <br />
                <dt>
                  {{ $t('pageInventoryAndLeds.table.maxConcurrentSessions') }}:
                </dt>
                <dd>{{ tableFormatter(item.graphicalConsoleMaxSessions) }}</dd>
                <br />
                <dt>{{ $t('pageInventoryAndLeds.table.serviceEnabled') }}:</dt>
                <dd>{{ tableFormatter(item.graphicalConsoleEnabled) }}</dd>
                <br />

                <!-- Serial console -->
                <dt class="font-weight-bold mt-3 mb-2 d-block">
                  {{ $t('pageInventoryAndLeds.table.serialConsole') }}
                </dt>
                <dt>
                  {{ $t('pageInventoryAndLeds.table.connectTypesSupported') }}:
                </dt>
                <dd>
                  {{ tableFormatterArray(item.serialConsoleConnectTypes) }}
                </dd>
                <br />
                <dt>
                  {{ $t('pageInventoryAndLeds.table.maxConcurrentSessions') }}:
                </dt>
                <dd>{{ tableFormatter(item.serialConsoleMaxSessions) }}</dd>
                <br />
                <dt>{{ $t('pageInventoryAndLeds.table.serviceEnabled') }}:</dt>
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
          label: this.$t('pageInventoryAndLeds.table.id'),
          formatter: this.tableFormatter,
        },
        {
          key: 'health',
          label: this.$t('pageInventoryAndLeds.table.health'),
          formatter: this.tableFormatter,
          tdClass: 'text-nowrap',
        },
        {
          key: 'partNumber',
          label: this.$t('pageInventoryAndLeds.table.partNumber'),
          formatter: this.tableFormatter,
        },
        {
          key: 'serialNumber',
          label: this.$t('pageInventoryAndLeds.table.serialNumber'),
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
