<template>
  <BContainer fluid="xl">
  <page-title />
  <overview-quick-links class="mb-4" />
  <page-section
    :section-title="t('pageOverview.systemInformation')"
    class="mb-1"
  >
    <BCardGroup deck>
      <overview-server />
      <overview-firmware />
    </BCardGroup>
    <BCardGroup deck>
      <overview-network />
      <overview-power />
    </BCardGroup>
  </page-section>
  <page-section :section-title="t('pageOverview.statusInformation')">
    <BCardGroup deck>
      <overview-events />
      <overview-inventory />
      <overview-dumps v-if="showDumps" />
    </BCardGroup>
  </page-section>
</BContainer>
</template>

<script setup>
import PageTitle from '@/components/Global/PageTitle.vue';
import PageSection from '@/components/Global/PageSection.vue';
import OverviewQuickLinks from './OverviewQuickLinks.vue';
import OverviewServer from './OverviewServer.vue';
import OverviewFirmware from './OverviewFirmware.vue';
import OverviewNetwork from './OverviewNetwork.vue';
import OverviewPower from './OverviewPower.vue';
import OverviewEvents from './OverviewEvents.vue';
import OverviewInventory from './OverviewInventory.vue';
import { useI18n } from 'vue-i18n';
import { ref } from 'vue';

const { t } = useI18n();
const showDumps = ref(import.meta.env.VITE_APP_ENV_NAME === 'ibm');
</script>
