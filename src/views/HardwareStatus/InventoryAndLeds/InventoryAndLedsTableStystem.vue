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

      <template #row-details="{ item }">
        <b-container fluid>
          <b-row>
            <b-col sm="6" xl="4">
              <dl>
                <!-- Asset tag -->
                <dt>{{ $t('pageInventoryAndLeds.table.assetTag') }}:</dt>
                <dd>{{ tableFormatter(item.assetTag) }}</dd>
                <br />
                <!-- Description -->
                <dt>{{ $t('pageInventoryAndLeds.table.description') }}:</dt>
                <dd>{{ tableFormatter(item.description) }}</dd>
                <br />
                <!-- Indicator LED -->
                <dt>{{ $t('pageInventoryAndLeds.table.indicatorLed') }}:</dt>
                <dd v-if="item.locationIndicatorActive === true">
                  {{ $t('global.status.on') }}
                </dd>
                <dd v-else-if="item.locationIndicatorActive === false">
                  {{ $t('global.status.off') }}
                </dd>
                <dd v-else>--</dd>
                <br />
                <!-- Model -->
                <dt>{{ $t('pageInventoryAndLeds.table.model') }}:</dt>
                <dd>{{ tableFormatter(item.model) }}</dd>
              </dl>
            </b-col>
            <b-col sm="6" xl="4">
              <dl>
                <!-- Power state -->
                <dt>{{ $t('pageInventoryAndLeds.table.powerState') }}:</dt>
                <dd>{{ tableFormatter(item.powerState) }}</dd>
                <br />
                <!-- Health rollup -->
                <dt>
                  {{ $t('pageInventoryAndLeds.table.statusHealthRollup') }}:
                </dt>
                <dd>{{ tableFormatter(item.healthRollup) }}</dd>
                <br />
                <!-- Status state -->
                <dt>{{ $t('pageInventoryAndLeds.table.statusState') }}:</dt>
                <dd>{{ tableFormatter(item.statusState) }}</dd>
                <br />
                <!-- System type -->
                <dt>{{ $t('pageInventoryAndLeds.table.systemType') }}:</dt>
                <dd>{{ tableFormatter(item.systemType) }}</dd>
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
          label: this.$t('pageInventoryAndLeds.table.id'),
          formatter: this.tableFormatter,
        },
        {
          key: 'health',
          label: this.$t('pageInventoryAndLeds.table.health'),
          formatter: this.tableFormatter,
          tdClass: 'text-nowrap',
        },
        {
          key: 'partNumber',
          label: this.$t('pageInventoryAndLeds.table.partNumber'),
          formatter: this.tableFormatter,
        },
        {
          key: 'serialNumber',
          label: this.$t('pageInventoryAndLeds.table.serialNumber'),
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
