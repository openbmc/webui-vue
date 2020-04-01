<template>
  <b-container fluid="xl">
    <page-title />
    <b-row>
      <b-col md="12">
        <page-section :section-title="$t('pageServerLed.serverLedTitle')">
          <b-form-group :label="$t('pageServerLed.serverLedSubTitle')">
            <b-form-text>
              {{ $t('pageServerLed.serverLedInformation') }}
            </b-form-text>
            <b-form-checkbox v-model="indicatorLED" name="check-button" switch>
              <span v-if="indicatorLED !== 'Off' && indicatorLED">
                {{ $t('global.status.on') }}
              </span>
              <span v-else>
                {{ $t('global.status.off') }}
              </span>
            </b-form-checkbox>
          </b-form-group>
        </page-section>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import PageTitle from '../../../components/Global/PageTitle';
import PageSection from '../../../components/Global/PageSection';

export default {
  name: 'ServerLed',
  components: { PageTitle, PageSection },
  computed: {
    indicatorLED: {
      get() {
        return this.$store.getters['serverLed/getIndicatorValue'];
      },
      set(ledValue) {
        this.$store.commit('serverLed/setIndicatorValue', ledValue);
      }
    }
  },
  created() {
    this.$store.dispatch('serverLed/getIndicatorValue');
  }
};
</script>
