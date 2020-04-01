<template>
  <div class="container-fluid px-0">
    <page-title />
    <page-section :section-title="$t('pageServerLed.serverLedTitle')" />
    <b-row>
      <b-col md="12">
        <page-section>
          <h6 class="font-weight-bold">
            {{ $t('pageServerLed.serverLedSubTitle') }}
          </h6>
          <p class="mb-3">{{ $t('pageServerLed.serverLedInformation') }}</p>
          <b-form-checkbox v-model="indicatorLED" name="check-button" switch>
            <span v-if="indicatorLED !== 'Off' && indicatorLED">
              {{ $t('global.status.on') }}
            </span>
            <span v-else>
              {{ $t('global.status.off') }}
            </span>
          </b-form-checkbox>
        </page-section>
      </b-col>
    </b-row>
  </div>
</template>

<script>
import PageTitle from '../../../components/Global/PageTitle';
import PageSection from '../../../components/Global/PageSection';
//import { mapGetters } from 'vuex';

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

<style lang="scss" scoped></style>
