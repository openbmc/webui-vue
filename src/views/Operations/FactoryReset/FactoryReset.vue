<template>
  <b-container fluid="xl">
    <page-title :description="$t('pageFactoryReset.description')" />

    <!-- Reset Form -->
    <b-form id="factory-reset" @submit="onResetSubmit">
      <b-row>
        <b-col md="8">
          <b-form-group :label="$t('pageFactoryReset.form.resetOptionsLabel')">
            <b-form-radio-group
              id="factory-reset-options"
              v-model="resetOption"
              stacked
            >
              <b-form-radio
                class="mb-1"
                value="resetBios"
                aria-describedby="reset-bios"
                data-test-id="factoryReset-radio-resetBios"
              >
                {{ $t('pageFactoryReset.form.resetBiosOptionLabel') }}
              </b-form-radio>
              <b-form-text id="reset-bios" class="ms-4 mb-3">
                {{ $t('pageFactoryReset.form.resetBiosOptionHelperText') }}
              </b-form-text>

              <b-form-radio
                class="mb-1"
                value="resetToDefaults"
                aria-describedby="reset-to-defaults"
                data-test-id="factoryReset-radio-resetToDefaults"
              >
                {{ $t('pageFactoryReset.form.resetToDefaultsOptionLabel') }}
              </b-form-radio>
              <b-form-text id="reset-to-defaults" class="ms-4 mb-3">
                {{
                  $t('pageFactoryReset.form.resetToDefaultsOptionHelperText')
                }}
              </b-form-text>
            </b-form-radio-group>
          </b-form-group>
          <b-button
            type="submit"
            variant="primary"
            data-test-id="factoryReset-button-submit"
            :disabled="isBusy"
          >
            {{ $t('global.action.reset') }}
          </b-button>
        </b-col>
      </b-row>
    </b-form>

    <!-- Modals -->
    <modal-reset
      v-model="showResetModal"
      :reset-type="resetOption"
      :is-server-off="isServerOff"
      @ok-confirm="onOkConfirm"
    />
  </b-container>
</template>

<script setup lang="ts">
import { ref, computed, watch, onBeforeUnmount } from 'vue';
import { useI18n } from 'vue-i18n';
import { onBeforeRouteLeave } from 'vue-router';
import PageTitle from '@/components/Global/PageTitle.vue';
import ModalReset from './FactoryResetModal.vue';
import { useFactoryReset } from '@/components/Composables/useFactoryReset';
import { useToast } from '@/components/Composables/useToast';
import { useLoadingBar } from '@/components/Composables/useLoadingBar';

const { t } = useI18n();
const { isServerOff, resetToDefaults, resetBios, isBusy, isLoading } =
  useFactoryReset();
const { successToast, errorToast } = useToast();
const { startLoader, endLoader, hideLoader } = useLoadingBar();

const showResetModal = ref(false);
const resetOption = ref<'resetBios' | 'resetToDefaults'>('resetBios');

const isPageBusy = computed(() => isLoading.value || isBusy.value);

watch(
  isPageBusy,
  (busy) => {
    if (busy) {
      startLoader();
    } else {
      endLoader();
    }
  },
  { immediate: true },
);

onBeforeRouteLeave(() => {
  hideLoader();
});

onBeforeUnmount(() => {
  hideLoader();
});

const onResetSubmit = (event?: Event) => {
  event?.preventDefault?.();
  showResetModal.value = true;
};

const onOkConfirm = () => {
  showResetModal.value = false;
  if (resetOption.value === 'resetBios') {
    onResetBiosConfirm();
  } else {
    onResetToDefaultsConfirm();
  }
};

const onResetBiosConfirm = async () => {
  try {
    await resetBios();
    successToast(t('pageFactoryReset.toast.resetBiosSuccess'));
  } catch (_error) {
    errorToast(t('pageFactoryReset.toast.resetBiosError'));
  }
};

const onResetToDefaultsConfirm = async () => {
  try {
    await resetToDefaults();
    successToast(t('pageFactoryReset.toast.resetToDefaultsSuccess'));
  } catch (_error) {
    errorToast(t('pageFactoryReset.toast.resetToDefaultsError'));
  }
};
</script>
