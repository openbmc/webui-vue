<template>
  <b-modal
    id="modal-reboot-backup"
    :ok-title="$t('pageFirmware.modal.rebootFromBackup.primaryAction')"
    :title="$t('pageFirmware.modal.rebootFromBackup.title')"
    @ok="$emit('ok')"
  >
    <p>
      {{ $t('pageFirmware.modal.rebootFromBackup.message1', { backup }) }}
    </p>
    <p>
      {{ $t('pageFirmware.modal.rebootFromBackup.message2', { current }) }}
    </p>
    <p class="font-weight-bold">
      {{ $t('pageFirmware.modal.rebootFromBackup.message3', { backup }) }}
    </p>
  </b-modal>
</template>

<script>
export default {
  props: {
    current: {
      type: String,
      required: true,
    },
    backup: {
      type: String,
      required: true,
    },
  },
};
</script>
