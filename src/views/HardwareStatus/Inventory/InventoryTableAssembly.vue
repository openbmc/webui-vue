<template>
  <page-section :section-title="$t('pageInventory.assembly')">
    <b-table
      responsive="md"
      hover
      show-empty
      :items="assemblies"
      :fields="fields"
      :empty-text="$t('global.table.emptyMessage')"
    >
      <!-- Expand chevron icon -->
      <template #cell(expandRow)="row">
        <b-button
          variant="link"
          data-test-id="hardwareStatus-button-expandAssembly"
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
          id="identifyLedSwitchAssembly"
          v-model="item.locationIndicatorActive"
          data-test-id="inventoryAssembly-toggle-identifyLed"
          switch
          @change="toggleIdentifyLedSwitch"
        >
          <span class="sr-only">
            {{ $t('pageInventory.table.identifyLed') }}
          </span>
          <span v-if="item.locationIndicatorActive">
            {{ $t('global.status.on') }}
          </span>
          <span v-else>{{ $t('global.status.off') }}</span>
        </b-form-checkbox>
      </template>

      <template #row-details="{ item }">
        <b-container fluid>
          <b-row>
            <b-col class="mt-2" sm="6">
              <dl>
                <!-- Serial number -->
                <dt>{{ $t('pageInventory.table.serialNumber') }}:</dt>
                <dd>{{ tableFormatter(item.serialNumber) }}</dd>
                <!-- Model -->
                <dt>{{ $t('pageInventory.table.model') }}:</dt>
                <dd>{{ tableFormatter(item.model) }}</dd>
                <!-- Asset tag -->
                <dt>{{ $t('pageInventory.table.assetTag') }}:</dt>
                <dd class="mb-2">
                  {{ tableFormatter(item.assetTag) }}
                </dd>
              </dl>
            </b-col>
            <b-col class="mt-2" sm="6">
              <dl>
                <!-- Status state -->
                <dt>{{ $t('pageInventory.table.statusState') }}:</dt>
                <dd>{{ tableFormatter(item.statusState) }}</dd>
                <!-- Power state -->
                <dt>{{ $t('pageInventory.table.power') }}:</dt>
                <dd>{{ tableFormatter(item.powerState) }}</dd>
                <!-- Health rollup -->
                <dt>{{ $t('pageInventory.table.healthRollup') }}:</dt>
                <dd>{{ tableFormatter(item.healthRollup) }}</dd>
              </dl>
            </b-col>
          </b-row>
          <div class="section-divider mb-3 mt-3"></div>
          <b-row>
            <b-col class="mt-1" sm="6">
              <dl>
                <!-- Manufacturer -->
                <dt>{{ $t('pageInventory.table.manufacturer') }}:</dt>
                <dd>{{ tableFormatter(item.assetTag) }}</dd>
                <!-- Description -->
                <dt>{{ $t('pageInventory.table.description') }}:</dt>
                <dd>{{ tableFormatter(item.description) }}</dd>
                <!-- Sub Model -->
                <dt>{{ $t('pageInventory.table.subModel') }}:</dt>
                <dd>
                  {{ tableFormatter(item.subModel) }}
                </dd>
                <!-- Assembly Type -->
                <dt>{{ $t('pageInventory.table.assemblyType') }}:</dt>
                <dd>
                  {{ tableFormatter(item.assemblyType) }}
                </dd>
              </dl>
            </b-col>
            <b-col sm="6">
              <!-- Memory Summary -->
              <p class="mt-1 mb-2 h6 float-none m-0">
                {{ $t('pageInventory.table.memorySummary') }}
              </p>
              <dl class="ml-4">
                <!-- Status state -->
                <dt>{{ $t('pageInventory.table.statusState') }}:</dt>
                <dd>{{ tableFormatter(item.memorySummaryState) }}</dd>
                <!-- Health -->
                <dt>{{ $t('pageInventory.table.health') }}:</dt>
                <dd>{{ tableFormatter(item.memorySummaryHealth) }}</dd>
                <!-- Health Roll  -->
                <dt>{{ $t('pageInventory.table.healthRollup') }}:</dt>
                <dd>{{ tableFormatter(item.memorySummaryHealthRoll) }}</dd>
              </dl>
              <!-- Assembly Summary -->
              <p class="mt-1 mb-2 h6 float-none m-0">
                {{ $t('pageInventory.table.assemblySummary') }}
              </p>
              <dl class="ml-4">
                <!-- Status state -->
                <dt>{{ $t('pageInventory.table.statusState') }}:</dt>
                <dd>{{ tableFormatter(item.assemblySummaryState) }}</dd>
                <!-- Health -->
                <dt>{{ $t('pageInventory.table.health') }}:</dt>
                <dd>{{ tableFormatter(item.assemblySummaryHealth) }}</dd>
                <!-- Health Rollup -->
                <dt>{{ $t('pageInventory.table.healthRollup') }}:</dt>
                <dd>{{ tableFormatter(item.passemblySummaryHealthRoll) }}</dd>
                <!-- Count -->
                <dt>{{ $t('pageInventory.table.count') }}:</dt>
                <dd>{{ tableFormatter(item.assemblyummaryCount) }}</dd>
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
import BVToastMixin from '@/components/Mixins/BVToastMixin';
import TableSortMixin from '@/components/Mixins/TableSortMixin';
import TableDataFormatterMixin from '@/components/Mixins/TableDataFormatterMixin';
import TableRowExpandMixin, {
  expandRowLabel,
} from '@/components/Mixins/TableRowExpandMixin';

export default {
  components: { IconChevron, PageSection, StatusIcon },
  mixins: [
    BVToastMixin,
    TableRowExpandMixin,
    TableDataFormatterMixin,
    TableSortMixin,
  ],
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
          label: this.$t('pageInventory.table.id'),
          formatter: this.tableFormatter,
        },
        {
          key: 'hardwareType',
          label: this.$t('pageInventory.table.hardwareType'),
          formatter: this.tableFormatter,
          tdClass: 'text-nowrap',
        },
        {
          key: 'health',
          label: this.$t('pageInventory.table.health'),
          formatter: this.tableFormatter,
          tdClass: 'text-nowrap',
        },
        {
          key: 'locationNumber',
          label: this.$t('pageInventory.table.locationNumber'),
          formatter: this.tableFormatter,
        },
        {
          key: 'locationIndicatorActive',
          label: this.$t('pageInventory.table.identifyLed'),
          formatter: this.tableFormatter,
        },
      ],
      expandRowLabel: expandRowLabel,
    };
  },
  computed: {
    assembly() {
      return this.$store.getters['assembly/assemblies'];
    },
  },
  created() {
    // this.$store.dispatch('assembly/getAssemblyInfo');
    this.$store.dispatch('assembly/getAssemblyInfo').finally(() => {
      // Emit initial data fetch complete to parent component
      this.$root.$emit('hardware-status-assembly-complete');
    });
  },
  methods: {
    // toggleIdentifyLedSwitch(state) {
    //   // this.$store
    //   //   .dispatch('assembly/changeIdentifyLedState', state)
    //   //   .catch(({ message }) => this.errorToast(message));
    // },
  },
};
</script>
