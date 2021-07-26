<template>
  <div>
    <b-button
      variant="link"
      to="/logs/event-logs"
      data-test-id="overviewEvents-button-eventLogs"
      class="float-md-right"
    >
      {{ $t('pageOverview.events.viewAllButton') }}
    </b-button>
    <b-table
      per-page="5"
      sort-by="id"
      sort-desc
      hover
      responsive="md"
      stacked="sm"
      show-empty
      :items="eventLogData"
      :fields="fields"
      :empty-text="$t('pageOverview.events.noHighEventsMsg')"
    >
      <template #cell(severity)="{ value }">
        <status-icon status="danger" />
        {{ value }}
      </template>
      <template #cell(date)="{ value }">
        <p class="mb-0">{{ value | formatDate }}</p>
        <p class="mb-0">{{ value | formatTime }}</p>
      </template>
    </b-table>
  </div>
</template>

<script>
import StatusIcon from '@/components/Global/StatusIcon';

export default {
  name: 'Events',
  components: { StatusIcon },
  data() {
    return {
      fields: [
        {
          key: 'id',
          label: this.$t('pageOverview.events.id'),
        },
        {
          key: 'severity',
          label: this.$t('pageOverview.events.severity'),
        },
        {
          key: 'type',
          label: this.$t('pageOverview.events.type'),
        },
        {
          key: 'date',
          label: this.$t('pageOverview.events.date'),
        },
        {
          key: 'description',
          label: this.$t('pageOverview.events.description'),
        },
      ],
    };
  },
  computed: {
    eventLogData() {
      return this.$store.getters['eventLog/highPriorityEvents'];
    },
  },
  created() {
    this.$store.dispatch('eventLog/getEventLogData').finally(() => {
      this.$root.$emit('overview-events-complete');
    });
  },
  destroyed() {
    this.$store.dispatch('eventLog/clearEventLogData');
  },
};
</script>
