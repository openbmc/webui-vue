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
                <dd v-if="lastBmcRebootTime">
                  {{ $filters.formatDate(lastBmcRebootTime) }}
                  {{ $filters.formatTime(lastBmcRebootTime) }}
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
            :disabled="!isRebootEnabled"
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
import { useStore } from 'vuex';
import PageTitle from '@/components/Global/PageTitle.vue';
import PageSection from '@/components/Global/PageSection.vue';
import { useRebootBmc } from '@/components/Composables/useRebootBmc';
import { useToast } from '@/components/Composables/useToast';
import { useLoadingBar } from '@/components/Composables/useLoadingBar';
import i18n from '@/i18n';
import eventBus from '@/eventBus';
import { onBeforeRouteLeave } from 'vue-router';

const { lastBmcRebootTime, rebootBmc, isLoading, isRebootEnabled } =
  useRebootBmc();
const { infoToast, errorToast } = useToast();
const { startLoader, endLoader, hideLoader } = useLoadingBar();
const store = useStore();

let rebootTimer: ReturnType<typeof setTimeout> | undefined;

if (isLoading.value) {
  startLoader();
}
watch(
  isLoading,
  (loading) => {
    if (!loading) endLoader();
  },
  { immediate: true },
);

onBeforeRouteLeave(() => {
  hideLoader();
  clearTimeout(rebootTimer);
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
  startLoader();
  try {
    await rebootBmc();
  } catch {
    errorToast(i18n.global.t('pageRebootBmc.toast.errorRebootStart'));
    endLoader();
    return;
  }
  // Start checking for BMC reboot completion
  infoToast(i18n.global.t('pageRebootBmc.toast.successRebootStart'));
  checkBmcRebootCompletion();
}

function failRebootCheck() {
  endLoader();
  errorToast(i18n.global.t('pageRebootBmc.toast.errorRebootStart'));
}

function checkBmcRebootCompletion() {
  // Phase 1: Wait for the BMC to go offline (requests start failing).
  // The reboot command was just issued but the BMC is still alive for a
  // few seconds, so a reachability check would succeed as a false
  // positive if polled immediately. Poll until a request *fails* first.
  const waitForOffline = (attempts = 0) => {
    if (attempts > 60) {
      // BMC never went offline — surface an error and stop.
      return failRebootCheck();
    }
    try {
      store
        .dispatch('global/getSystemInfo')
        .then(() => {
          // Still online — check again after 1s.
          rebootTimer = setTimeout(() => waitForOffline(attempts + 1), 1000);
        })
        .catch(() => {
          // BMC is now offline — start polling for recovery.
          waitForOnline();
        });
    } catch {
      // Polling itself is broken (e.g. dispatch did not return a promise).
      failRebootCheck();
    }
  };

  // Phase 2: Poll until the BMC responds again (BMC is back online).
  const waitForOnline = (attempts = 0) => {
    if (attempts > 10) {
      return failRebootCheck();
    }
    try {
      store
        .dispatch('global/getSystemInfo')
        .then(() => {
          infoToast(
            i18n.global.t('pageRebootBmc.toast.successRebootCompleted'),
          );
          endLoader();
        })
        .catch(() => {
          // Still offline — retry after 1 minute.
          rebootTimer = setTimeout(() => waitForOnline(attempts + 1), 60000);
        });
    } catch {
      failRebootCheck();
    }
  };

  waitForOffline();
}
</script>

<style lang="scss" scoped></style>
