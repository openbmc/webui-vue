<template>
  <b-modal
    id="modal-upload"
    ok-variant="danger"
    :title="$t('pageFirmware.modal.uploadAndRebootBmcOrHost.title')"
    :ok-title="$t('pageFirmware.modal.uploadAndRebootBmcOrHost.primaryAction')"
    @ok="$emit('ok')"
  >
    <p>
      {{ $t('pageFirmware.modal.uploadAndRebootBmcOrHost.message1') }}
    </p>
    <p>
      {{ $t('pageFirmware.modal.uploadAndRebootBmcOrHost.message2') }}
    </p>
    <p class="font-weight-bold">
      {{ $t('pageFirmware.modal.uploadAndRebootBmcOrHost.message3') }}
    </p>
  </b-modal>
</template>
