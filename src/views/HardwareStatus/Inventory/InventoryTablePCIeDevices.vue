<template>
  <page-section :section-title="$t('pageInventory.pcieDevices')">
    <!-- Search -->
    <b-row>
      <b-col sm="6" md="5" xl="4">
        <search
          @changeSearch="onChangeSearchInput"
          @clearSearch="onClearSearchInput"
        />
      </b-col>
      <b-col sm="6" md="3" xl="2">
        <table-cell-count
          :filtered-items-count="filteredRows"
          :total-number-of-cells="pcieDevices.length"
        ></table-cell-count>
      </b-col>
    </b-row>
    <b-table
      sort-icon-left
      no-sort-reset
      hover
      responsive="md"
      show-empty
      :items="pcieDevices"
      :fields="fields"
      :empty-text="$t('global.table.emptyMessage')"
      :empty-filtered-text="$t('global.table.emptySearchMessage')"
    >
      <!-- Expand button -->
      <template #cell(expandRow)="row">
        <b-button
          variant="link"
          data-test-id="hardwareStatus-button-expandProcessors"
          :aria-label="expandRowLabel"
          @click="toggleRowDetails(row)"
        >
          <icon-chevron :title="expandRowLabel" />
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
            <b-col sm="6" xl="6">
              <dl>
                <dt>{{ $t('pageInventory.table.deviceType') }}:</dt>
                <dd>{{ dataFormatter(item.deviceType) }}</dd>
                <br />
                <dt>{{ $t('pageInventory.table.id') }}:</dt>
                <dd>{{ dataFormatter(item.id) }}</dd>
              </dl>
            </b-col>
            <b-col sm="6" xl="6">
              <dl>
                <dt>{{ $t('pageInventory.table.revisionId') }}:</dt>
                <dd>{{ dataFormatter(item.revisionId) }}</dd>
                <br />
                <dt>{{ $t('pageInventory.table.subsystemId') }}:</dt>
                <dd>{{ dataFormatter(item.subsystemId) }}</dd>
                <br />
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
import DataFormatterMixin from '@/components/Mixins/DataFormatterMixin';
import Search from '@/components/Global/Search';
import SearchFilterMixin from '@/components/Mixins/SearchFilterMixin';
import TableRowExpandMixin from '@/components/Mixins/TableRowExpandMixin';

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
      fields: [
        {
          key: 'expandRow',
          label: '',
          tdClass: 'table-row-expand',
          sortable: false,
        },
        {
          key: 'manufacturer',
          label: this.$t('pageInventory.table.manufacturer'),
          formatter: this.dataFormatter,
          sortable: true,
        },
        {
          key: 'deviceClass',
          label: this.$t('pageInventory.table.deviceClass'),
          formatter: this.dataFormatter,
          sortable: true,
        },
        {
          key: 'deviceId',
          label: this.$t('pageInventory.table.deviceId'),
          formatter: this.dataFormatter,
          sortable: true,
        },
      ],
      searchTotalFilteredRows: 0,
    };
  },
  computed: {
    filteredRows() {
      return this.searchFilter
        ? this.searchTotalFilteredRows
        : this.pcieDevices.length;
    },
    pcieDevices() {
      return this.$store.getters['pcieDevices/pcieDevices'];
    },
  },
  mounted() {
    this.$store.dispatch('pcieDevices/getPCIeDevicesInfo').finally(() => {
      // Emit initial data fetch complete to parent component
      this.$root.$emit('hardwareStatus::pcieDevices::complete');
    });
  },
};
</script>
