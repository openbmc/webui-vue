<template>
  <div>
    <div v-if="eventLogData.length == 0">
      {{ $t('pageOverview.events.noHighEventsMsg') }}
    </div>
    <div v-else>
      <!-- TODO: link to event log -->
      <b-button variant="link" href="#" class="float-right">
        {{ $t('pageOverview.events.viewAllButton') }}
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
          <div class="date-column">
            {{ data.value | formatDate }} <br />
            {{ data.value | formatTime }}
          </div>
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
          label: this.$t('pageOverview.events.id')
        },
        {
          key: 'eventID',
          label: this.$t('pageOverview.events.refCode')
        },
        {
          key: 'timestamp',
          label: this.$t('pageOverview.events.date')
        },
        {
          key: 'description',
          label: this.$t('pageOverview.events.description')
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
    this.$store.dispatch('eventLog/getEventLogData').finally(() => {
      this.$root.$emit('overview::events::complete');
    });
  }
};
</script>

<style lang="scss" scoped>
.date-column {
  min-width: 200px;
}
</style>
