<template>
  <overview-card
    :data="eventLogData"
    :disabled="eventLogData.length === 0"
    :export-button="true"
    :file-name="exportFileNameByDate()"
    :title="$t('pageOverview.eventLogs')"
    :to="`/logs/event-logs`"
  >
    <b-row class="mt-3">
      <b-col sm="6">
        <dl>
          <dt>{{ $t('pageOverview.criticalEvents') }}</dt>
          <dd class="h3">
            {{ dataFormatter(criticalEvents.length) }}
            <status-icon status="danger" />
          </dd>
        </dl>
      </b-col>
      <b-col sm="6">
        <dl>
          <dt>{{ $t('pageOverview.warningEvents') }}</dt>
          <dd class="h3">
            {{ dataFormatter(warningEvents.length) }}
            <status-icon status="warning" />
          </dd>
        </dl>
      </b-col>
    </b-row>
  </overview-card>
</template>

<script>
import OverviewCard from './OverviewCard';
import StatusIcon from '@/components/Global/StatusIcon';
import DataFormatterMixin from '@/components/Mixins/DataFormatterMixin';
import { useI18n } from 'vue-i18n';

export default {
  name: 'Events',
  components: { OverviewCard, StatusIcon },
  mixins: [DataFormatterMixin],
  data() {
    return {
      $t: useI18n().t,
    };
  },
  computed: {
    eventLogData() {
      return this.$store.getters['eventLog/allEvents'];
    },
    criticalEvents() {
      return this.eventLogData
        .filter(
          (log) =>
            log.severity === 'Critical' && log.filterByStatus === 'Unresolved',
        )
        .map((log) => {
          return log;
        });
    },
    warningEvents() {
      return this.eventLogData
        .filter(
          (log) =>
            log.severity === 'Warning' && log.filterByStatus === 'Unresolved',
        )
        .map((log) => {
          return log;
        });
    },
  },
  created() {
    this.$store.dispatch('eventLog/getEventLogData').finally(() => {
      this.$root.$emit('overview-events-complete');
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
      let fileName = 'all_event_logs_';
      return fileName + date;
    },
  },
};
</script>

<style lang="scss" scoped>
.status-icon {
  vertical-align: text-top;
}
</style>
