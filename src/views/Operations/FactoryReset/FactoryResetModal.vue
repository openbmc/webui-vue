<template>
  <b-modal
    id="modal-reset"
    ref="modal"
    v-model="isModalVisible"
    :title="modalTitle"
    title-tag="h2"
    @hidden="resetConfirm"
  >
    <p class="mb-2">
      <strong>{{ modalHeader }}</strong>
    </p>
    <ul v-if="resetType === 'resetBios'" class="ps-3 mb-4">
      <li class="mt-1 mb-1">
        {{ $t('pageFactoryReset.modal.resetBiosSettingsList.item1') }}
      </li>
      <li class="mt-1 mb-1">
        {{ $t('pageFactoryReset.modal.resetBiosSettingsList.item2') }}
      </li>
    </ul>
    <ul v-else-if="resetType === 'resetToDefaults'" class="ps-3 mb-4">
      <li class="mt-1 mb-1">
        {{ $t('pageFactoryReset.modal.resetToDefaultsSettingsList.item1') }}
      </li>
      <li class="mt-1 mb-1">
        {{ $t('pageFactoryReset.modal.resetToDefaultsSettingsList.item2') }}
      </li>
      <li class="mt-1 mb-1">
        {{ $t('pageFactoryReset.modal.resetToDefaultsSettingsList.item3') }}
      </li>
      <li class="mt-1 mb-1">
        {{ $t('pageFactoryReset.modal.resetToDefaultsSettingsList.item4') }}
      </li>
    </ul>

    <!-- Warning message -->
    <template v-if="!isServerOff">
      <p class="d-flex mb-2">
        <status-icon status="danger" />
        <span id="reset-to-default-warning" class="ms-1">
          {{ $t('pageFactoryReset.modal.resetWarningMessage') }}
        </span>
      </p>
      <b-form-checkbox
        v-model="confirm"
        aria-describedby="reset-to-default-warning"
        @change="v$.confirm.$touch()"
      >
        {{ $t('pageFactoryReset.modal.resetWarningCheckLabel') }}
      </b-form-checkbox>
      <b-form-invalid-feedback
        role="alert"
        :state="getValidationState(v$.confirm)"
      >
        {{ $t('global.form.fieldRequired') }}
      </b-form-invalid-feedback>
    </template>

    <template #footer="{ cancel }">
      <b-button
        variant="secondary"
        data-test-id="factoryReset-button-cancel"
        @click="cancel()"
      >
        {{ $t('global.action.cancel') }}
      </b-button>
      <b-button
        type="submit"
        variant="primary"
        data-test-id="factoryReset-button-confirm"
        @click="handleConfirm"
      >
        {{ modalSubmitText }}
      </b-button>
    </template>
  </b-modal>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useVuelidate } from '@vuelidate/core';
import StatusIcon from '@/components/Global/StatusIcon.vue';

interface Props {
  resetType?: string | null;
  modelValue?: boolean;
  isServerOff?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  resetType: null,
  modelValue: false,
  isServerOff: false,
});

const emit = defineEmits<{
  (_e: 'okConfirm'): void;
  (_e: 'update:modelValue', _value: boolean): void;
}>();

const { t } = useI18n();
const confirm = ref(false);
const modal = ref<{ hide: () => void } | null>(null);

const isModalVisible = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value),
});

const modalTitle = computed(() =>
  props.resetType ? t(`pageFactoryReset.modal.${props.resetType}Title`) : '',
);
const modalHeader = computed(() =>
  props.resetType ? t(`pageFactoryReset.modal.${props.resetType}Header`) : '',
);
const modalSubmitText = computed(() =>
  props.resetType
    ? t(`pageFactoryReset.modal.${props.resetType}SubmitText`)
    : '',
);

const validationRules = computed(() => ({
  confirm: {
    mustBeTrue(value: boolean) {
      return props.isServerOff || value === true;
    },
  },
}));

const v$ = useVuelidate(validationRules, { confirm });

function getValidationState(model: { $dirty?: boolean; $error?: boolean }) {
  if (!model) return null;
  const { $dirty, $error } = model;
  return $dirty ? !$error : null;
}

function resetConfirm() {
  confirm.value = false;
  v$.value.$reset();
}

function handleConfirm() {
  v$.value.$touch();
  if (v$.value.$invalid) return;
  emit('okConfirm');
  resetConfirm();
}
</script>
