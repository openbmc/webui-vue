<template>
  <div>
    <div v-if="eventLogData.length == 0">
      There are no high priority events to display at this time.
    </div>
    <div v-else>
      <!-- TODO: link to event log -->
      <b-button variant="link" href="#">
        {{ $t('overview.events.viewAllButton') }}
      </b-button>
      <b-table
        head-variant="dark"
        per-page="5"
        sort-by="logId"
        sort-desc
        stacked="sm"
        :items="eventLogData"
        :fields="fields"
      >
        <template v-slot:cell(timestamp)="data">
          {{ data.value | date('hh:MM:SS A') }} <br />
          {{ data.value | date('dddd, MMM DD, YYYY') }}
        </template>
      </b-table>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Events',
  data() {
    return {
      fields: [
        {
          key: 'logId',
          label: this.$t('overview.events.id')
        },
        {
          key: 'eventID',
          label: this.$t('overview.events.refCode')
        },
        {
          key: 'timestamp',
          label: this.$t('overview.events.date')
        },
        {
          key: 'description',
          label: this.$t('overview.events.description')
        }
      ]
    };
  },
  computed: {
    eventLogData() {
      return this.$store.getters['eventLog/highPriorityEvents'];
    }
  },
  created() {
    this.getEventLogData();
  },
  methods: {
    getEventLogData() {
      this.$store.dispatch('eventLog/getEventLogData');
    }
  }
};
</script>

<style lang="scss" scoped>
.btn {
  @include float-right;
}
</style>
