<template>
  <page-section
    :section-title="$t('pageHardwareStatus.systemIndicator.sectionTitle')"
  >
    <div class="form-background pl-4 pt-4 pb-1">
      <b-row>
        <b-col sm="6" md="3">
          <dl>
            <dt>{{ $t('pageHardwareStatus.systemIndicator.powerStatus') }}</dt>
            <dd>{{ tableFormatter(items.powerState) }}</dd>
          </dl>
        </b-col>
        <b-col sm="6" md="3">
          <dl>
            <dt>
              {{ $t('pageHardwareStatus.systemIndicator.identifyLed') }}
            </dt>
            <dd>
              <b-form-checkbox
                id="identifyLedSwitch"
                :value="tableFormatter(items.locationIndicatorActive)"
                data-test-id="hardwareStatus-toggle-identifyLed"
                switch
                @change="toggleIdentifyLedSwitch"
              >
                <span class="sr-only">
                  {{ $t('pageHardwareStatus.systemIndicator.identifyLed') }}
                </span>
                <span v-if="items.locationIndicatorActive">
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
// TODO: System attention LED implementation
import PageSection from '@/components/Global/PageSection';
import BVToastMixin from '@/components/Mixins/BVToastMixin';
import TableDataFormatterMixin from '@/components/Mixins/TableDataFormatterMixin';

export default {
  components: { PageSection },
  mixins: [BVToastMixin, TableDataFormatterMixin],
  computed: {
    systems() {
      return this.$store.getters['system/systems'][0];
    },
    items() {
      if (this.systems) {
        return this.systems;
      } else {
        return {};
      }
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
