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
        per-page="5"
        sort-by="timestamp"
        sort-desc
        :items="eventLogData"
        :fields="fields"
      >
        <template v-slot:cell(severity)="{ value }">
          <status-icon status="danger" />
          {{ value }}
        </template>
        <template v-slot:cell(timestamp)="{ value }">
          {{ value | formatDate }} {{ value | formatTime }}
        </template>
      </b-table>
    </div>
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
          key: 'logId',
          label: this.$t('pageOverview.events.id')
        },
        {
          key: 'severity',
          label: this.$t('pageOverview.events.severity')
        },
        {
          key: 'type',
          label: this.$t('pageOverview.events.type')
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
