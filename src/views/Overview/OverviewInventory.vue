<template>
  <overview-card
    :title="$t('pageOverview.inventory')"
    :to="`/hardware-status/inventory`"
  >
    <b-row class="mt-3">
      <b-col sm="6">
        <dl sm="6">
          <dt>{{ $t('pageOverview.systemIdentifyLed') }}</dt>
          <dd>
            <b-form-checkbox
              v-model="indicatorLedActiveState"
              data-test-id="overviewQuickLinks-checkbox-serverLed"
              name="check-button"
              switch
              @change="onChangeServerLed"
            >
              <span v-if="indicatorLedActiveState">
                {{ $t('global.status.on') }}
              </span>
              <span v-else>{{ $t('global.status.off') }}</span>
            </b-form-checkbox>
          </dd>
        </dl>
      </b-col>
    </b-row>
  </overview-card>
</template>

<script>
import OverviewCard from './OverviewCard';

export default {
  name: 'Inventory',
  components: {
    OverviewCard,
  },
  computed: {
    get() {
      return this.$store.getters['serverLed/getIndicatorLedActiveState'];
    },
    set(value) {
      return value;
    },
  },
  created() {
    this.$store.dispatch('serverLed/getIndicatorLedActiveState').finally(() => {
      this.$root.$emit('overview-inventory-complete');
    });
  },
  methods: {
    onChangeServerLed(indicatorLedActiveState) {
      this.$store
        .dispatch(
          'serverLed/saveIndicatorLedActiveState',
          indicatorLedActiveState
        )
        .catch(({ message }) => this.errorToast(message));
    },
  },
};
</script>
