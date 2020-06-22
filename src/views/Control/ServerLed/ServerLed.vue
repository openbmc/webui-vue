<template>
  <b-container fluid="xl">
    <page-title />
    <b-row>
      <b-col md="12">
        <page-section :section-title="$t('pageServerLed.serverLedTitle')">
          <b-form-group :label="$t('pageServerLed.serverLedSubTitle')">
            <b-form-checkbox
              v-model="indicatorLED"
              name="check-button"
              value="Lit"
              unchecked-value="Off"
              switch
            >
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
import PageTitle from '@/components/Global/PageTitle';
import PageSection from '@/components/Global/PageSection';
import BVToastMixin from '@/components/Mixins/BVToastMixin';

export default {
  name: 'ServerLed',
  components: { PageTitle, PageSection },
  mixins: [BVToastMixin],
  computed: {
    indicatorLED: {
      get() {
        return this.$store.getters['serverLed/getIndicatorValue'];
      },
      set(newValue) {
        if (newValue) {
          this.$store.dispatch('serverLed/saveIndicatorLedValue', newValue);
          this.serverLed(newValue);
        }
      }
    }
  },
  created() {
    this.$store.dispatch('serverLed/getIndicatorValue');
  },
  methods: {
    serverLed(message) {
      this.$store
        .dispatch('serverLed/saveIndicatorLedValue')
        .then(() => this.successToast(message))
        .catch(() => this.errorToast(message));
    }
  }
};
</script>
