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

      <!-- Toggle identify LED -->
      <template #cell(identifyLed)="row">
        <b-form-checkbox
          v-if="hasIdentifyLed(row.item.identifyLed)"
          v-model="row.item.identifyLed"
          name="switch"
          switch
          @change="toggleIdentifyLedValue(row.item)"
        >
          <span v-if="row.item.identifyLed">
            {{ $t('global.status.on') }}
          </span>
          <span v-else> {{ $t('global.status.off') }} </span>
        </b-form-checkbox>
        <div v-else>--</div>
      </template>

      <template #row-details="{ item }">
        <b-container fluid>
          <b-row>
            <b-col class="mt-2" sm="6" xl="6">
              <dl>
                <!-- Name -->
                <dt>{{ $t('pageInventoryAndLeds.table.name') }}:</dt>
                <dd>{{ tableFormatter(item.name) }}</dd>
                <!-- Part number -->
                <dt>{{ $t('pageInventoryAndLeds.table.partNumber') }}:</dt>
                <dd>{{ tableFormatter(item.partNumber) }}</dd>
                <!-- Serial number -->
                <dt>{{ $t('pageInventoryAndLeds.table.serialNumber') }}:</dt>
                <dd>{{ tableFormatter(item.serialNumber) }}</dd>
                <!-- Spare part number -->
                <dt>{{ $t('pageInventoryAndLeds.table.sparePartNumber') }}:</dt>
                <dd>{{ tableFormatter(item.sparePartNumber) }}</dd>
                <!-- Model -->
                <dt>{{ $t('pageInventoryAndLeds.table.model') }}:</dt>
                <dd>{{ tableFormatter(item.model) }}</dd>
                <!-- UUID -->
                <dt>{{ $t('pageInventoryAndLeds.table.uuid') }}:</dt>
                <dd>{{ tableFormatter(item.uuid) }}</dd>
                <!-- Service entry point UUID -->
                <dt>
                  {{ $t('pageInventoryAndLeds.table.serviceEntryPointUuid') }}:
                </dt>
                <dd>{{ tableFormatter(item.serviceEntryPointUuid) }}</dd>
              </dl>
            </b-col>
            <b-col class="mt-2" sm="6" xl="6">
              <dl>
                <!-- Status state -->
                <dt>{{ $t('pageInventoryAndLeds.table.statusState') }}:</dt>
                <dd>{{ tableFormatter(item.statusState) }}</dd>
                <!-- Power state -->
                <dt>{{ $t('pageInventoryAndLeds.table.power') }}:</dt>
                <dd>{{ tableFormatter(item.powerState) }}</dd>
                <!-- Health rollup -->
                <dt>{{ $t('pageInventoryAndLeds.table.healthRollup') }}:</dt>
                <dd>{{ tableFormatter(item.healthRollup) }}</dd>
                <!-- BMC date and time -->
                <dt>{{ $t('pageInventoryAndLeds.table.bmcDateTime') }}:</dt>
                <dd>
                  {{ item.dateTime | formatDate }}
                  {{ item.dateTime | formatTime }}
                </dd>
                <!-- Reset date and time -->
                <dt>{{ $t('pageInventoryAndLeds.table.lastResetTime') }}:</dt>
                <dd>
                  {{ item.lastResetTime | formatDate }}
                  {{ item.lastResetTime | formatTime }}
                </dd>
              </dl>
            </b-col>
          </b-row>
          <div class="section-divider mb-3 mt-3"></div>
          <b-row>
            <b-col class="mt-2" sm="6" xl="6">
              <dl>
                <!-- Manufacturer -->
                <dt>{{ $t('pageInventoryAndLeds.table.manufacturer') }}:</dt>
                <dd>{{ tableFormatter(item.manufacturer) }}</dd>
                <!-- Description -->
                <dt>{{ $t('pageInventoryAndLeds.table.description') }}:</dt>
                <dd>{{ tableFormatter(item.description) }}</dd>
                <!-- Manager type -->
                <dt>{{ $t('pageInventoryAndLeds.table.managerType') }}:</dt>
                <dd>{{ tableFormatter(item.managerType) }}</dd>
              </dl>
            </b-col>
            <b-col class="mt-2" sm="6" xl="6">
              <dl>
                <!-- Firmware Version  -->
                <dt>{{ $t('pageInventoryAndLeds.table.firmwareVersion') }}:</dt>
                <dd>{{ item.firmwareVersion }}</dd>
                <!-- Graphical console -->
                <dt class="mt-1 mb-2 float-none">
                  {{ $t('pageInventoryAndLeds.table.graphicalConsole') }}
                </dt>
                <dt>
                  {{ $t('pageInventoryAndLeds.table.connectTypesSupported') }}:
                </dt>
                <dd>
                  {{ tableFormatterArray(item.graphicalConsoleConnectTypes) }}
                </dd>
                <dt>
                  {{ $t('pageInventoryAndLeds.table.maxConcurrentSessions') }}:
                </dt>
                <dd>
                  {{ tableFormatter(item.graphicalConsoleMaxSessions) }}
                </dd>
                <dt>{{ $t('pageInventoryAndLeds.table.serviceEnabled') }}:</dt>
                <dd>
                  {{ tableFormatter(item.graphicalConsoleEnabled) }}
                </dd>
                <!-- Serial console -->
                <dt class="mt-1 mb-2 float-none">
                  {{ $t('pageInventoryAndLeds.table.serialConsole') }}
                </dt>
                <dt>
                  {{ $t('pageInventoryAndLeds.table.connectTypesSupported') }}:
                </dt>
                <dd>
                  {{ tableFormatterArray(item.serialConsoleConnectTypes) }}
                </dd>
                <dt>
                  {{ $t('pageInventoryAndLeds.table.maxConcurrentSessions') }}:
                </dt>
                <dd>{{ tableFormatter(item.serialConsoleMaxSessions) }}</dd>
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
import BVToastMixin from '@/components/Mixins/BVToastMixin';
import TableRowExpandMixin, {
  expandRowLabel,
} from '@/components/Mixins/TableRowExpandMixin';
import TableDataFormatterMixin from '@/components/Mixins/TableDataFormatterMixin';

export default {
  components: { IconChevron, PageSection, StatusIcon },
  mixins: [BVToastMixin, TableRowExpandMixin, TableDataFormatterMixin],
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
        },
        {
          key: 'locationNumber',
          label: this.$t('pageInventoryAndLeds.table.locationNumber'),
          formatter: this.tableFormatter,
        },
        {
          key: 'identifyLed',
          label: this.$t('pageInventoryAndLeds.table.identifyLed'),
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
  methods: {
    toggleIdentifyLedValue(row) {
      this.$store
        .dispatch('bmc/updateIdentifyLedValue', {
          uri: row.uri,
          identifyLed: row.identifyLed,
        })
        .catch(({ message }) => this.errorToast(message));
    },
    // TO DO: remove hasIdentifyLed method once the following story is merged:
    // https://gerrit.openbmc-project.xyz/c/openbmc/bmcweb/+/43179
    hasIdentifyLed(identifyLed) {
      return typeof identifyLed === 'boolean';
    },
  },
};
</script>
