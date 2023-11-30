<template>
  <page-title />
  <BCard bg-variant="light" border-variant="light">
    <BRow class="d-flex justify-content-between align-items-center">
      <BCol sm="6" lg="9" class="mb-2 mt-2">
        <dl>
          <dt>{{ t('pageOverview.bmcTime') }}</dt>
          <dd v-if="bmcTime" data-test-id="overviewQuickLinks-text-bmcTime">
            {{ bmcTime }}
          </dd>
          <dd v-else>--</dd>
        </dl>
      </BCol>
      <BCol sm="6" lg="3" class="mb-2 mt-2">
        <BButton
          to="/operations/serial-over-lan"
          variant="secondary"
          data-test-id="overviewQuickLinks-button-solConsole"
          class="d-flex justify-content-between align-items-center"
        >
          {{ t('pageOverview.solConsole') }}
          <icon-arrow-right />
        </BButton>
      </BCol>
    </BRow>
  </BCard>
</template>

<script setup>
import { AuthenticationStore } from '../../store/modules/Authentication/AuthenticationStore';
import { useI18n } from 'vue-i18n';
import { computed } from 'vue';
import PageTitle from '@/components/Global/PageTitle.vue';

const authenticationStore = AuthenticationStore();
const { t } = useI18n();
const bmcTime = computed(() => {
  return authenticationStore.$state.bmcTime;
});
authenticationStore.getBmcTime();
</script>
