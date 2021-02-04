<template>
  <b-modal
    id="modal-update-firmware"
    :title="$t('pageFirmware.singleFileUpload.updateFirmware')"
    :ok-title="$t('pageFirmware.singleFileUpload.startUpdate')"
    :cancel-title="$t('global.action.cancel')"
    @ok="$emit('ok')"
  >
    <p>
      {{ $t('pageFirmware.singleFileUpload.modal.updateFirmwareInfo') }}
    </p>
    <p v-if="showMessage">
      {{
        $t('pageFirmware.singleFileUpload.modal.updateFirmwareInfo2', {
          backup,
          running,
        })
      }}
    </p>
    <p class="m-0">
      {{ $t('pageFirmware.singleFileUpload.modal.updateFirmwareInfo3') }}
    </p>
  </b-modal>
</template>

<script>
export default {
  props: {
    backup: {
      type: String,
      required: true,
    },
    running: {
      type: String,
      required: true,
    },
  },
  computed: {
    showMessage() {
      return this.backup !== this.running;
    },
  },
};
</script>
