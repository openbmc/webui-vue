<template>
  <b-modal
    id="modal-reboot-backup"
    header-class="justify-content-start"
    :ok-title="$t('pageFirmware.modal.rebootFromBackup.primaryAction')"
    @ok="$emit('ok')"
  >
    <template v-slot:modal-header>
      <status-icon status="warning" class="pr-2" />{{
        $t('pageFirmware.modal.rebootFromBackup.title')
      }}
    </template>
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
import StatusIcon from '@/components/Global/StatusIcon';
export default {
  components: { StatusIcon },
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
