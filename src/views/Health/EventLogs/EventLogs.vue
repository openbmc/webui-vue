<template>
  <b-container fluid="xl">
    <page-title />
    <b-row>
      <b-col class="text-right">
        <table-filter :filters="tableFilters" @filterChange="onFilterChange" />
      </b-col>
    </b-row>
    <b-row>
      <b-col>
        <b-table
          :fields="fields"
          :items="filteredLogs"
          sort-icon-left
          no-sort-reset
          sort-desc
          show-empty
          sort-by="date"
          :sort-compare="onSortCompare"
          :empty-text="$t('pageEventLogs.table.emptyMessage')"
        >
          <template v-slot:cell(severity)="{ value }">
            <status-icon :status="getStatus(value)" />
            {{ value }}
          </template>
          <template v-slot:cell(date)="{ value }">
            {{ value | formatDate }} {{ value | formatTime }}
          </template>
        </b-table>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import PageTitle from '@/components/Global/PageTitle';
import StatusIcon from '@/components/Global/StatusIcon';
import TableFilter from '@/components/Global/TableFilter';

import LoadingBarMixin from '@/components/Mixins/LoadingBarMixin';
import TableFilterMixin from '@/components/Mixins/TableFilterMixin';

const SEVERITY = ['OK', 'Warning', 'Critical'];

export default {
  components: { PageTitle, StatusIcon, TableFilter },
  mixins: [LoadingBarMixin, TableFilterMixin],
  data() {
    return {
      fields: [
        {
          key: 'id',
          label: this.$t('pageEventLogs.table.id'),
          sortable: true
        },
        {
          key: 'severity',
          label: this.$t('pageEventLogs.table.severity'),
          sortable: true
        },
        {
          key: 'type',
          label: this.$t('pageEventLogs.table.type'),
          sortable: true
        },
        {
          key: 'date',
          label: this.$t('pageEventLogs.table.date'),
          sortable: true
        },
        {
          key: 'description',
          label: this.$t('pageEventLogs.table.description')
        }
      ],
      tableFilters: [
        {
          label: this.$t('pageEventLogs.table.severity'),
          values: SEVERITY
        }
      ],
      activeFilters: []
    };
  },
  computed: {
    allLogs() {
      return this.$store.getters['eventLog/allEvents'];
    },
    filteredLogs: {
      get: function() {
        return this.getFilteredTableData(this.allLogs, this.activeFilters);
      },
      set: function(newVal) {
        return newVal;
      }
    }
  },
  created() {
    this.startLoader();
    this.$store
      .dispatch('eventLog/getEventLogData')
      .finally(() => this.endLoader());
  },
  beforeRouteLeave(to, from, next) {
    this.hideLoader();
    next();
  },
  methods: {
    getStatus(serverity) {
      switch (serverity) {
        case SEVERITY[2]:
          return 'danger';
        case SEVERITY[1]:
          return 'warning';
        case SEVERITY[0]:
          return 'success';
        default:
          return '';
      }
    },
    onFilterChange({ activeFilters }) {
      this.activeFilters = activeFilters;
      this.filteredLogs = this.getFilteredTableData(
        this.allLogs,
        activeFilters
      );
    },
    onSortCompare(a, b, key) {
      if (key === 'severity') {
        return SEVERITY.indexOf(a.status) - SEVERITY.indexOf(b.status);
      }
    }
  }
};
</script>
