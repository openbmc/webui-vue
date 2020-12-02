<template>
  <b-container fluid="xl">
    <page-title />
    <b-row>
      <b-col md="12">
        <page-section :section-title="$t('pageServerLed.serverLedTitle')">
          <b-form-group :label="$t('pageServerLed.serverLedSubTitle')">
            <b-form-checkbox
              v-model="indicatorLedActiveState"
              data-test-id="serverLed-checkbox-switchIndicatorLed"
              name="check-button"
              switch
              @change="changeLedValue"
            >
              <span v-if="indicatorLedActiveState">
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
import LoadingBarMixin from '@/components/Mixins/LoadingBarMixin';

export default {
  name: 'ServerLed',
  components: { PageTitle, PageSection },
  mixins: [LoadingBarMixin, BVToastMixin],
  beforeRouteLeave(to, from, next) {
    this.hideLoader();
    next();
  },
  computed: {
    indicatorLedActiveState: {
      get() {
        return this.$store.getters['serverLed/getIndicatorLedActiveState'];
      },
      set(newValue) {
        return newValue;
      },
    },
  },
  created() {
    this.startLoader();
    this.$store
      .dispatch('serverLed/getIndicatorLedActiveState')
      .finally(() => this.endLoader());
  },
  methods: {
    changeLedValue(indicatorLedActiveState) {
      this.$store
        .dispatch(
          'serverLed/saveIndicatorLedActiveState',
          indicatorLedActiveState
        )
        .then((message) => this.successToast(message))
        .catch(({ message }) => this.errorToast(message));
    },
  },
};
</script>
