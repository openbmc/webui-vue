<template>
  <page-section :section-title="$t('pageInventoryAndLeds.system')">
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
          id="identifyLedSwitch"
          v-model="item.locationIndicatorActive"
          data-test-id="hardwareStatus-toggle-identifyLed"
          switch
          @change="toggleIdentifyLedSwitch"
        >
        </b-form-checkbox>
      </template>

      <template #row-details="{ item }">
        <b-container fluid>
          <b-row>
            <b-col class="mt-2" sm="6">
              <dl>
                <!-- Serial number -->
                <dt>{{ $t('pageInventoryAndLeds.table.serialNumber') }}:</dt>
                <dd>{{ tableFormatter(item.serialNumber) }}</dd>
                <!-- Model -->
                <dt>{{ $t('pageInventoryAndLeds.table.model') }}:</dt>
                <dd>{{ tableFormatter(item.model) }}</dd>
                <!-- Asset tag -->
                <dt>{{ $t('pageInventoryAndLeds.table.assetTag') }}:</dt>
                <dd class="mb-2">
                  {{ tableFormatter(item.assetTag) }}
                </dd>
              </dl>
            </b-col>
            <b-col class="mt-2" sm="6">
              <dl>
                <!-- Status state -->
                <dt>{{ $t('pageInventoryAndLeds.table.statusState') }}:</dt>
                <dd>{{ tableFormatter(item.statusState) }}</dd>
                <!-- Power state -->
                <dt>{{ $t('pageInventoryAndLeds.table.power') }}:</dt>
                <dd>{{ tableFormatter(item.powerState) }}</dd>
                <!-- Health rollup -->
                <dt>{{ $t('pageInventoryAndLeds.table.healthRollup') }}:</dt>
                <dd>{{ tableFormatter(item.healthRollup) }}</dd>
              </dl>
            </b-col>
          </b-row>
          <div class="section-divider mb-3 mt-3"></div>
          <b-row>
            <b-col class="mt-1" sm="6">
              <dl>
                <!-- Manufacturer -->
                <dt>{{ $t('pageInventoryAndLeds.table.manufacturer') }}:</dt>
                <dd>{{ tableFormatter(item.assetTag) }}</dd>
                <!-- Description -->
                <dt>{{ $t('pageInventoryAndLeds.table.description') }}:</dt>
                <dd>{{ tableFormatter(item.description) }}</dd>
                <!-- Sub Model -->
                <dt>{{ $t('pageInventoryAndLeds.table.subModel') }}:</dt>
                <dd>
                  {{ tableFormatter(item.subModel) }}
                </dd>
                <!-- System Type -->
                <dt>{{ $t('pageInventoryAndLeds.table.systemType') }}:</dt>
                <dd>
                  {{ tableFormatter(item.systemType) }}
                </dd>
              </dl>
            </b-col>
            <b-col sm="6">
              <dl>
                <!-- Memory Summary -->
                <dt class="mt-1 mb-2 font-weight-bold float-none">
                  {{ $t('pageInventoryAndLeds.table.memorySummary') }}
                </dt>
                <!-- Status state -->
                <dt>{{ $t('pageInventoryAndLeds.table.statusState') }}:</dt>
                <dd>{{ tableFormatter(item.memorySummaryState) }}</dd>
                <!-- Health -->
                <dt>{{ $t('pageInventoryAndLeds.table.health') }}:</dt>
                <dd>{{ tableFormatter(item.memorySummaryHealth) }}</dd>
                <!-- Health Roll  -->
                <dt>{{ $t('pageInventoryAndLeds.table.healthRollup') }}:</dt>
                <dd>{{ tableFormatter(item.memorySummaryHealthRoll) }}</dd>

                <!-- Processor Summary -->
                <dt class="mt-1 mb-2 font-weight-bold float-none">
                  {{ $t('pageInventoryAndLeds.table.processorSummary') }}
                </dt>
                <!-- Status state -->
                <dt>{{ $t('pageInventoryAndLeds.table.statusState') }}:</dt>
                <dd>{{ tableFormatter(item.processorSummaryState) }}</dd>
                <!-- Health -->
                <dt>{{ $t('pageInventoryAndLeds.table.health') }}:</dt>
                <dd>{{ tableFormatter(item.processorSummaryHealth) }}</dd>
                <!-- Health Rollup -->
                <dt>{{ $t('pageInventoryAndLeds.table.healthRollup') }}:</dt>
                <dd>{{ tableFormatter(item.processorSummaryHealthRoll) }}</dd>
                <!-- Count -->
                <dt>{{ $t('pageInventoryAndLeds.table.count') }}:</dt>
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
import BVToastMixin from '@/components/Mixins/BVToastMixin';
import PageSection from '@/components/Global/PageSection';
import IconChevron from '@carbon/icons-vue/es/chevron--down/20';

import StatusIcon from '@/components/Global/StatusIcon';

import TableRowExpandMixin, {
  expandRowLabel,
} from '@/components/Mixins/TableRowExpandMixin';
import TableDataFormatterMixin from '@/components/Mixins/TableDataFormatterMixin';

export default {
  components: { IconChevron, PageSection, StatusIcon },
  mixins: [BVToastMixin, TableRowExpandMixin, TableDataFormatterMixin],
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
          label: this.$t('pageInventoryAndLeds.table.id'),
          formatter: this.tableFormatter,
        },
        {
          key: 'hardwareType',
          label: this.$t('pageInventoryAndLeds.table.hardwareType'),
          formatter: this.tableFormatter,
          tdClass: 'text-nowrap',
        },
        {
          key: 'health',
          label: this.$t('pageInventoryAndLeds.table.health'),
          formatter: this.tableFormatter,
          tdClass: 'text-nowrap',
        },
        {
          key: 'locationNumber',
          label: this.$t('pageInventoryAndLeds.table.locationNumber'),
          formatter: this.tableFormatter,
        },
        {
          key: 'locationIndicatorActive',
          label: this.$t('pageInventoryAndLeds.table.identifyLed'),
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
  methods: {
    toggleIdentifyLedSwitch(state) {
      this.$store
        .dispatch('system/changeIdentifyLedState', state)
        .catch(({ message }) => this.errorToast(message));
    },
  },
};
</script>
