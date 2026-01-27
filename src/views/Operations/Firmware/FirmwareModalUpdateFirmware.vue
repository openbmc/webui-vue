<template>
  <b-modal
    id="modal-update-firmware"
    v-model="isModalVisible"
    :title="$t('pageFirmware.sectionTitleUpdateFirmware')"
    :ok-title="$t('pageFirmware.form.updateFirmware.startUpdate')"
    :cancel-title="$t('global.action.cancel')"
    @ok="$emit('ok')"
  >
    <template v-if="isSingleFileUploadEnabled">
      <p>
        {{ $t('pageFirmware.modal.updateFirmwareInfo') }}
      </p>
      <p>
        {{
          $t('pageFirmware.modal.updateFirmwareInfo2', {
            running: runningBmcVersion,
          })
        }}
      </p>
      <p class="m-0">
        {{ $t('pageFirmware.modal.updateFirmwareInfo3') }}
      </p>
    </template>
    <template v-else>
      {{ $t('pageFirmware.modal.updateFirmwareInfoDefault') }}
    </template>
  </b-modal>
</template>

<script>
import { useFirmwareInventory } from '@/api/composables/useFirmwareInventory';

export default {
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['ok', 'update:modelValue'],
  setup() {
    const firmware = useFirmwareInventory();
    return {
      ActiveBmcFirmware: firmware.ActiveBmcFirmware,
      isSingleFileUploadEnabled: firmware.isSingleFileUploadEnabled,
    };
  },
  computed: {
    isModalVisible: {
      get() {
        return this.modelValue;
      },
      set(value) {
        this.$emit('update:modelValue', value);
      },
    },
    // Use Redfish property name: Version
    runningBmcVersion() {
      return this.ActiveBmcFirmware?.Version || '--';
    },
  },
};
</script>
