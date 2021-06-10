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
              {{ $t('pageHardwareStatus.systemIndicator.sysIdentifyLed') }}
            </dt>
            <dd>
              <b-form-checkbox
                id="identifyLEDSwitch"
                v-model="systems.locationIndicatorActive"
                data-test-id="hardwareStatus-toggle-identifyLED"
                switch
                @change="changeIdentifyLedState"
              >
                <span class="sr-only">
                  {{ $t('pageHardwareStatus.systemIndicator.sysIdentifyLed') }}
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
              {{ $t('pageHardwareStatus.systemIndicator.sysAttentionLed') }}
            </dt>
            <dd>
              <b-form-checkbox
                v-if="false"
                id="attentionLEDSwitch"
                data-test-id="hardwareStatus-toggle-attentionLED"
                switch
              >
                <span class="sr-only">
                  {{ $t('pageHardwareStatus.systemIndicator.sysAttentionLed') }}
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
        <b-col sm="6" md="3">
          <dl>
            <dt>
              {{ $t('pageHardwareStatus.systemIndicator.lampTest') }}
              <info-tooltip
                :title="
                  $t('pageHardwareStatus.systemIndicator.lampTestTooltip')
                "
              />
            </dt>
            <dd>
              <b-form-checkbox
                id="lampSwitch"
                data-test-id="hardwareStatus-toggle-lampTest"
                switch
              >
                <span class="sr-only">
                  {{ $t('pageHardwareStatus.systemIndicator.lampTest') }}
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
import PageSection from '@/components/Global/PageSection';
import InfoTooltip from '@/components/Global/InfoTooltip';

export default {
  components: { PageSection, InfoTooltip },
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
    changeIdentifyLedState(state) {
      this.$store.dispatch('system/saveIdentifyLedState', state);
    },
  },
};
</script>
