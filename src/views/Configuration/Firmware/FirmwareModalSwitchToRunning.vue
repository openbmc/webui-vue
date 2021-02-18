<template>
  <b-modal
    id="modal-switch-to-running"
    :ok-title="$t('pageFirmware.modal.switchImages')"
    :cancel-title="$t('global.action.cancel')"
    :title="$t('pageFirmware.modal.switchRunningImage')"
    @ok="$emit('ok')"
  >
    <p>
      {{ $t('pageFirmware.modal.switchRunningImageInfo') }}
    </p>
    <p class="m-0">
      {{
        $t('pageFirmware.modal.switchRunningImageInfo2', {
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
