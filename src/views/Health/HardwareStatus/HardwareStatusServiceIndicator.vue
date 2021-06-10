<template>
  <page-section
    v-if="systems"
    :section-title="$t('pageHardwareStatus.systemIndicator.sectionTitle')"
  >
    <div class="form-background pl-4 pt-4 pb-1">
      <b-row>
        <b-col sm="6" md="3">
          <dl>
            <dt>{{ $t('pageHardwareStatus.systemIndicator.powerStatus') }}</dt>
            <dd>{{ systems.powerState }}</dd>
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
                v-model="systems.locationIndicatorActive"
                data-test-id="hardwareStatus-toggle-identifyLed"
                switch
                @change="toggleIdentifyLedSwitch"
              >
                <span class="sr-only">
                  {{ $t('pageHardwareStatus.systemIndicator.identifyLed') }}
                </span>
                <span v-if="systems.locationIndicatorActive">
                  {{ $t('global.status.on') }}
                </span>
                <span v-else>{{ $t('global.status.off') }}</span>
              </b-form-checkbox>
            </dd>
          </dl>
        </b-col>
        <b-col sm="6" md="3">
          <dl>
            <dt>
              {{ $t('pageHardwareStatus.systemIndicator.attentionLed') }}
            </dt>
            <dd>
              <b-form-checkbox
                id="attentionLedSwitch"
                data-test-id="hardwareStatus-toggle-attentionLed"
                switch
              >
                <span class="sr-only">
                  {{ $t('pageHardwareStatus.systemIndicator.attentionLed') }}
                </span>
                <span v-if="false">
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
// TODO: Attention LED implementation
import PageSection from '@/components/Global/PageSection';
import BVToastMixin from '@/components/Mixins/BVToastMixin';

export default {
  components: { PageSection },
  mixins: [BVToastMixin],
  computed: {
    systems() {
      return this.$store.getters['system/systems'][0];
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
