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
                <dt>{{ $t('pageHardwareStatus.table.name') }}:</dt>
                <dd>{{ tableFormatter(item.name) }}</dd>
                <!-- Part number -->
                <dt>{{ $t('pageHardwareStatus.table.partNumber') }}:</dt>
                <dd>{{ tableFormatter(item.partNumber) }}</dd>
                <!-- Serial number -->
                <dt>{{ $t('pageHardwareStatus.table.serialNumber') }}:</dt>
                <dd>{{ tableFormatter(item.serialNumber) }}</dd>
                <!-- Spare part number -->
                <dt>{{ $t('pageHardwareStatus.table.sparePartNumber') }}:</dt>
                <dd>{{ tableFormatter(item.sparePartNumber) }}</dd>
                <!-- Model -->
                <dt>{{ $t('pageHardwareStatus.table.model') }}:</dt>
                <dd>{{ tableFormatter(item.model) }}</dd>
                <!-- UUID -->
                <dt>{{ $t('pageHardwareStatus.table.uuid') }}:</dt>
                <dd>{{ tableFormatter(item.uuid) }}</dd>
                <!-- Service entry point UUID -->
                <dt>
                  {{ $t('pageHardwareStatus.table.serviceEntryPointUuid') }}:
                </dt>
                <dd>{{ tableFormatter(item.serviceEntryPointUuid) }}</dd>
              </dl>
            </b-col>
            <b-col class="mt-2" sm="6" xl="6">
              <dl>
                <!-- Status state -->
                <dt>{{ $t('pageHardwareStatus.table.statusState') }}:</dt>
                <dd>{{ tableFormatter(item.statusState) }}</dd>
                <!-- Power state -->
                <dt>{{ $t('pageHardwareStatus.table.power') }}:</dt>
                <dd>{{ tableFormatter(item.powerState) }}</dd>
                <!-- Health rollup -->
                <dt>{{ $t('pageHardwareStatus.table.healthRollup') }}:</dt>
                <dd>{{ tableFormatter(item.healthRollup) }}</dd>
                <!-- BMC date and time -->
                <dt>{{ $t('pageHardwareStatus.table.bmcDateTime') }}:</dt>
                <dd>
                  {{ item.dateTime | formatDate }}
                  {{ item.dateTime | formatTime }}
                </dd>
                <!-- Reset date and time -->
                <dt>{{ $t('pageHardwareStatus.table.lastResetTime') }}:</dt>
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
                <dt>{{ $t('pageHardwareStatus.table.manufacturer') }}:</dt>
                <dd>{{ tableFormatter(item.manufacturer) }}</dd>
                <!-- Description -->
                <dt>{{ $t('pageHardwareStatus.table.description') }}:</dt>
                <dd>{{ tableFormatter(item.description) }}</dd>
                <!-- Manager type -->
                <dt>{{ $t('pageHardwareStatus.table.managerType') }}:</dt>
                <dd>{{ tableFormatter(item.managerType) }}</dd>
              </dl>
            </b-col>
            <b-col class="mt-2" sm="6" xl="6">
              <!-- Firmware Version  -->
              <dl>
                <dt>{{ $t('pageHardwareStatus.table.firmwareVersion') }}:</dt>
                <dd>{{ item.firmwareVersion }}</dd>
                <!-- Graphical console -->
                <p class="mt-1 mb-2 float-none m-0">
                  {{ $t('pageHardwareStatus.table.graphicalConsole') }}
                </p>
                <dl class="ml-4">
                  <dt>
                    {{ $t('pageHardwareStatus.table.connectTypesSupported') }}:
                  </dt>
                  <dd>
                    {{ tableFormatterArray(item.graphicalConsoleConnectTypes) }}
                  </dd>
                  <dt>
                    {{ $t('pageHardwareStatus.table.maxConcurrentSessions') }}:
                  </dt>
                  <dd>
                    {{ tableFormatter(item.graphicalConsoleMaxSessions) }}
                  </dd>
                  <dt>{{ $t('pageHardwareStatus.table.serviceEnabled') }}:</dt>
                  <dd>
                    {{ tableFormatter(item.graphicalConsoleEnabled) }}
                  </dd>
                </dl>
              </dl>
              <!-- Serial console -->
              <dl>
                <p class="mt-1 mb-2 float-none m-0">
                  {{ $t('pageHardwareStatus.table.serialConsole') }}
                </p>
                <dl class="ml-4">
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
          label: this.$t('pageHardwareStatus.table.id'),
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
<style lang="scss" scoped>
p {
  font-size: 14px;
}
</style>
