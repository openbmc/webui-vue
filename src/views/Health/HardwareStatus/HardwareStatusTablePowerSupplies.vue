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

      <!-- Toggle identify LED -->
      <template #cell(identifyLed)="row">
        <b-form-checkbox
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
      </template>
      <template #row-details="{ item }">
        <b-container fluid>
          <b-row>
            <b-col sm="6" xl="4">
              <dl>
                <!-- Part number -->
                <dt>{{ $t('pageHardwareStatus.table.partNumber') }}:</dt>
                <dd>{{ tableFormatter(item.partNumber) }}</dd>
              </dl>
              <dl>
                <!-- Serial number -->
                <dt>{{ $t('pageHardwareStatus.table.serialNumber') }}:</dt>
                <dd>{{ tableFormatter(item.serialNumber) }}</dd>
              </dl>
              <dl>
                <!-- Spare part number -->
                <dt>{{ $t('pageHardwareStatus.table.sparePartNumber') }}:</dt>
                <dd>{{ tableFormatter(item.sparePartNumber) }}</dd>
              </dl>

              <dl>
                <!-- Model -->
                <dt>{{ $t('pageHardwareStatus.table.model') }}:</dt>
                <dd>{{ tableFormatter(item.model) }}</dd>
              </dl>
            </b-col>
            <b-col sm="6" xl="4">
              <dl>
                <!-- Status state -->
                <dt>{{ $t('pageHardwareStatus.table.statusState') }}:</dt>
                <dd>{{ tableFormatter(item.statusState) }}</dd>
              </dl>
              <dl>
                <!-- Status Health rollup state -->
                <dt>
                  {{ $t('pageHardwareStatus.table.statusHealthRollup') }}:
                </dt>
                <dd>{{ tableFormatter(item.statusHealth) }}</dd>
              </dl>
              <dl>
                <!-- Efficiency percent -->
                <dt>{{ $t('pageHardwareStatus.table.efficiencyPercent') }}:</dt>
                <dd>{{ tableFormatter(item.efficiencyPercent) }}</dd>
              </dl>
            </b-col>
          </b-row>
          <div class="section-divider"></div>
          <b-row>
            <b-col sm="6" xl="4">
              <dl>
                <!-- Manufacturer -->
                <dt>{{ $t('pageHardwareStatus.table.manufacturer') }}:</dt>
                <dd>{{ tableFormatter(item.manufacturer) }}</dd>
              </dl>
            </b-col>
            <b-col sm="6" xl="4">
              <dl>
                <!-- Firmware version -->
                <dt>{{ $t('pageHardwareStatus.table.firmwareVersion') }}:</dt>
                <dd>{{ tableFormatter(item.firmwareVersion) }}</dd>
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
          key: 'hardwareType',
          label: this.$t('pageHardwareStatus.table.hardwareType'),
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
    this.$store.dispatch('powerSupply/getPowerSupply').finally(() => {
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
    toggleIdentifyLedValue(row) {
      console.log(row);
      this.$store
        .dispatch('powerSupply/updateIdentifyLedValue', {
          uri: row.uri,
          identifyLed: row.identifyLed,
        })
        .then((message) => this.successToast(message))
        .catch(({ message }) => this.errorToast(message));
    },
  },
};
</script>
