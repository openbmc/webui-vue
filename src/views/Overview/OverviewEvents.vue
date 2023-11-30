<template>
  <overview-card
    :data="eventLogData"
    :disabled="eventLogData.length === 0"
    :export-button="true"
    :file-name="exportFileNameByDate()"
    :title="t('pageOverview.eventLogs')"
    :to="`/logs/event-logs`"
  >
    <BRow class="mt-3">
      <BCol sm="6">
        <dl>
          <dt>{{ t('pageOverview.criticalEvents') }}</dt>
          <dd class="h3">
            {{ dataFormatterGlobal.dataFormatter(criticalEvents.length) }}
            <status-icon status="danger" />
          </dd>
        </dl>
      </BCol>
      <BCol sm="6">
        <dl>
          <dt>{{ t('pageOverview.warningEvents') }}</dt>
          <dd class="h3">
            {{ dataFormatterGlobal.dataFormatter(warningEvents.length) }}
            <status-icon status="warning" />
          </dd>
        </dl>
      </BCol>
    </BRow>
  </overview-card>
</template>

<script setup>
import OverviewCard from './OverviewCard.vue';
import StatusIcon from '@/components/Global/StatusIcon.vue';
// import DataFormatterGlobal from '@/components/Mixins/DataFormatterGlobal';
import useDataFormatterGlobal from '@/components/Composables/useDataFormatterGlobal';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import EventLogStore from '../../store/modules/Logs/EventLogStore';

const { t } = useI18n();
const eventLogStore = EventLogStore();
const dataFormatterGlobal = useDataFormatterGlobal();
eventLogStore.getEventLogData();
const eventLogData = computed(() => {
  return eventLogStore.allEvents;
});
const criticalEvents = computed(() => {
  return eventLogData.value
    .filter(
      (log) =>
        log.severity === 'Critical' && log.filterByStatus === 'Unresolved'
    )
    .map((log) => {
      return log;
    });
});
const warningEvents = computed(() => {
  return eventLogData.value
    .filter(
      (log) => log.severity === 'Warning' && log.filterByStatus === 'Unresolved'
    )
    .map((log) => {
      return log;
    });
});

const exportFileNameByDate = () => {
  let date = new Date();
  date =
    date.toISOString().slice(0, 10) +
    '_' +
    date.toString().split(':').join('-').split(' ')[4];
  let fileName = 'all_event_logs_';
  return fileName + date;
};
</script>

<style lang="scss" scoped>
.status-icon {
  vertical-align: text-top;
}
</style>
