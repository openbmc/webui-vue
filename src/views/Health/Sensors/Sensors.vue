<template>
  <b-container fluid>
    <page-title />
    <b-row>
      <b-col xl="12">
        <b-table
          sort-icon-left
          no-sort-reset
          sticky-header="75vh"
          sort-by="status"
          :items="allSensors"
          :fields="fields"
          :sort-desc="true"
          :sort-compare="sortCompare"
        >
          <template v-slot:cell(status)="{ value }">
            <status-indicator :status="statusIndicator(value)">
              {{ value }}
            </status-indicator>
          </template>
          <template v-slot:cell(current)="data">
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
import StatusIndicator from '../../../components/Global/StatusIndicator';

const valueFormatter = value => {
  if (value === null || value === undefined) {
    return '--';
  }
  return parseFloat(value.toFixed(3));
};

export default {
  name: 'Sensors',
  components: { PageTitle, StatusIndicator },
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
          label: this.$t('pageSensors.table.lowerCaution')
        },

        {
          key: 'current',
          formatter: valueFormatter,
          label: this.$t('pageSensors.table.current')
        },
        {
          key: 'upperCaution',
          formatter: valueFormatter,
          label: this.$t('pageSensors.table.upperCaution')
        },
        {
          key: 'upperCritical',
          formatter: valueFormatter,
          label: this.$t('pageSensors.table.upperCritical')
        }
      ]
    };
  },
  computed: {
    allSensors() {
      return this.$store.getters['sensors/sensors'];
    }
  },
  created() {
    this.$store.dispatch('sensors/getAllSensors');
  },
  methods: {
    statusIndicator(status) {
      switch (status) {
        case 'OK':
          return 'success';
        case 'Warning':
          return 'warning';
        case 'Critical':
          return 'danger';
        default:
          return '';
      }
    },
    sortCompare(a, b, key) {
      if (key === 'status') {
        const status = ['OK', 'Warning', 'Critical'];
        return status.indexOf(a.status) - status.indexOf(b.status);
      }
    }
  }
};
</script>
