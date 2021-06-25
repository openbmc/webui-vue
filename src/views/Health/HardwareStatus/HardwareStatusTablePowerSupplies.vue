<template>
  <page-section :section-title="$t('pageHardwareStatus.powerSupplies')">
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
          :total-number-of-cells="powerSupplies.length"
        ></table-cell-count>
      </b-col>
    </b-row>
    <b-table
      sort-icon-left
      no-sort-reset
      hover
      responsive="md"
      sort-by="health"
      show-empty
      :items="powerSupplies"
      :fields="fields"
      :sort-desc="true"
      :sort-compare="sortCompare"
      :filter="searchFilter"
      :empty-text="$t('global.table.emptyMessage')"
      :empty-filtered-text="$t('global.table.emptySearchMessage')"
      @filtered="onFiltered"
    >
      <!-- Expand chevron icon -->
      <template #cell(expandRow)="row">
        <b-button
          variant="link"
          data-test-id="hardwareStatus-button-expandPowerSupplies"
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
            <b-col sm="6" xl="4">
              <dl>
                <!-- Efficiency percent -->
                <dt>{{ $t('pageHardwareStatus.table.efficiencyPercent') }}:</dt>
                <dd>{{ tableFormatter(item.efficiencyPercent) }}</dd>
                <!-- Firmware version -->
                <dt>{{ $t('pageHardwareStatus.table.firmwareVersion') }}:</dt>
                <dd>{{ tableFormatter(item.firmwareVersion) }}</dd>
                <!-- Indicator LED -->
                <dt>{{ $t('pageHardwareStatus.table.indicatorLed') }}:</dt>
                <dd>{{ tableFormatter(item.indicatorLed) }}</dd>
              </dl>
            </b-col>
            <b-col sm="6" xl="4">
              <dl>
                <!-- Model -->
                <dt>{{ $t('pageHardwareStatus.table.model') }}:</dt>
                <dd>{{ tableFormatter(item.model) }}</dd>
                <!-- Power input watts -->
                <dt>{{ $t('pageHardwareStatus.table.powerInputWatts') }}:</dt>
                <dd>{{ tableFormatter(item.powerInputWatts) }}</dd>
                <!-- Status state -->
                <dt>{{ $t('pageHardwareStatus.table.statusState') }}:</dt>
                <dd>{{ tableFormatter(item.statusState) }}</dd>
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
import TableDataFormatterMixin from '@/components/Mixins/TableDataFormatterMixin';
import TableSortMixin from '@/components/Mixins/TableSortMixin';
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
          key: 'partNumber',
          label: this.$t('pageHardwareStatus.table.partNumber'),
          formatter: this.tableFormatter,
          sortable: true,
        },
        {
          key: 'serialNumber',
          label: this.$t('pageHardwareStatus.table.serialNumber'),
          formatter: this.tableFormatter,
          sortable: true,
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
        : this.powerSupplies.length;
    },
    powerSupplies() {
      return this.$store.getters['powerSupply/powerSupplies'];
    },
  },
  created() {
    this.$store.dispatch('powerSupply/getAllPowerSupplies').finally(() => {
      // Emit initial data fetch complete to parent component
      this.$root.$emit('hardware-status-power-supplies-complete');
    });
  },
  methods: {
    sortCompare(a, b, key) {
      if (key === 'health') {
        return this.sortStatus(a, b, key);
      }
    },
    onFiltered(filteredItems) {
      this.searchTotalFilteredRows = filteredItems.length;
    },
  },
};
</script>
