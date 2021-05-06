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
      <template #cell(locationIndicatorActive)="{ item }">
        <b-form-checkbox
          id="indicatorLed"
          v-model="item.locationIndicatorActive"
          :disabled="true"
          switch
        >
        </b-form-checkbox>
      </template>
      <template #row-details="{ item }">
        <b-container fluid>
          <b-row>
            <b-col class="mt-2" sm="6">
              <dl>
                <!-- Part number -->
                <dt>{{ $t('pageHardwareStatus.table.partNumber') }}:</dt>
                <dd>{{ tableFormatter(item.partNumber) }}</dd>
                <br />
                <!-- Serial Number -->
                <dt>{{ $t('pageHardwareStatus.table.serialNumber') }}:</dt>
                <dd>{{ tableFormatter(item.serialNumber) }}</dd>
                <br />
                <!-- Model -->
                <dt>{{ $t('pageHardwareStatus.table.model') }}:</dt>
                <dd class="mb-2">
                  {{ tableFormatter(item.model) }}
                </dd>
              </dl>
            </b-col>
            <b-col class="mt-2" sm="6">
              <dl>
                <!-- Status state -->
                <dt>{{ $t('pageHardwareStatus.table.statusState') }}:</dt>
                <dd>{{ tableFormatter(item.statusState) }}</dd>
                <br />
                <!-- Power state -->
                <dt>{{ $t('pageHardwareStatus.table.power') }}:</dt>
                <dd>{{ tableFormatter(item.power) }}</dd>
                <br />
                <!-- Health rollup -->
                <dt>{{ $t('pageHardwareStatus.table.healthRollup') }}:</dt>
                <dd>{{ tableFormatter(item.healthRollup) }}</dd>
              </dl>
            </b-col>
          </b-row>
          <div class="section-divider"></div>
          <b-row>
            <b-col class="mt-2" sm="6">
              <dl>
                <!-- Manufacturer -->
                <dt>{{ $t('pageHardwareStatus.table.manufacturer') }}:</dt>
                <dd>{{ tableFormatter(item.manufacturer) }}</dd>
                <br />
                <!-- Chassis Type -->
                <dt>{{ $t('pageHardwareStatus.table.chassisType') }}:</dt>
                <dd>{{ tableFormatter(item.chassisType) }}</dd>
              </dl>
            </b-col>
            <b-col sm="6"></b-col>
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
          key: 'hardwareType',
          label: this.$t('pageHardwareStatus.table.hardwareType'),
          formatter: this.tableFormatter,
          tdClass: 'text-nowrap',
        },
        {
          key: 'health',
          label: this.$t('pageHardwareStatus.table.health'),
          formatter: this.tableFormatter,
          tdClass: 'text-nowrap',
        },
        {
          key: 'locationNumber',
          label: this.$t('pageHardwareStatus.table.locationNumber'),
          formatter: this.tableFormatter,
        },
        {
          key: 'locationIndicatorActive',
          label: this.$t('pageHardwareStatus.table.indicatorLed'),
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
  beforeMount() {
    console.log('store value', this.$store);
    console.log(
      'value of actual variable',
      this.$store.getters['system/systems']
    );
  },
};
</script>
