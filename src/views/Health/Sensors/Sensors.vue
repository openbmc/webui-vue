<template>
  <b-container fluid="xl">
    <page-title />
    <b-row>
      <b-col xl="12" class="text-right">
        <table-filter :filters="tableFilters" @filterChange="onFilterChange" />
      </b-col>
    </b-row>
    <b-row>
      <b-col xl="12">
        <b-table
          sort-icon-left
          no-sort-reset
          sticky-header="75vh"
          sort-by="status"
          :items="filteredSensors"
          :fields="fields"
          :sort-desc="true"
          :sort-compare="sortCompare"
        >
          <template v-slot:cell(status)="{ value }">
            <status-icon :status="statusIcon(value)" />
            {{ value }}
          </template>
          <template v-slot:cell(currentValue)="data">
            {{ data.value }} {{ data.item.units }}
          </template>
          <template v-slot:cell(lowerCaution)="data">
            {{ data.value }} {{ data.item.units }}
          </template>
          <template v-slot:cell(upperCaution)="data">
            {{ data.value }} {{ data.item.units }}
          </template>
          <template v-slot:cell(lowerCritical)="data">
            {{ data.value }} {{ data.item.units }}
          </template>
          <template v-slot:cell(upperCritical)="data">
            {{ data.value }} {{ data.item.units }}
          </template>
        </b-table>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import PageTitle from '../../../components/Global/PageTitle';
import StatusIcon from '../../../components/Global/StatusIcon';
import TableFilter from '../../../components/Global/TableFilter';
import TableFilterMixin from '../../../components/Mixins/TableFilterMixin';

const SENSOR_STATUS = ['OK', 'Warning', 'Critical'];

const valueFormatter = value => {
  if (value === null || value === undefined) {
    return '--';
  }
  return parseFloat(value.toFixed(3));
};

export default {
  name: 'Sensors',
  components: { PageTitle, StatusIcon, TableFilter },
  mixins: [TableFilterMixin],
  data() {
    return {
      fields: [
        {
          key: 'name',
          sortable: true,
          label: this.$t('pageSensors.table.name')
        },
        {
          key: 'status',
          sortable: true,
          label: this.$t('pageSensors.table.status')
        },
        {
          key: 'lowerCritical',
          formatter: valueFormatter,
          label: this.$t('pageSensors.table.lowerCritical')
        },
        {
          key: 'lowerCaution',
          formatter: valueFormatter,
          label: this.$t('pageSensors.table.lowerWarning')
        },

        {
          key: 'currentValue',
          formatter: valueFormatter,
          label: this.$t('pageSensors.table.currentValue')
        },
        {
          key: 'upperCaution',
          formatter: valueFormatter,
          label: this.$t('pageSensors.table.upperWarning')
        },
        {
          key: 'upperCritical',
          formatter: valueFormatter,
          label: this.$t('pageSensors.table.upperCritical')
        }
      ],
      tableFilters: [
        {
          label: this.$t('pageSensors.table.status'),
          values: SENSOR_STATUS
        }
      ],
      activeFilters: []
    };
  },
  computed: {
    allSensors() {
      return this.$store.getters['sensors/sensors'];
    },
    filteredSensors: {
      get: function() {
        return this.getFilteredTableData(this.allSensors, this.activeFilters);
      },
      set: function(newVal) {
        return newVal;
      }
    }
  },
  created() {
    this.$store.dispatch('sensors/getAllSensors');
  },
  methods: {
    statusIcon(status) {
      switch (status) {
        case SENSOR_STATUS[0]:
          return 'success';
        case SENSOR_STATUS[1]:
          return 'warning';
        case SENSOR_STATUS[2]:
          return 'danger';
        default:
          return '';
      }
    },
    sortCompare(a, b, key) {
      if (key === 'status') {
        return (
          SENSOR_STATUS.indexOf(a.status) - SENSOR_STATUS.indexOf(b.status)
        );
      }
    },
    onFilterChange({ activeFilters }) {
      this.activeFilters = activeFilters;
      this.filteredSensors = this.getFilteredTableData(
        this.allSensors,
        activeFilters
      );
    }
  }
};
</script>
