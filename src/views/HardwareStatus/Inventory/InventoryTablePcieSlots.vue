<template>
  <page-section :section-title="$t('pageInventory.pcieSlots')">
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
          :total-number-of-cells="pcieSlots.length"
        ></table-cell-count>
      </b-col>
    </b-row>
    <b-table
      sort-icon-left
      no-sort-reset
      hover
      responsive="md"
      sort-by="name"
      show-empty
      :items="pcieSlots"
      :fields="fields"
      :sort-desc="false"
      :sort-compare="sortCompare"
      :filter="searchFilter"
      :empty-text="$t('global.table.emptyMessage')"
      :empty-filtered-text="$t('global.table.emptySearchMessage')"
      :busy="isBusy"
      @filtered="onFiltered"
    >
      <!-- StatusState -->
      <template #cell(statusState)="{ value }">
        <status-icon :status="statusStateIcon(value)" />
        {{ value }}
      </template>
      <template #row-details="{ item }">
        <b-container fluid>
          <b-row>
            <b-col sm="6" xl="6">
              <dl>
                <dt>
                  {{ $t('pageInventory.table.slotType') }}
                </dt>
                <dd>{{ dataFormatter(item.type) }}</dd>
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
import TableCellCount from '@/components/Global/TableCellCount';
import DataFormatterMixin from '@/components/Mixins/DataFormatterMixin';
import TableSortMixin from '@/components/Mixins/TableSortMixin';
import Search from '@/components/Global/Search';
import SearchFilterMixin, {
  searchFilter,
} from '@/components/Mixins/SearchFilterMixin';
import BVToastMixin from '@/components/Mixins/BVToastMixin';
import i18n from '@/i18n';
import { useI18n } from 'vue-i18n';
export default {
  components: { PageSection, Search, TableCellCount },
  mixins: [BVToastMixin, DataFormatterMixin, TableSortMixin, SearchFilterMixin],
  data() {
    return {
      $t: useI18n().t,
      isBusy: true,
      fields: [
        {
          key: 'type',
          label: i18n.global.t('pageInventory.table.slotType'),
          formatter: this.dataFormatter,
          sortable: true,
        },
        {
          key: 'pcieType',
          label: i18n.global.t('pageInventory.table.pcieType'),
          formatter: this.dataFormatter,
          sortable: true,
        },
        {
          key: 'statusState',
          label: i18n.global.t('pageInventory.table.state'),
          formatter: this.dataFormatter,
          sortable: true,
        },
        {
          key: 'lanes',
          label: i18n.global.t('pageInventory.table.lanes'),
          formatter: this.dataFormatter,
          sortable: true,
        },
        {
          key: 'locationNumber',
          label: i18n.global.t('pageInventory.table.locationNumber'),
          formatter: this.dataFormatter,
          sortable: true,
        },
      ],
      searchFilter: searchFilter,
      searchTotalFilteredRows: 0,
    };
  },
  computed: {
    filteredRows() {
      return this.searchFilter
        ? this.searchTotalFilteredRows
        : this.pcieSlots.length;
    },
    pcieSlots() {
      return this.$store.getters['pcieSlots/pcieSlots'];
    },
  },
  created() {
    this.$store.dispatch('pcieSlots/getPcieSlotsInfo').finally(() => {
      this.$root.$emit('hardware-status-pcie-slots-complete');
      this.isBusy = false;
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
  },
};
</script>
