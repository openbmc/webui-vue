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
import { watch, computed, reactive } from 'vue';
import { onBeforeRouteLeave } from 'vue-router';
import { useVuelidate } from '@vuelidate/core';
import { requiredIf, between } from '@vuelidate/validators';
import PageTitle from '@/components/Global/PageTitle';
import { usePowerControl } from '@/components/Composables/usePowerControl';
import { useLoadingBar } from '@/components/Composables/useLoadingBar';
import { useToast } from '@/components/Composables/useToast';

const {
  powerConsumptionValue,
  powerCapValue,
  isPowerCapFieldEnabled,
  powerCapMin,
  powerCapMax,
  submitPowerControl,
  query,
  mutation,
} = usePowerControl();

const { startLoader, endLoader, hideLoader } = useLoadingBar();
const { successToast, errorToast } = useToast();

const validationState = reactive({ powerCapValue, isPowerCapFieldEnabled });
const validationRules = computed(() => ({
  powerCapValue: {
    between: between(powerCapMin.value ?? 1, powerCapMax.value ?? 10000),
    required: requiredIf(() => isPowerCapFieldEnabled.value),
  },
}));

const v$ = useVuelidate(validationRules, validationState);

watch(
  () => query.isLoading.value,
  (isLoading) => (isLoading ? startLoader() : endLoader()),
  { immediate: true },
);
watch(
  () => mutation.isPending.value,
  (isPending) => (isPending ? startLoader() : endLoader()),
);

const loading = computed(
  () => query.isLoading.value || mutation.isPending.value,
);

function getValidationState(model) {
  if (!model) return null;
  const { $dirty, $error } = model;
  return $dirty ? !$error : null;
}

function submitForm() {
  v$.value.$touch();
  if (v$.value.$invalid) return;
  startLoader();
  submitPowerControl(powerCapValue.value, isPowerCapFieldEnabled.value)
    .then((message) => successToast(message))
    .catch(({ message }) => errorToast(message))
    .finally(endLoader);
}

onBeforeRouteLeave((_to, _from, next) => {
  hideLoader();
  next();
});
</script>
