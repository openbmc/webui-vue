<template>
  <overview-card
    :title="$t('pageOverview.powerInformation')"
    :to="`/resource-management/power`"
  >
    <b-row class="mt-3">
      <b-col sm="6">
        <dl>
          <dt>{{ $t('pageOverview.powerConsumption') }}</dt>
          <dd v-if="powerConsumptionValue == null">
            {{ $t('global.status.notAvailable') }}
          </dd>
          <dd v-else>{{ powerConsumptionValue }} W</dd>
          <dt>{{ $t('pageOverview.powerCap') }}</dt>
          <dd v-if="powerCapValue == null">
            {{ $t('global.status.disabled') }}
          </dd>
          <dd v-else>{{ powerCapValue }} W</dd>
        </dl>
      </b-col>
      <b-col>
        <dl>
          <dt>{{ $t('pageOverview.idlePower') }}</dt>
          <!-- TODO: update when power idle property is available -->
          <dd>--</dd>
          <dt>{{ $t('pageOverview.powerMode') }}</dt>
          <!-- TODO: update when power mode property is available -->
          <dd>--</dd>
        </dl>
      </b-col>
    </b-row>
  </overview-card>
</template>

<script>
import OverviewCard from './OverviewCard';
import { mapGetters } from 'vuex';

export default {
  name: 'Power',
  components: {
    OverviewCard,
  },
  computed: {
    ...mapGetters({
      powerCapValue: 'powerControl/powerCapValue',
      powerConsumptionValue: 'powerControl/powerConsumptionValue',
    }),
  },
  created() {
    this.$store.dispatch('powerControl/getPowerControl').finally(() => {
      this.$root.$emit('overview-power-complete');
    });
  },
};
</script>
