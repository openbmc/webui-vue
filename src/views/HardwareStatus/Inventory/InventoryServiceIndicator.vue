<template>
  <page-section
    :section-title="$t('pageInventory.systemIndicator.sectionTitle')"
  >
    <div class="form-background pl-4 pt-4 pb-1">
      <b-row>
        <b-col sm="6" md="3">
          <dl>
            <dt>{{ $t('pageInventory.systemIndicator.powerStatus') }}</dt>
            <dd>
              {{ $t(powerStatus) }}
            </dd>
          </dl>
        </b-col>
        <b-col sm="6" md="3">
          <dl>
            <dt>
              {{ $t('pageInventory.systemIndicator.identifyLed') }}
            </dt>
            <dd>
              <b-form-checkbox
                id="identifyLedSwitchService"
                v-model="systems.locationIndicatorActive"
                data-test-id="inventoryService-toggle-identifyLed"
                switch
                @change="toggleIdentifyLedSwitch"
              >
                <span class="sr-only">
                  {{ $t('pageInventory.systemIndicator.identifyLed') }}
                </span>
                <span v-if="systems.locationIndicatorActive">
                  {{ $t('global.status.on') }}
                </span>
                <span v-else>{{ $t('global.status.off') }}</span>
              </b-form-checkbox>
            </dd>
          </dl>
        </b-col>
      </b-row>
    </div>
  </page-section>
</template>
<script>
import PageSection from '@/components/Global/PageSection';
import BVToastMixin from '@/components/Mixins/BVToastMixin';
import TableDataFormatterMixin from '@/components/Mixins/TableDataFormatterMixin';

export default {
  components: { PageSection },
  mixins: [BVToastMixin, TableDataFormatterMixin],
  computed: {
    systems() {
      let systemData = this.$store.getters['system/systems'][0];
      return systemData ? systemData : {};
    },
    serverStatus() {
      return this.$store.getters['global/serverStatus'];
    },
    powerStatus() {
      if (this.serverStatus === 'unreachable') {
        return `global.status.off`;
      }
      return `global.status.${this.serverStatus}`;
    },
  },
  created() {
    this.$store.dispatch('system/getSystem').finally(() => {
      // Emit initial data fetch complete to parent component
      this.$root.$emit('hardware-status-service-complete');
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
