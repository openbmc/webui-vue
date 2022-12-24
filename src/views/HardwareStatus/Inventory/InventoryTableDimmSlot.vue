<template>
  <page-section :section-title="$t('pageInventory.dimmSlot')">
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
          :total-number-of-cells="dimms.length"
        ></table-cell-count>
      </b-col>
    </b-row>
    <b-table
      sort-icon-left
      no-sort-reset
      hover
      sort-by="health"
      responsive="md"
      show-empty
      :items="dimms"
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
          data-test-id="hardwareStatus-button-expandDimms"
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
            <b-col sm="6" xl="6">
              <dl>
                <!-- Part Number -->
                <dt>{{ $t('pageInventory.table.partNumber') }}:</dt>
                <dd>{{ dataFormatter(item.partNumber) }}</dd>
              </dl>
              <dl>
                <!-- Serial Number -->
                <dt>{{ $t('pageInventory.table.serialNumber') }}:</dt>
                <dd>{{ dataFormatter(item.serialNumber) }}</dd>
              </dl>
              <dl>
                <!-- Spare Part Number -->
                <dt>{{ $t('pageInventory.table.sparePartNumber') }}:</dt>
                <dd>{{ dataFormatter(item.sparePartNumber) }}</dd>
              </dl>
              <dl>
                <!-- Model -->
                <dt>{{ $t('pageInventory.table.model') }}:</dt>
                <dd>{{ dataFormatter(item.model) }}</dd>
              </dl>
            </b-col>
            <b-col sm="6" xl="6">
              <dl>
                <!-- Capacity MiB -->
                <dt>{{ $t('pageInventory.table.capacityMiB') }}:</dt>
                <dd>
                  {{ dataFormatter(item.capacityMiB) }}
                  {{ $t('unit.MiB') }}
                </dd>
              </dl>
              <dl>
                <!-- Status-->
                <dt>{{ $t('pageInventory.table.statusState') }}:</dt>
                <dd>{{ dataFormatter(item.statusState) }}</dd>
              </dl>
              <dl>
                <!-- Enabled-->
                <dt>{{ $t('pageInventory.table.enabled') }}:</dt>
                <dd>{{ dataFormatter(item.enabled) }}</dd>
              </dl>
            </b-col>
          </b-row>
          <div class="section-divider mb-3 mt-3"></div>
          <b-row>
            <b-col sm="6" xl="6">
              <dl>
                <!-- Description -->
                <dt>{{ $t('pageInventory.table.description') }}:</dt>
                <dd>{{ dataFormatter(item.description) }}</dd>
              </dl>
              <dl>
                <!-- Memory Type -->
                <dt>{{ $t('pageInventory.table.memoryType') }}:</dt>
                <dd>{{ dataFormatter(item.memoryType) }}</dd>
              </dl>
              <dl>
                <!-- Base Module Type -->
                <dt>{{ $t('pageInventory.table.baseModuleType') }}:</dt>
                <dd>{{ dataFormatter(item.baseModuleType) }}</dd>
              </dl>
            </b-col>
            <b-col sm="6" xl="6">
              <dl>
                <!-- Bus Width Bits -->
                <dt>{{ $t('pageInventory.table.busWidthBits') }}:</dt>
                <dd>
                  {{ dataFormatter(item.busWidthBits) }}
                  {{ $t('unit.bit') }}
                </dd>
              </dl>
              <dl>
                <!-- Data Width Bits -->
                <dt>{{ $t('pageInventory.table.dataWidthBits') }}:</dt>
                <dd>
                  {{ dataFormatter(item.dataWidthBits) }}
                  {{ $t('unit.bit') }}
                </dd>
              </dl>
              <dl>
                <!-- Operating Speed Mhz -->
                <dt>{{ $t('pageInventory.table.operatingSpeedMhz') }}:</dt>
                <dd>
                  {{ dataFormatter(item.operatingSpeedMhz) }}
                  {{ $t('unit.MHz') }}
                </dd>
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

import DataFormatterMixin from '@/components/Mixins/DataFormatterMixin';
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
    DataFormatterMixin,
    TableSortMixin,
    SearchFilterMixin,
  ],
  data() {
    return {
      isBusy: true,
      fields: [
        {
          key: 'expandRow',
          label: '',
          tdClass: 'table-row-expand',
        },
        {
          key: 'id',
          label: this.$t('pageInventory.table.id'),
          formatter: this.dataFormatter,
        },
        {
          key: 'health',
          label: this.$t('pageInventory.table.health'),
          formatter: this.dataFormatter,
          tdClass: 'text-nowrap',
        },
        {
          key: 'locationNumber',
          label: this.$t('pageInventory.table.locationNumber'),
          formatter: this.dataFormatter,
        },
        {
          key: 'identifyLed',
          label: this.$t('pageInventory.table.identifyLed'),
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
        : this.dimms.length;
    },
    dimms() {
      return this.$store.getters['memory/dimms'];
    },
  },
  created() {
    this.$store.dispatch('memory/getDimms').finally(() => {
      // Emit initial data fetch complete to parent component
      this.$root.$emit('hardware-status-dimm-slot-complete');
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
    toggleIdentifyLedValue(row) {
      this.$store
        .dispatch('memory/updateIdentifyLedValue', {
          uri: row.uri,
          identifyLed: row.identifyLed,
        })
        .catch(({ message }) => this.errorToast(message));
    },
    hasIdentifyLed(identifyLed) {
      return typeof identifyLed === 'boolean';
    },
  },
};
</script>
