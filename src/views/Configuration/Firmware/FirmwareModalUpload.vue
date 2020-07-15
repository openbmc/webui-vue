<template>
  <b-modal
    id="modal-upload"
    :title="$t('pageFirmware.modal.uploadAndReboot.title')"
    :ok-title="$t('pageFirmware.modal.uploadAndReboot.primaryAction')"
    @ok="$emit('ok')"
  >
    <p>
      {{ $t('pageFirmware.modal.uploadAndReboot.message1') }}
    </p>
    <p>
      {{ $t('pageFirmware.modal.uploadAndReboot.message2') }}
    </p>
    <p class="font-weight-bold">
      {{ $t('pageFirmware.modal.uploadAndReboot.message3') }}
    </p>
  </b-modal>
</template>
