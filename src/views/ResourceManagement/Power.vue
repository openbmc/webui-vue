<template>
  <b-container fluid="xl">
    <page-title :description="$t('pagePower.description')" />

    <b-row>
      <b-col sm="8" md="6" xl="12">
        <dl>
          <dt>{{ $t('pagePower.powerConsumption') }}</dt>
          <dd>
            {{
              powerConsumptionValue
                ? `${powerConsumptionValue} W`
                : $t('global.status.notAvailable')
            }}
          </dd>
        </dl>
      </b-col>
    </b-row>

    <b-form @submit.prevent="submitForm">
      <b-form-group :disabled="loading">
        <b-row class="mb-3">
          <b-col sm="8" md="6" xl="12">
            <b-form-group :label="$t('pagePower.powerCapSettingLabel')">
              <b-form-checkbox
                v-model="isPowerCapFieldEnabled"
                data-test-id="power-checkbox-togglePowerCapField"
                name="power-cap-setting"
              >
                {{ $t('pagePower.powerCapSettingData') }}
              </b-form-checkbox>
            </b-form-group>
          </b-col>
        </b-row>

        <b-row class="mb-3">
          <b-col sm="8" md="6" xl="3">
            <b-form-group
              id="input-group-1"
              :label="$t('pagePower.powerCapLabel')"
              label-for="input-1"
            >
              <b-form-text id="power-help-text">
                {{
                  $t('pagePower.powerCapLabelTextInfo', {
                    min: powerCapMin ?? 1,
                    max: powerCapMax ?? 10000,
                  })
                }}
              </b-form-text>

              <b-form-input
                id="input-1"
                v-model.number="powerCapValue"
                :disabled="!isPowerCapFieldEnabled"
                data-test-id="power-input-powerCapValue"
                type="number"
                aria-describedby="power-help-text"
                :state="getValidationState(v$.powerCapValue)"
              ></b-form-input>

              <b-form-invalid-feedback id="input-live-feedback" role="alert">
                <template v-if="v$.powerCapValue.required.$invalid">
                  {{ $t('global.form.fieldRequired') }}
                </template>
                <template v-else-if="v$.powerCapValue.between.$invalid">
                  {{ $t('global.form.invalidValue') }}
                </template>
              </b-form-invalid-feedback>
            </b-form-group>
          </b-col>
        </b-row>

        <b-button
          variant="primary"
          type="submit"
          data-test-id="power-button-savePowerCapValue"
          class="mt-3"
        >
          {{ $t('global.action.save') }}
        </b-button>
      </b-form-group>
    </b-form>
  </b-container>
</template>

<script setup>
import { watch, computed, reactive, ref, onBeforeUnmount } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { requiredIf } from '@vuelidate/validators';
import { useI18n } from 'vue-i18n';
import PageTitle from '@/components/Global/PageTitle';
import { usePowerControl } from '@/components/Composables/usePowerControl';
import { useLoadingBar } from '@/components/Composables/useLoadingBar';
import { useToast } from '@/components/Composables/useToast';

const {
  powerConsumptionValue,
  powerCapMin,
  powerCapMax,
  environmentMetrics,
  submitPowerControl,
  metricsQuery,
  mutation,
} = usePowerControl();

const { startLoader, endLoader, hideLoader } = useLoadingBar();
const { successToast, errorToast } = useToast();
const { t } = useI18n();

// Form state managed locally in the component
// Synced from server data when it changes
const powerCapValue = ref(null);
const isPowerCapFieldEnabled = computed({
  get: () => powerCapValue.value !== null,
  set: (enabled) => {
    powerCapValue.value = enabled ? '' : null;
    if (!enabled && v$.value) {
      v$.value.$reset();
    }
  },
});

// Sync form state from server data when query data changes
watch(
  () => environmentMetrics.value,
  (data) => {
    if (!data) return;
    const isAutomatic = data.PowerLimitWatts?.ControlMode === 'Automatic';
    if (isAutomatic) {
      powerCapValue.value = data.PowerLimitWatts?.SetPoint ?? '';
    } else {
      powerCapValue.value = null;
    }
  },
  { immediate: true },
);

const validationState = reactive({ powerCapValue, isPowerCapFieldEnabled });
const validationRules = computed(() => ({
  powerCapValue: {
    required: requiredIf(() => isPowerCapFieldEnabled.value),
    between(value) {
      // When the field is disabled, skip range validation entirely
      if (!isPowerCapFieldEnabled.value) return true;
      if (value === null || value === '' || value === undefined) return true;
      const min = powerCapMin.value ?? 1;
      const max = powerCapMax.value ?? 10000;
      const n = Number(value);
      if (Number.isNaN(n)) return false;
      return n >= min && n <= max;
    },
  },
}));

const v$ = useVuelidate(validationRules, validationState);

watch(
  () => metricsQuery.isLoading.value || mutation.isPending.value,
  (isLoading) => (isLoading ? startLoader() : endLoader()),
  { immediate: true },
);

const loading = computed(
  () => metricsQuery.isLoading.value || mutation.isPending.value,
);

function getValidationState(model) {
  if (!model) return null;
  const { $dirty, $error } = model;
  return $dirty ? !$error : null;
}

async function submitForm() {
  v$.value.$touch();
  if (v$.value.$invalid) return;
  try {
    await submitPowerControl(powerCapValue.value, isPowerCapFieldEnabled.value);
    successToast(t('pageServerPowerOperations.toast.successSaveSettings'));
    v$.value.$reset();
  } catch (_error) {
    errorToast(t('pageServerPowerOperations.toast.errorSaveSettings'));
  }
}

onBeforeUnmount(() => {
  hideLoader();
});
</script>
