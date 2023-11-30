<template>
  <overview-card
    v-if="network"
    :title="t('pageOverview.networkInformation')"
    :to="`/settings/network`"
  >
    <BRow class="mt-3">
      <BCol sm="6">
        <dl>
          <dt>{{ t('pageOverview.hostName') }}</dt>
          <dd>{{ dataFormatterGlobal.dataFormatter(network.hostname) }}</dd>
        </dl>
      </BCol>
      <BCol sm="6">
        <dl>
          <dt>{{ t('pageOverview.linkStatus') }}</dt>
          <dd>
            {{ dataFormatterGlobal.dataFormatter(network.linkStatus) }}
          </dd>
        </dl>
      </BCol>
    </BRow>
    <BRow>
      <BCol>
        <dl>
          <dt>{{ t('pageOverview.ipv4') }}</dt>
          <dd>
            {{ dataFormatterGlobal.dataFormatter(network.staticAddress) }}
          </dd>
        </dl>
      </BCol>
      <BCol>
        <dl>
          <dt>{{ t('pageOverview.dhcp') }}</dt>
          <dd>
            {{
              dataFormatterGlobal.dataFormatter(
                network.dhcpAddress.length !== 0
                  ? network.dhcpAddress[0].Address
                  : null
              )
            }}
          </dd>
        </dl>
      </BCol>
    </BRow>
  </overview-card>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import OverviewCard from './OverviewCard.vue';
import DataFormatterGlobal from '@/components/Mixins/DataFormatterGlobal';
import NetworkStore from '../../store/modules/Settings/NetworkStore';

const { t } = useI18n();
const dataFormatterGlobal = DataFormatterGlobal;
const networkStore = NetworkStore();
networkStore.getEthernetData();
const network = computed(() => {
  return networkStore.globalNetworkSettings[0];
});
</script>
