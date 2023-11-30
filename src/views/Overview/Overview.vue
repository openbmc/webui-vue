<template>
  <page-title />
  <BCard bg-variant="light" border-variant="light">
    <b-row class="d-flex justify-content-between align-items-center">
      <b-col sm="6" lg="9" class="mb-2 mt-2">
        <dl>
          <dt>{{ t('pageOverview.bmcTime') }}</dt>
          <dd v-if="bmcTime" data-test-id="overviewQuickLinks-text-bmcTime">
            {{ bmcTime }}
          </dd>
          <dd v-else>--</dd>
        </dl>
      </b-col>
      <b-col sm="6" lg="3" class="mb-2 mt-2">
        <BButton
          to="/operations/serial-over-lan"
          variant="secondary"
          data-test-id="overviewQuickLinks-button-solConsole"
          class="d-flex justify-content-between align-items-center"
        >
          {{ t('pageOverview.solConsole') }}
          <icon-arrow-right />
        </BButton>
      </b-col>
    </b-row>
  </BCard>
</template>

<script setup>
import { AuthenticationStore } from '../../store/modules/Authentication/AuthenticationStore';
import { useI18n } from 'vue-i18n';
import { computed } from 'vue';
import PageTitle from '@/components/Global/PageTitle.vue';

const Authentication = AuthenticationStore();
const { t } = useI18n();
const bmcTime = computed(() => {
  return Authentication.$state.bmcTime;
});
Authentication.getBmcTime();
</script>
