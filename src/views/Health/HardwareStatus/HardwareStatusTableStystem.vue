<template>
  <page-section :section-title="$t('pageHardwareStatus.system')">
    <b-table
      responsive="md"
      hover
      show-empty
      :items="systems"
      :fields="fields"
      :empty-text="$t('global.table.emptyMessage')"
    >
      <!-- Expand chevron icon -->
      <template #cell(expandRow)="row">
        <b-button
          variant="link"
          data-test-id="hardwareStatus-button-expandSystem"
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
          id="ipmiSwitch"
          v-model="item.locationIndicatorActive"
          :disabled="true"
          data-test-id="security-toggle-networkIpmi"
          switch
        >
        </b-form-checkbox>
      </template>

      <template #row-details="{ item }">
        <b-container fluid>
          <b-row>
            <b-col class="mt-2" sm="6">
              <dl>
                <!-- Serial number -->
                <dt>{{ $t('pageHardwareStatus.table.serialNumber') }}:</dt>
                <dd>{{ tableFormatter(item.serialNumber) }}</dd>
                <br />
                <!-- Model -->
                <dt>{{ $t('pageHardwareStatus.table.CCIN') }}:</dt>
                <dd>{{ tableFormatter(item.model) }}</dd>
                <br />
                <!-- Asset tag -->
                <dt>{{ $t('pageHardwareStatus.table.assetTag') }}:</dt>
                <dd class="mb-2">
                  {{ tableFormatter(item.assetTag) }}
                </dd>
                <div class="mt-2 system-section"></div>
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
                <dd>{{ tableFormatter(item.processorSummaryState) }}</dd>
                <br />
                <!-- Health rollup -->
                <dt>{{ $t('pageHardwareStatus.table.healthRoll') }}:</dt>
                <dd>{{ tableFormatter(item.healthRollup) }}</dd>
              </dl>
            </b-col>
          </b-row>
          <b-row>
            <b-col class="mt-2" sm="6">
              <dl>
                <!-- Manufacturer -->
                <dt>{{ $t('pageHardwareStatus.table.manufacturer') }}:</dt>
                <dd>{{ tableFormatter(item.assetTag) }}</dd>
                <br />
                <!-- Description -->
                <dt>{{ $t('pageHardwareStatus.table.description') }}:</dt>
                <dd>{{ tableFormatter(item.description) }}</dd>
                <br />
                <!-- Sub Model -->
                <dt>{{ $t('pageHardwareStatus.table.subModel') }}:</dt>
                <dd>
                  {{ tableFormatter(item.subModel) }}
                </dd>
                <br />
                <!-- System Type -->
                <dt>{{ $t('pageHardwareStatus.table.systemType') }}:</dt>
                <dd>
                  {{ tableFormatter(item.systemType) }}
                </dd>
              </dl>
            </b-col>
            <b-col sm="6">
              <dl>
                <!-- Memory Summary -->
                <dt class="font-weight-bold mt-2 mb-2 d-block">
                  {{ $t('pageHardwareStatus.table.memorySummary') }}
                </dt>
                <!-- Status state -->
                <dt>{{ $t('pageHardwareStatus.table.statusState') }}:</dt>
                <dd>{{ tableFormatter(item.memorySummaryState) }}</dd>
                <br />
                <!-- Health -->
                <dt>{{ $t('pageHardwareStatus.table.health') }}:</dt>
                <dd>{{ tableFormatter(item.memorySummaryHealth) }}</dd>
                <br />
                <!-- Health Roll  -->
                <dt>{{ $t('pageHardwareStatus.table.healthRoll') }}:</dt>
                <dd>{{ tableFormatter(item.memorySummaryHealthRoll) }}</dd>
                <br />

                <!-- Processor Summary -->
                <dt class="font-weight-bold mt-2 mb-2 d-block">
                  {{ $t('pageHardwareStatus.table.processorSummary') }}
                </dt>
                <!-- Status state -->
                <dt>{{ $t('pageHardwareStatus.table.statusState') }}:</dt>
                <dd>{{ tableFormatter(item.processorSummaryState) }}</dd>
                <br />
                <!-- Health -->
                <dt>{{ $t('pageHardwareStatus.table.health') }}:</dt>
                <dd>{{ tableFormatter(item.processorSummaryHealth) }}</dd>
                <br />
                <!-- Health Rollup -->
                <dt>{{ $t('pageHardwareStatus.table.healthRoll') }}:</dt>
                <dd>{{ tableFormatter(item.processorSummaryHealthRoll) }}</dd>
                <br />
                <!-- Count -->
                <dt>{{ $t('pageHardwareStatus.table.count') }}:</dt>
                <dd>{{ tableFormatter(item.processorSummaryCount) }}</dd>
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
          label: this.$t('pageHardwareStatus.table.identifyLED'),
          formatter: this.tableFormatter,
        },
      ],
      expandRowLabel: expandRowLabel,
    };
  },
  computed: {
    systems() {
      return this.$store.getters['system/systems'];
    },
  },
  created() {
    this.$store.dispatch('system/getSystem').finally(() => {
      // Emit initial data fetch complete to parent component
      this.$root.$emit('hardware-status-system-complete');
    });
  },
};
</script>

<style lang="scss" scoped>
.system-section {
  width: 70%;
  border-bottom: 1px solid gray('300');
}
</style>
