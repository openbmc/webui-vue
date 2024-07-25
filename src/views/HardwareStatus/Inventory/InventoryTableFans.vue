<template>
  <page-section :section-title="$t('pageInventory.fans')">
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
          :total-number-of-cells="fans.length"
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
      :items="fans"
      :fields="fields"
      :sort-desc="true"
      :sort-compare="sortCompare"
      :filter="searchFilter"
      :empty-text="$t('global.table.emptyMessage')"
      :empty-filtered-text="$t('global.table.emptySearchMessage')"
      :busy="isBusy"
      @filtered="onFiltered"
    >
      <!-- Expand chevron icon -->
      <template #cell(expandRow)="row">
        <b-button
          variant="link"
          data-test-id="hardwareStatus-button-expandFans"
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

      <!-- StatusState -->
      <template #cell(statusState)="{ value }">
        <status-icon :status="statusStateIcon(value)" />
        {{ value }}
      </template>

      <template #row-details="{ item }">
        <b-container fluid>
          <b-row>
            <b-col sm="6" xl="4">
              <dl>
                <!-- ID -->
                <dt>{{ $t('pageInventory.table.id') }}:</dt>
                <dd>{{ dataFormatter(item.id) }}</dd>
              </dl>
              <dl>
                <!-- Serial number -->
                <dt>{{ $t('pageInventory.table.serialNumber') }}:</dt>
                <dd>{{ dataFormatter(item.serialNumber) }}</dd>
              </dl>
              <dl>
                <!-- Part number -->
                <dt>{{ $t('pageInventory.table.partNumber') }}:</dt>
                <dd>{{ dataFormatter(item.partNumber) }}</dd>
              </dl>
              <dl>
                <!-- Fan speed -->
                <dt>{{ $t('pageInventory.table.fanSpeed') }}:</dt>
                <dd>
                  {{ dataFormatter(item.speed) }}
                  {{ $t('unit.RPM') }}
                </dd>
              </dl>
            </b-col>
            <b-col sm="6" xl="4">
              <dl>
                <!-- Status state -->
                <dt>{{ $t('pageInventory.table.statusState') }}:</dt>
                <dd>{{ dataFormatter(item.statusState) }}</dd>
              </dl>
              <dl>
                <!-- Health Rollup state -->
                <dt>{{ $t('pageInventory.table.statusHealthRollup') }}:</dt>
                <dd>{{ dataFormatter(item.healthRollup) }}</dd>
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
import TableCellCount from '@/components/Global/TableCellCount';

import StatusIcon from '@/components/Global/StatusIcon';
import DataFormatterMixin from '@/components/Mixins/DataFormatterMixin';
import TableSortMixin from '@/components/Mixins/TableSortMixin';
import Search from '@/components/Global/Search';
import SearchFilterMixin, {
  searchFilter,
} from '@/components/Mixins/SearchFilterMixin';
import TableRowExpandMixin, {
  expandRowLabel,
} from '@/components/Mixins/TableRowExpandMixin';
import { useI18n } from 'vue-i18n';
import i18n from '@/i18n';

export default {
  components: { IconChevron, PageSection, StatusIcon, Search, TableCellCount },
  mixins: [
    TableRowExpandMixin,
    DataFormatterMixin,
    TableSortMixin,
    SearchFilterMixin,
  ],
  data() {
    return {
      $t: useI18n().t,
      isBusy: true,
      fields: [
        {
          key: 'expandRow',
          label: '',
          tdClass: 'table-row-expand',
          sortable: false,
        },
        {
          key: 'name',
          label: i18n.global.t('pageInventory.table.name'),
          formatter: this.dataFormatter,
          sortable: true,
        },
        {
          key: 'health',
          label: i18n.global.t('pageInventory.table.health'),
          formatter: this.dataFormatter,
          sortable: true,
          tdClass: 'text-nowrap',
        },
        {
          key: 'statusState',
          label: i18n.global.t('pageInventory.table.state'),
          formatter: this.dataFormatter,
          tdClass: 'text-nowrap',
        },
        {
          key: 'partNumber',
          label: i18n.global.t('pageInventory.table.partNumber'),
          formatter: this.dataFormatter,
          sortable: true,
        },
        {
          key: 'serialNumber',
          label: i18n.global.t('pageInventory.table.serialNumber'),
          formatter: this.dataFormatter,
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
        : this.fans.length;
    },
    fans() {
      return this.$store.getters['fan/fans'];
    },
  },
  created() {
    this.$store.dispatch('fan/getFanInfo').finally(() => {
      // Emit initial data fetch complete to parent component
      this.$root.$emit('hardware-status-fans-complete');
      this.isBusy = false;
    });
  },
  methods: {
    sortCompare(a, b, key) {
      if (key === 'health') {
        return this.sortStatus(a, b, key);
      } else if (key === 'statusState') {
        return this.sortStatusState(a, b, key);
      }
    },
    onFiltered(filteredItems) {
      this.searchTotalFilteredRows = filteredItems.length;
    },
    /**
     * Returns the appropriate icon based on the given status.
     *
     * @param {string} status - The status to determine the icon for.
     * @return {string} The icon corresponding to the given status.
     */
    statusStateIcon(status) {
      switch (status) {
        case 'Enabled':
          return 'success';
        case 'Absent':
          return 'warning';
        default:
          return '';
      }
    },
    /**
     * Sorts the status state of two objects based on the provided key.
     *
     * @param {Object} a - The first object to compare.
     * @param {Object} b - The second object to compare.
     * @param {string} key - The key to use for comparison.
     */
    sortStatusState(a, b, key) {
      const statusState = ['Enabled', 'Absent'];
      return statusState.indexOf(a[key]) - statusState.indexOf(b[key]);
    },
  },
};
</script>
