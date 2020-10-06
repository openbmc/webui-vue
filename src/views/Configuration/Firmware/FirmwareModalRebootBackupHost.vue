<template>
  <b-modal
    id="modal-reboot-backup-host"
    :ok-title="$t('pageFirmware.modal.rebootFromBackupHost.primaryAction')"
    :title="$t('pageFirmware.modal.rebootFromBackupHost.title')"
    @ok="$emit('ok')"
  >
    <p>
      {{ $t('pageFirmware.modal.rebootFromBackupHost.message1', { backup }) }}
    </p>
    <p>
      {{ $t('pageFirmware.modal.rebootFromBackupHost.message2', { current }) }}
    </p>
    <p class="font-weight-bold">
      {{ $t('pageFirmware.modal.rebootFromBackupHost.message3', { backup }) }}
    </p>
  </b-modal>
</template>

<script>
export default {
  props: {
    current: {
      type: String,
      required: true
    },
    backup: {
      type: String,
      required: true
    }
  }
};
</script>
