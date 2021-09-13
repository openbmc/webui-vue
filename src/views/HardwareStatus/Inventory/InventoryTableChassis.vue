<template>
  <page-section :section-title="$t('pageInventory.chassis')">
    <b-table
      responsive="md"
      hover
      :items="chassis"
      :fields="fields"
      show-empty
      :empty-text="$t('global.table.emptyMessage')"
      :busy="!chassis.length"
    >
      <!-- Loader -->
      <template #table-busy>
        <table-loader />
      </template>
      <!-- Expand chevron icon -->
      <template #cell(expandRow)="row">
        <b-button
          variant="link"
          data-test-id="hardwareStatus-button-expandChassis"
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
                <dt>{{ $t('pageInventory.table.name') }}:</dt>
                <dd>{{ tableFormatter(item.name) }}</dd>
                <!-- Part number -->
                <dt>{{ $t('pageInventory.table.partNumber') }}:</dt>
                <dd>{{ tableFormatter(item.partNumber) }}</dd>
                <!-- Serial Number -->
                <dt>{{ $t('pageInventory.table.serialNumber') }}:</dt>
                <dd>{{ tableFormatter(item.serialNumber) }}</dd>
                <!-- Model -->
                <dt>{{ $t('pageInventory.table.model') }}:</dt>
                <dd class="mb-2">
                  {{ tableFormatter(item.model) }}
                </dd>
                <!-- Asset tag -->
                <dt>{{ $t('pageInventory.table.assetTag') }}:</dt>
                <dd class="mb-2">
                  {{ tableFormatter(item.assetTag) }}
                </dd>
              </dl>
            </b-col>
            <b-col class="mt-2" sm="6" xl="6">
              <dl>
                <!-- Status state -->
                <dt>{{ $t('pageInventory.table.statusState') }}:</dt>
                <dd>{{ tableFormatter(item.statusState) }}</dd>
                <!-- Power state -->
                <dt>{{ $t('pageInventory.table.power') }}:</dt>
                <dd>{{ tableFormatter(item.power) }}</dd>
                <!-- Health rollup -->
                <dt>{{ $t('pageInventory.table.healthRollup') }}:</dt>
                <dd>{{ tableFormatter(item.healthRollup) }}</dd>
              </dl>
            </b-col>
          </b-row>
          <div class="section-divider mb-3 mt-3"></div>
          <b-row>
            <b-col class="mt-2" sm="6" xl="6">
              <dl>
                <!-- Manufacturer -->
                <dt>{{ $t('pageInventory.table.manufacturer') }}:</dt>
                <dd>{{ tableFormatter(item.manufacturer) }}</dd>
                <!-- Chassis Type -->
                <dt>{{ $t('pageInventory.table.chassisType') }}:</dt>
                <dd>{{ tableFormatter(item.chassisType) }}</dd>
              </dl>
            </b-col>
            <b-col class="mt-2" sm="6" xl="6">
              <dl>
                <!-- Min power -->
                <dt>{{ $t('pageInventory.table.minPowerWatts') }}:</dt>
                <dd>{{ tableFormatter(item.minPowerWatts) }}</dd>
                <!-- Max power -->
                <dt>{{ $t('pageInventory.table.maxPowerWatts') }}:</dt>
                <dd>{{ tableFormatter(item.maxPowerWatts) }}</dd>
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
import BVToastMixin from '@/components/Mixins/BVToastMixin';
import StatusIcon from '@/components/Global/StatusIcon';
import TableLoader from '@/components/Global/TableLoader';
import TableRowExpandMixin, {
  expandRowLabel,
} from '@/components/Mixins/TableRowExpandMixin';
import TableDataFormatterMixin from '@/components/Mixins/TableDataFormatterMixin';

export default {
  components: { IconChevron, PageSection, StatusIcon, TableLoader },
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
          label: this.$t('pageInventory.table.id'),
          formatter: this.tableFormatter,
        },
        {
          key: 'health',
          label: this.$t('pageInventory.table.health'),
          formatter: this.tableFormatter,
          tdClass: 'text-nowrap',
        },
        {
          key: 'locationNumber',
          label: this.$t('pageInventory.table.locationNumber'),
          formatter: this.tableFormatter,
        },
        {
          key: 'identifyLed',
          label: this.$t('pageInventory.table.identifyLed'),
          formatter: this.tableFormatter,
        },
      ],
      expandRowLabel: expandRowLabel,
    };
  },
  computed: {
    chassis() {
      return this.$store.getters['chassis/chassis'];
    },
  },
  created() {
    this.$store.dispatch('chassis/getChassisInfo').finally(() => {
      // Emit initial data fetch complete to parent component
      this.$root.$emit('hardware-status-chassis-complete');
    });
  },
  methods: {
    toggleIdentifyLedValue(row) {
      this.$store
        .dispatch('chassis/updateIdentifyLedValue', {
          uri: row.uri,
          identifyLed: row.identifyLed,
        })
        .catch(({ message }) => this.errorToast(message));
    },
    // TO DO: Remove this method when the LocationIndicatorActive is added from backend.
    hasIdentifyLed(identifyLed) {
      return typeof identifyLed === 'boolean';
    },
  },
};
</script>
