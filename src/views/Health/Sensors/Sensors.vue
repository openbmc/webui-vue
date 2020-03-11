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

const valueFormatter = value => {
  if (value === null || value === undefined) {
    return '--';
  }
  return parseFloat(value.toFixed(3));
};

export default {
  name: 'Sensors',
  components: { PageTitle, StatusIcon },
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
    statusIcon(status) {
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
