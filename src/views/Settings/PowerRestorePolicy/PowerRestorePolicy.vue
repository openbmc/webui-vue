<template>
  <b-container fluid="xl">
    <page-title :description="$t('pagePowerRestorePolicy.description')" />

    <b-row>
      <b-col sm="8" md="6" xl="12">
        <b-form-group :label="$t('pagePowerRestorePolicy.powerPoliciesLabel')">
          <b-form-radio-group
            v-model="selectedPolicy"
            :options="policyOptions"
            name="power-restore-policy"
            stacked
          ></b-form-radio-group>
        </b-form-group>
      </b-col>
    </b-row>

    <b-button
      variant="primary"
      type="submit"
      :disabled="isSaving"
      @click="submitForm"
    >
      {{ $t('global.action.saveSettings') }}
    </b-button>
  </b-container>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import PageTitle from '@/components/Global/PageTitle.vue';
import { usePowerRestorePolicy } from '@/components/Composables/usePowerRestorePolicy';
import { useToast } from '@/components/Composables/useToast';
import { useLoadingBar } from '@/components/Composables/useLoadingBar';
import i18n from '@/i18n';
import { onBeforeRouteLeave } from 'vue-router';

const { currentPolicy, policyOptions, setPolicy, isLoading, isSaving } =
  usePowerRestorePolicy();
const { successToast, errorToast } = useToast();
const { startLoader, endLoader, hideLoader } = useLoadingBar();

// Local copy of selected policy — initialised from server, then owned by the form
const selectedPolicy = ref<string | null>(null);

// Sync selectedPolicy from server when data loads
watch(
  currentPolicy,
  (policy) => {
    if (policy !== null && selectedPolicy.value === null) {
      selectedPolicy.value = policy;
    }
  },
  { immediate: true },
);

// Show loader during initial fetch and while saving, matching the original
// which called startLoader() at the top of submitForm() too.
watch(
  () => isLoading.value || isSaving.value,
  (busy) => (busy ? startLoader() : endLoader()),
  { immediate: true },
);

onBeforeRouteLeave(() => {
  hideLoader();
});

async function submitForm() {
  if (selectedPolicy.value === null) return;
  try {
    await setPolicy(selectedPolicy.value);
    successToast(
      i18n.global.t('pagePowerRestorePolicy.toast.successSaveSettings'),
    );
  } catch {
    errorToast(
      i18n.global.t('pagePowerRestorePolicy.toast.errorSaveSettings'),
    );
    // Revert local selection to the last known server value
    selectedPolicy.value = currentPolicy.value;
  }
}
</script>
