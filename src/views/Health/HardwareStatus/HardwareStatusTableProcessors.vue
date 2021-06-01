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
      <template #row-details="{ item }">
        <b-container fluid>
          <b-row>
            <b-col sm="6" xl="4">
              <dl>
                <!-- Name -->
                <dt>{{ $t('pageHardwareStatus.table.name') }}:</dt>
                <dd>{{ tableFormatter(item.name) }}</dd>

                <!-- Model -->
                <dt>{{ $t('pageHardwareStatus.table.model') }}:</dt>
                <dd>{{ tableFormatter(item.model) }}</dd>

                <!-- Instruction set -->
                <dt>{{ $t('pageHardwareStatus.table.instructionSet') }}:</dt>
                <dd>{{ tableFormatter(item.instructionSet) }}</dd>

                <!-- Manufacturer -->
                <dt>{{ $t('pageHardwareStatus.table.manufacturer') }}:</dt>
                <dd>{{ tableFormatter(item.manufacturer) }}</dd>
              </dl>
            </b-col>
            <b-col sm="6" xl="4">
              <dl>
                <!-- Architecture -->
                <dt>
                  {{ $t('pageHardwareStatus.table.processorArchitecture') }}:
                </dt>
                <dd>{{ tableFormatter(item.processorArchitecture) }}</dd>

                <!-- Type -->
                <dt>{{ $t('pageHardwareStatus.table.processorType') }}:</dt>
                <dd>{{ tableFormatter(item.processorType) }}</dd>

                <!-- Total cores -->
                <dt>{{ $t('pageHardwareStatus.table.totalCores') }}:</dt>
                <dd>{{ tableFormatter(item.totalCores) }}</dd>

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
  },
};
</script>
