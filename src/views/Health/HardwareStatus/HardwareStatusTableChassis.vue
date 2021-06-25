<template>
  <page-section :section-title="$t('pageHardwareStatus.chassis')">
    <b-table
      responsive="md"
      hover
      :items="chassis"
      :fields="fields"
      show-empty
      :empty-text="$t('global.table.emptyMessage')"
    >
      <!-- Expand chevron icon -->
      <template #cell(expandRow)="row">
        <b-button
          variant="link"
          data-test-id="hardwareStatus-button-expandChassis"
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

      <template #row-details="{ item }">
        <b-container fluid>
          <b-row>
            <b-col sm="6" xl="4">
              <dl>
                <!-- Chassis type -->
                <dt>{{ $t('pageHardwareStatus.table.chassisType') }}:</dt>
                <dd>{{ tableFormatter(item.chassisType) }}</dd>
                <!-- Manufacturer -->
                <dt>{{ $t('pageHardwareStatus.table.manufacturer') }}:</dt>
                <dd>{{ tableFormatter(item.manufacturer) }}</dd>
                <!-- Power state -->
                <dt>{{ $t('pageHardwareStatus.table.powerState') }}:</dt>
                <dd>{{ tableFormatter(item.powerState) }}</dd>
              </dl>
            </b-col>
            <b-col sm="6" xl="4">
              <dl>
                <!-- Health rollup -->
                <dt>
                  {{ $t('pageHardwareStatus.table.statusHealthRollup') }}:
                </dt>
                <dd>{{ tableFormatter(item.healthRollup) }}</dd>
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

import TableRowExpandMixin, {
  expandRowLabel,
} from '@/components/Mixins/TableRowExpandMixin';
import TableDataFormatterMixin from '@/components/Mixins/TableDataFormatterMixin';

export default {
  components: { IconChevron, PageSection, StatusIcon },
  mixins: [TableRowExpandMixin, TableDataFormatterMixin],
  data() {
    return {
      fields: [
        {
          key: 'expandRow',
          label: '',
          tdClass: 'table-row-expand',
        },
        {
          key: 'id',
          label: this.$t('pageHardwareStatus.table.id'),
          formatter: this.tableFormatter,
        },
        {
          key: 'health',
          label: this.$t('pageHardwareStatus.table.health'),
          formatter: this.tableFormatter,
          tdClass: 'text-nowrap',
        },
        {
          key: 'partNumber',
          label: this.$t('pageHardwareStatus.table.partNumber'),
          formatter: this.tableFormatter,
        },
        {
          key: 'serialNumber',
          label: this.$t('pageHardwareStatus.table.serialNumber'),
          formatter: this.tableFormatter,
        },
      ],
      expandRowLabel: expandRowLabel,
    };
  },
  computed: {
    chassis() {
      return this.$store.getters['chassis/chassis'];
    },
  },
  created() {
    this.$store.dispatch('chassis/getChassisInfo').finally(() => {
      // Emit initial data fetch complete to parent component
      this.$root.$emit('hardware-status-chassis-complete');
    });
  },
};
</script>
