<template>
  <page-section :section-title="$t('pageHardwareStatus.systemIndicator.title')">
    <div class="form-background pl-4 pt-4 pb-1">
      <b-row>
        <b-col>
          <dl>
            <dt>{{ $t('pageHardwareStatus.systemIndicator.powerStatus') }}</dt>
            <dd>{{ $t('pageHardwareStatus.systemIndicator.on') }}</dd>
          </dl>
        </b-col>
        <b-col>
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
                @change="toggleIdentifyLedSwitch"
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
        <b-col>
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
        <b-col>
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
                v-model="systems.lampTest"
                data-test-id="hardwareStatus-toggle-lampTest"
                switch
                @change="toggleLampTestSwitch"
              >
                <span class="sr-only">
                  {{ $t('pageHardwareStatus.systemIndicator.lampTest') }}
                </span>
                <span v-if="systems.lampTest">
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
// TODO: Condition required while rendering for lamp test as it is a downstream data
import PageSection from '@/components/Global/PageSection';
import InfoTooltip from '@/components/Global/InfoTooltip';
export default {
  components: { PageSection, InfoTooltip },
  computed: {
    systems() {
      return this.$store.getters['system/systems'][0];
    },
  },
  created() {
    this.$store.dispatch('system/getSystem');
  },
  methods: {
    toggleIdentifyLedSwitch(ledState) {
      this.$store.dispatch('system/changeIdentifyLedState', ledState);
    },
    toggleLampTestSwitch(lampTestState) {
      this.$store.dispatch('system/changeLampTestState', lampTestState);
    },
  },
};
</script>
