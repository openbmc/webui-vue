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
            <b-col class="mt-2" sm="6">
              <dl>
                <!-- Part number -->
                <dt>{{ $t('pageHardwareStatus.table.partNumber') }}:</dt>
                <dd>{{ tableFormatter(item.partNumber) }}</dd>
                <br />
                <!-- Serial number -->
                <dt>{{ $t('pageHardwareStatus.table.serialNumber') }}:</dt>
                <dd>{{ tableFormatter(item.serialNumber) }}</dd>
                <br />
                <!-- Fru Number -->
                <dt>{{ $t('pageHardwareStatus.table.fruNumber') }}:</dt>
                <dd>{{ tableFormatter(item.sparePartNumber) }}</dd>
                <br />
                <!-- CCIN -->
                <dt>{{ $t('pageHardwareStatus.table.ccinModel') }}:</dt>
                <dd>{{ tableFormatter(item.model) }}</dd>
                <br />
                <!-- UUID -->
                <dt>{{ $t('pageHardwareStatus.table.uuid') }}:</dt>
                <dd>{{ tableFormatter(item.uuid) }}</dd>
                <br />
                <!-- Service entry point UUID -->
                <dt>
                  {{ $t('pageHardwareStatus.table.serviceEntryPointUuid') }}:
                </dt>
                <dd>{{ tableFormatter(item.serviceEntryPointUuid) }}</dd>
              </dl>
            </b-col>
            <b-col class="mt-2" sm="6">
              <dl>
                <!-- Status state -->
                <dt>{{ $t('pageHardwareStatus.table.statusState') }}:</dt>
                <dd>{{ tableFormatter(item.statusState) }}</dd>
                <br />
                <!-- Power state -->
                <dt>{{ $t('pageHardwareStatus.table.power') }}:</dt>
                <dd>{{ tableFormatter(item.powerState) }}</dd>
                <br />
                <!-- Health rollup -->
                <dt>{{ $t('pageHardwareStatus.table.healthRollup') }}:</dt>
                <dd>{{ tableFormatter(item.healthRollup) }}</dd>
                <br />
                <!-- BMC date and time -->
                <dt>{{ $t('pageHardwareStatus.table.bmcDateTime') }}:</dt>
                <dd>
                  {{ item.dateTime | formatDate }}
                  {{ item.dateTime | formatTime }}
                </dd>
                <br />
                <!-- Reset date and time -->
                <dt>{{ $t('pageHardwareStatus.table.lastResetTime') }}:</dt>
                <dd>
                  {{ item.lastResetTime | formatDate }}
                  {{ item.lastResetTime | formatTime }}
                </dd>
              </dl>
            </b-col>
          </b-row>
          <div class="section-divider"></div>
          <b-row>
            <b-col class="mt-2" sm="6">
              <dl>
                <!-- Manufacturer -->
                <dt>{{ $t('pageHardwareStatus.table.manufacturer') }}:</dt>
                <dd>{{ tableFormatter(item.manufacturer) }}</dd>
                <br />
                <!-- Description -->
                <dt>{{ $t('pageHardwareStatus.table.description') }}:</dt>
                <dd>{{ tableFormatter(item.description) }}</dd>
                <br />
                <!-- Manager type -->
                <dt>{{ $t('pageHardwareStatus.table.managerType') }}:</dt>
                <dd>{{ tableFormatter(item.managerType) }}</dd>
                <br />
              </dl>
            </b-col>
            <b-col class="mt-1" sm="6">
              <dl>
                <!-- Firmware Version  -->
                <dt class="mt-2 mb-2">
                  {{ $t('pageHardwareStatus.table.firmwareVersion') }}:
                </dt>
                <dd>{{ item.firmwareVersion }}</dd>
                <!-- Graphical console -->
                <dt class="mt-1 mb-2 d-block">
                  {{ $t('pageHardwareStatus.table.graphicalConsole') }}
                </dt>
                <dt class="ml-4">
                  {{ $t('pageHardwareStatus.table.connectTypesSupported') }}:
                </dt>
                <dd>
                  {{ tableFormatterArray(item.graphicalConsoleConnectTypes) }}
                </dd>
                <br />
                <dt class="ml-4">
                  {{ $t('pageHardwareStatus.table.maxConcurrentSessions') }}:
                </dt>
                <dd>{{ tableFormatter(item.graphicalConsoleMaxSessions) }}</dd>
                <br />
                <dt class="ml-4">
                  {{ $t('pageHardwareStatus.table.serviceEnabled') }}:
                </dt>
                <dd>{{ tableFormatter(item.graphicalConsoleEnabled) }}</dd>

                <!-- Serial console -->
                <dt class="mt-1 mb-2 d-block">
                  {{ $t('pageHardwareStatus.table.serialConsole') }}
                </dt>
                <dt class="ml-4">
                  {{ $t('pageHardwareStatus.table.connectTypesSupported') }}:
                </dt>
                <dd>
                  {{ tableFormatterArray(item.serialConsoleConnectTypes) }}
                </dd>
                <br />
                <dt class="ml-4">
                  {{ $t('pageHardwareStatus.table.maxConcurrentSessions') }}:
                </dt>
                <dd>{{ tableFormatter(item.serialConsoleMaxSessions) }}</dd>
                <br />
                <dt class="ml-4">
                  {{ $t('pageHardwareStatus.table.serviceEnabled') }}:
                </dt>
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
          key: 'hardwareType',
          label: this.$t('pageHardwareStatus.table.hardwareType'),
          formatter: this.tableFormatter,
        },
        {
          key: 'health',
          label: this.$t('pageHardwareStatus.table.health'),
          formatter: this.tableFormatter,
        },
        {
          key: 'locationNumber',
          label: this.$t('pageHardwareStatus.table.locationNumber'),
          formatter: this.tableFormatter,
        },
        {
          key: 'identifyLed',
          label: this.$t('pageHardwareStatus.table.identifyLed'),
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
