<template>
  <page-section :section-title="$t('pageHardwareStatus.processors')">
    <!-- Search -->
    <b-row class="align-items-end">
      <b-col sm="6" md="5" xl="4">
        <search
          @change-search="onChangeSearchInput"
          @clear-search="onClearSearchInput"
        />
      </b-col>
      <b-col sm="6" md="3" xl="2">
        <table-cell-count
          :filtered-items-count="filteredRows"
          :total-number-of-cells="processors.length"
        ></table-cell-count>
      </b-col>
    </b-row>
    <b-table
      sort-icon-left
      no-sort-reset
      hover
      responsive="md"
      show-empty
      :items="processors"
      :fields="fields"
      :sort-desc="true"
      :filter="searchFilter"
      :empty-text="$t('global.table.emptyMessage')"
      :empty-filtered-text="$t('global.table.emptySearchMessage')"
      @filtered="onFiltered"
    >
      <!-- Expand button -->
      <template #cell(expandRow)="row">
        <b-button
          variant="link"
          data-test-id="hardwareStatus-button-expandProcessors"
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
                <!-- Part Number -->
                <dt>{{ $t('pageHardwareStatus.table.partNumber') }}:</dt>
                <dd>{{ tableFormatter(item.partNumber) }}</dd>
                <!-- Serial Number -->
                <dt>{{ $t('pageHardwareStatus.table.serialNumber') }}:</dt>
                <dd>{{ tableFormatter(item.serialNumber) }}</dd>
                <!-- Spare Part Number -->
                <dt>{{ $t('pageHardwareStatus.table.sparePartNumber') }}:</dt>
                <dd>{{ tableFormatter(item.sparePartNumber) }}</dd>
                <!-- Model -->
                <dt>{{ $t('pageHardwareStatus.table.model') }}:</dt>
                <dd>{{ tableFormatter(item.model) }}</dd>
                <!-- Asset Tag -->
                <dt>{{ $t('pageHardwareStatus.table.assetTag') }}:</dt>
                <dd>{{ tableFormatter(item.assetTag) }}</dd>
              </dl>
            </b-col>
            <b-col class="mt-2" sm="6" xl="6">
              <dl>
                <!-- Status state -->
                <dt>{{ $t('pageHardwareStatus.table.statusState') }}:</dt>
                <dd>{{ tableFormatter(item.statusState) }}</dd>
                <!-- Health Rollup -->
                <dt>{{ $t('pageHardwareStatus.table.healthRollup') }}:</dt>
                <dd>{{ tableFormatter(item.healthRollup) }}</dd>
              </dl>
            </b-col>
          </b-row>
          <div class="section-divider mb-3 mt-3"></div>
          <b-row>
            <b-col class="mt-1" sm="6" xl="6">
              <dl>
                <!-- Manufacturer -->
                <dt>{{ $t('pageHardwareStatus.table.manufacturer') }}:</dt>
                <dd>{{ tableFormatter(item.manufacturer) }}</dd>
                <!-- Processor Type -->
                <dt>{{ $t('pageHardwareStatus.table.processorType') }}:</dt>
                <dd>{{ tableFormatter(item.processorType) }}</dd>
                <!-- Processor Architecture -->
                <dt>
                  {{ $t('pageHardwareStatus.table.processorArchitecture') }}:
                </dt>
                <dd>{{ tableFormatter(item.processorArchitecture) }}</dd>
                <!-- Instruction Set -->
                <dt>{{ $t('pageHardwareStatus.table.instructionSet') }}:</dt>
                <dd>{{ tableFormatter(item.instructionSet) }}</dd>
                <!-- Version -->
                <dt>{{ $t('pageHardwareStatus.table.version') }}:</dt>
                <dd>{{ tableFormatter(item.version) }}</dd>
              </dl>
            </b-col>
            <b-col class="mt-1" sm="6" xl="6">
              <dl>
                <!-- Min Speed MHz -->
                <dt>{{ $t('pageHardwareStatus.table.minSpeedMHz') }}:</dt>
                <dd>{{ tableFormatter(item.minSpeedMHz) }}</dd>
                <!-- Max Speed MHz -->
                <dt>{{ $t('pageHardwareStatus.table.maxSpeedMHz') }}:</dt>
                <dd>{{ tableFormatter(item.maxSpeedMHz) }}</dd>
                <!-- Total Cores -->
                <dt>{{ $t('pageHardwareStatus.table.totalCores') }}:</dt>
                <dd>{{ tableFormatter(item.totalCores) }}</dd>
                <!-- Total Threads -->
                <dt>{{ $t('pageHardwareStatus.table.totalThreads') }}:</dt>
                <dd>{{ tableFormatter(item.totalThreads) }}</dd>
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
import TableCellCount from '@/components/Global/TableCellCount';
import BVToastMixin from '@/components/Mixins/BVToastMixin';
import TableSortMixin from '@/components/Mixins/TableSortMixin';
import TableDataFormatterMixin from '@/components/Mixins/TableDataFormatterMixin';
import Search from '@/components/Global/Search';
import SearchFilterMixin, {
  searchFilter,
} from '@/components/Mixins/SearchFilterMixin';
import TableRowExpandMixin, {
  expandRowLabel,
} from '@/components/Mixins/TableRowExpandMixin';

export default {
  components: { IconChevron, PageSection, StatusIcon, Search, TableCellCount },
  mixins: [
    BVToastMixin,
    TableRowExpandMixin,
    TableDataFormatterMixin,
    TableSortMixin,
    SearchFilterMixin,
  ],
  data() {
    return {
      fields: [
        {
          key: 'expandRow',
          label: '',
          tdClass: 'table-row-expand',
          sortable: false,
        },
        {
          key: 'id',
          label: this.$t('pageHardwareStatus.table.id'),
          formatter: this.tableFormatter,
          sortable: true,
        },
        {
          key: 'health',
          label: this.$t('pageHardwareStatus.table.health'),
          formatter: this.tableFormatter,
          sortable: true,
          tdClass: 'text-nowrap',
        },
        {
          key: 'locationNumber',
          label: this.$t('pageHardwareStatus.table.locationNumber'),
          formatter: this.tableFormatter,
          sortable: true,
        },
        {
          key: 'identifyLed',
          label: this.$t('pageHardwareStatus.table.identifyLed'),
          formatter: this.tableFormatter,
          sortable: false,
        },
      ],
      searchFilter: searchFilter,
      searchTotalFilteredRows: 0,
      expandRowLabel: expandRowLabel,
    };
  },
  computed: {
    filteredRows() {
      return this.searchFilter
        ? this.searchTotalFilteredRows
        : this.processors.length;
    },
    processors() {
      return this.$store.getters['processors/processors'];
    },
  },
  created() {
    this.$store.dispatch('processors/getProcessorsInfo').finally(() => {
      // Emit initial data fetch complete to parent component
      this.$root.$emit('hardware-status-processors-complete');
    });
  },
  methods: {
    onFiltered(filteredItems) {
      this.searchTotalFilteredRows = filteredItems.length;
    },
    toggleIdentifyLedValue(row) {
      this.$store
        .dispatch('processors/updateIdentifyLedValue', {
          uri: row.uri,
          identifyLed: row.identifyLed,
        })
        .catch(({ message }) => this.errorToast(message));
    },
    // TO DO: remove hasIdentifyLed when the following is merged:
    // https://gerrit.openbmc-project.xyz/c/openbmc/bmcweb/+/37045
    hasIdentifyLed(identifyLed) {
      return typeof identifyLed === 'boolean';
    },
  },
};
</script>
