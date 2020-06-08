<template>
  <page-section :section-title="$t('pageHardwareStatus.dimmSlot')">
    <b-table
      sort-icon-left
      no-sort-reset
      sort-by="health"
      :items="dimms"
      :fields="fields"
      :sort-desc="true"
      :sort-compare="sortCompare"
    >
      <!-- Expand chevron icon -->
      <template v-slot:cell(expandRow)="row">
        <b-button variant="link" @click="row.toggleDetails">
          <icon-chevron />
        </b-button>
      </template>

      <!-- Health -->
      <template v-slot:cell(health)="{ value }">
        <status-icon :status="statusIcon(value)" />
        {{ value }}
      </template>

      <template v-slot:row-details="{ item }">
        <b-container fluid>
          <b-row>
            <b-col sm="6" xl="4">
              <dl>
                <!-- Status state -->
                <dt>{{ $t('pageHardwareStatus.table.statusState') }}:</dt>
                <dd>{{ tableFormatter(item.statusState) }}</dd>
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
import TableDataFormatter from '@/components/Mixins/TableDataFormatter';
import TableSortMixin from '@/components/Mixins/TableSortMixin';

export default {
  components: { IconChevron, PageSection, StatusIcon },
  mixins: [TableDataFormatter, TableSortMixin],
  data() {
    return {
      fields: [
        {
          key: 'expandRow',
          label: '',
          tdClass: 'row-expand',
          sortable: false
        },
        {
          key: 'id',
          label: this.$t('pageHardwareStatus.table.id'),
          formatter: this.tableFormatter,
          sortable: true
        },
        {
          key: 'health',
          label: this.$t('pageHardwareStatus.table.health'),
          formatter: this.tableFormatter,
          sortable: true
        },
        {
          key: 'partNumber',
          label: this.$t('pageHardwareStatus.table.partNumber'),
          formatter: this.tableFormatter,
          sortable: true
        },
        {
          key: 'serialNumber',
          label: this.$t('pageHardwareStatus.table.serialNumber'),
          formatter: this.tableFormatter,
          sortable: true
        }
      ]
    };
  },
  computed: {
    dimms() {
      return this.$store.getters['memory/dimms'];
    }
  },
  created() {
    this.$store.dispatch('memory/getDimms').finally(() => {
      // Emit intial data fetch complete to parent component
      this.$root.$emit('hardwareStatus::dimmSlot::complete');
    });
  },
  methods: {
    sortCompare(a, b, key) {
      if (key === 'health') {
        return this.sortStatus(a, b, key);
      }
    }
  }
};
</script>
