<template>
  <b-modal
    id="modal-upload"
    :title="$t('pageFirmware.modal.uploadAndRebootSingleImage.title')"
    :ok-title="
      $t('pageFirmware.modal.uploadAndRebootSingleImage.primaryAction')
    "
    @ok="$emit('ok')"
  >
    <p>
      {{ $t('pageFirmware.modal.uploadAndRebootSingleImage.message1') }}
    </p>
    <p>
      {{ $t('pageFirmware.modal.uploadAndRebootSingleImage.message2') }}
    </p>
    <p class="font-weight-bold">
      {{ $t('pageFirmware.modal.uploadAndRebootSingleImage.message3') }}
    </p>
  </b-modal>
</template>
