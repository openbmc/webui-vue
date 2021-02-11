<template>
  <b-modal
    id="modal-switch-to-running"
    :ok-title="$t('pageFirmware.singleFileUpload.modal.switchImages')"
    :cancel-title="$t('global.action.cancel')"
    :title="$t('pageFirmware.singleFileUpload.modal.switchRunningImage')"
    @ok="$emit('ok')"
  >
    <p>
      {{ $t('pageFirmware.singleFileUpload.modal.switchRunningImageInfo') }}
    </p>
    <p class="m-0">
      {{
        $t('pageFirmware.singleFileUpload.modal.switchRunningImageInfo2', {
          backup,
        })
      }}
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
  },
};
</script>
