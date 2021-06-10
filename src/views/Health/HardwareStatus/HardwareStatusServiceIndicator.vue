<template>
  <page-section :section-title="$t('pageHardwareStatus.systemIndicator.title')">
    <div class="form-background pl-4 pt-4 pb-1">
      <b-row>
        <b-col sm="6" md="3">
          <dl>
            <dt>{{ $t('pageHardwareStatus.systemIndicator.powerStatus') }}</dt>
            <dd>{{ $t('pageHardwareStatus.systemIndicator.on') }}</dd>
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
                v-if="false"
                id="attentionLedSwitch"
                data-test-id="hardwareStatus-toggle-attentionLed"
                switch
              >
                <span class="sr-only">
                  {{ $t('pageHardwareStatus.systemIndicator.attentionLed') }}
                </span>
                <span>
                  {{ $t('global.status.on') }}
                </span>
              </b-form-checkbox>
              <span v-else>{{
                $t('pageHardwareStatus.systemIndicator.off')
              }}</span>
            </dd>
          </dl>
        </b-col>
      </b-row>
    </div>
  </page-section>
</template>
<script>
import PageSection from '@/components/Global/PageSection';

export default {
  components: { PageSection },
  computed: {
    systems() {
      return this.$store.getters['system/systems'][0];
    },
  },
  created() {
    this.$store.dispatch('system/getSystem');
  },
  methods: {
    toggleIdentifyLedSwitch(state) {
      this.$store.dispatch('system/changeIdentifyLedState', state);
    },
  },
};
</script>
