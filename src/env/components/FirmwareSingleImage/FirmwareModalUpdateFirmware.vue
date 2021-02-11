<template>
  <b-modal
    id="modal-update-firmware"
    :title="$t('pageFirmware.singleFileUpload.sectionTitleUpdateFirmware')"
    :ok-title="
      $t('pageFirmware.singleFileUpload.form.updateFirmware.startUpdate')
    "
    :cancel-title="$t('global.action.cancel')"
    @ok="$emit('ok')"
  >
    <template v-if="isSingleFileUploadEnabled">
      <p>
        {{ $t('pageFirmware.singleFileUpload.modal.updateFirmwareInfo') }}
      </p>
      <p>
        {{
          $t('pageFirmware.singleFileUpload.modal.updateFirmwareInfo2', {
            running: runningBmcVersion,
          })
        }}
      </p>
      <p class="m-0">
        {{ $t('pageFirmware.singleFileUpload.modal.updateFirmwareInfo3') }}
      </p>
    </template>
    <template v-else>
      {{ $t('pageFirmware.singleFileUpload.modal.updateFirmwareInfoDefault') }}
    </template>
  </b-modal>
</template>

<script>
export default {
  computed: {
    runningBmc() {
      return this.$store.getters['firmwareSingleImage/activeBmcFirmware'];
    },
    runningBmcVersion() {
      return this.runningBmc?.version || '--';
    },
    isSingleFileUploadEnabled() {
      return this.$store.getters[
        'firmwareSingleImage/isSingleFileUploadEnabled'
      ];
    },
  },
};
</script>
