<template>
  <overview-card
    :data="dumps"
    :disabled="dumps.length == 0"
    :download-button="true"
    :file-name="exportFileNameByDate()"
    :title="$t('pageOverview.dumps')"
    :to="`/logs/dumps`"
  >
    <b-row class="mt-3">
      <b-col sm="6">
        <dl>
          <dt>Total</dt>
          <dd>{{ dumps.length }}</dd>
        </dl>
      </b-col>
    </b-row>
  </overview-card>
</template>

<script>
import OverviewCard from './OverviewCard';

export default {
  name: 'Dumps',
  components: {
    OverviewCard,
  },
  computed: {
    dumps() {
      return this.$store.getters['dumps/bmcDumps'] || '--';
    },
  },
  created() {
    this.$store.dispatch('dumps/getBmcDumps').finally(() => {
      this.$root.$emit('overview-dumps-complete');
    });
  },
  methods: {
    exportFileNameByDate() {
      // Create export file name based on date
      let date = new Date();
      date =
        date.toISOString().slice(0, 10) +
        '_' +
        date.toString().split(':').join('-').split(' ')[4];
      return this.$t('pageSensors.exportFilePrefix') + date;
    },
  },
};
</script>
