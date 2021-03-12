<template>
  <b-container fluid="xl">
    <page-title
      :description="
        $t('pageDeconfigurationRecords.pageDescription.description')
      "
      :link="$t('pageDeconfigurationRecords.pageDescription.link')"
      to="/hardware-deconfiguration"
    />
    <b-row>
      <b-col>
        <b-table
          id="table-deconfiguration-records"
          ref="table"
          responsive="md"
          selectable
          no-select-on-click
          sort-icon-left
          hover
          no-sort-reset
          sort-desc
          show-empty
          sort-by="date"
          :fields="fields"
          :items="recordItems"
          :empty-text="$t('global.table.emptyMessage')"
          :current-page="currentPage"
          :per-page="perPage"
          @row-selected="onRowSelected($event, recordItems.length)"
        >
          <!-- Checkbox column -->
          <template #head(checkbox)>
            <b-form-checkbox
              v-model="tableHeaderCheckboxModel"
              :indeterminate="tableHeaderCheckboxIndeterminate"
              @change="onChangeHeaderCheckbox($refs.table)"
            >
              <span class="sr-only">{{ $t('global.table.selectAll') }}</span>
            </b-form-checkbox>
          </template>
          <template #cell(checkbox)="row">
            <b-form-checkbox
              v-model="row.rowSelected"
              @change="toggleSelectRow($refs.table, row.index)"
            >
              <span class="sr-only">{{ $t('global.table.selectItem') }}</span>
            </b-form-checkbox>
          </template>
          <!-- Date column -->
          <template #cell(date)="{ value }">
            <p class="mb-0">{{ value | formatDate }}</p>
            <p class="mb-0">{{ value | formatTime }}</p>
          </template>
        </b-table>
      </b-col>
    </b-row>
    <!-- Table pagination -->
    <b-row>
      <b-col sm="6">
        <b-form-group
          class="table-pagination-select"
          :label="$t('global.table.itemsPerPage')"
          label-for="pagination-items-per-page"
        >
          <b-form-select
            id="pagination-items-per-page"
            v-model="perPage"
            :options="itemsPerPageOptions"
          />
        </b-form-group>
      </b-col>
      <b-col sm="6">
        <b-pagination
          v-model="currentPage"
          first-number
          last-number
          :per-page="perPage"
          :total-rows="getTotalRowCount(recordItems.length)"
          aria-controls="table-event-logs"
        />
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import PageTitle from '@/components/Global/PageTitle';
import LoadingBarMixin from '@/components/Mixins/LoadingBarMixin';
import BVTableSelectableMixin, {
  selectedRows,
  tableHeaderCheckboxModel,
  tableHeaderCheckboxIndeterminate,
} from '@/components/Mixins/BVTableSelectableMixin';
import BVPaginationMixin, {
  currentPage,
  perPage,
  itemsPerPageOptions,
} from '@/components/Mixins/BVPaginationMixin';

export default {
  components: {
    PageTitle,
  },
  mixins: [BVTableSelectableMixin, LoadingBarMixin, BVPaginationMixin],
  beforeRouteLeave(to, from, next) {
    this.hideLoader();
    next();
  },
  data() {
    return {
      fields: [
        {
          key: 'checkbox',
          sortable: false,
        },
        {
          key: 'date',
          label: this.$t('pageDeconfigurationRecords.table.date'),
          sortable: true,
        },
        {
          key: 'type',
          label: this.$t('pageDeconfigurationRecords.table.type'),
          sortable: false,
        },
        {
          key: 'resource',
          label: this.$t('pageDeconfigurationRecords.table.resource'),
          sortable: false,
        },
        {
          key: 'reference',
          label: this.$t('pageDeconfigurationRecords.table.reference'),
          sortable: false,
        },
      ],
      selectedRows: selectedRows,
      tableHeaderCheckboxModel: tableHeaderCheckboxModel,
      tableHeaderCheckboxIndeterminate: tableHeaderCheckboxIndeterminate,
      currentPage: currentPage,
      perPage: perPage,
      itemsPerPageOptions: itemsPerPageOptions,
    };
  },
  computed: {
    recordItems() {
      return this.$store.getters['deconfigurationRecords/deconfigRecords'];
    },
    primarySrc() {
      return this.$store.getters['deconfigurationRecords/primarySrc'];
    },
  },
  created() {
    this.startLoader();
    this.$store
      .dispatch('deconfigurationRecords/getDeconfigurationRecordInfo')
      .finally(() => this.endLoader());
  },
};
</script>

<style lang="sass" scoped></style>
