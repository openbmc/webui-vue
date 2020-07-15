<template>
  <b-modal
    id="modal-upload"
    ref="modal"
    :title="$t('pageFirmware.modal.connectionToBmcWillBeLost')"
    :ok-title="$t('pageFirmware.modal.uploadAndRebootBmc')"
    @ok="$emit('ok')"
  >
    <p>
      {{ $t('pageFirmware.modal.uploadAndRebootMessage1') }}
    </p>
    <p>
      {{ $t('pageFirmware.modal.uploadAndRebootMessage2') }}
    </p>
    <p class="font-weight-bold">
      {{ $t('pageFirmware.modal.uploadAndRebootMessage3') }}
    </p>
  </b-modal>
</template>
