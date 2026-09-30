<template>
  <b-container fluid="xl">
    <page-title />
    <b-row>
      <b-col md="8" lg="8" xl="6">
        <page-section>
          <b-row>
            <b-col>
              <dl>
                <dt>
                  {{ $t('pageRebootBmc.lastReboot') }}
                </dt>
                <dd v-if="lastRebootTime">
                  {{ $filters.formatDate(lastRebootTime) }}
                  {{ $filters.formatTime(lastRebootTime) }}
                </dd>
                <dd v-else>--</dd>
              </dl>
            </b-col>
          </b-row>
          {{ $t('pageRebootBmc.rebootInformation') }}
          <b-button
            variant="primary"
            class="d-block mt-5"
            data-test-id="rebootBmc-button-reboot"
            :disabled="!canReset"
            @click="onClick"
          >
            {{ $t('pageRebootBmc.rebootBmc') }}
          </b-button>
        </page-section>
      </b-col>
    </b-row>
  </b-container>
</template>

<script setup lang="ts">
import { watch } from 'vue';
import PageTitle from '@/components/Global/PageTitle.vue';
import PageSection from '@/components/Global/PageSection.vue';
import { useManager } from '@/api/composables/useManager';
import { useToast } from '@/components/Composables/useToast';
import { useLoadingBar } from '@/components/Composables/useLoadingBar';
import i18n from '@/i18n';
import eventBus from '@/eventBus';
import { onBeforeRouteLeave } from 'vue-router';

const { lastRebootTime, reset, isLoading, canReset } = useManager();
const { successToast, errorToast } = useToast();
const { startLoader, endLoader, hideLoader } = useLoadingBar();

watch(
  isLoading,
  (loading) => {
    if (loading) startLoader();
    else endLoader();
  },
  { immediate: true },
);

onBeforeRouteLeave(() => {
  hideLoader();
});

function onClick() {
  new Promise<boolean>((resolve) => {
    eventBus.$emit('confirm:open', {
      message: i18n.global.t('pageRebootBmc.modal.confirmMessage'),
      title: i18n.global.t('pageRebootBmc.modal.confirmTitle'),
      okTitle: i18n.global.t('global.action.confirm'),
      cancelTitle: i18n.global.t('global.action.cancel'),
      autoFocusButton: 'ok',
      resolve,
    });
  }).then((confirmed) => {
    if (confirmed) doReboot();
  });
}

async function doReboot() {
  try {
    await reset();
    successToast(i18n.global.t('pageRebootBmc.toast.successRebootStart'));
  } catch {
    errorToast(i18n.global.t('pageRebootBmc.toast.errorRebootStart'));
  }
}
</script>

<style lang="scss" scoped></style>
