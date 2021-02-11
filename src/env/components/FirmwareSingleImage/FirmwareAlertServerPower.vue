<template>
  <b-row>
    <b-col xl="10">
      <!-- Operation in progress alert -->
      <alert v-if="isOperationInProgress" variant="info" class="mb-5">
        <p>
          {{ $t('pageFirmware.singleFileUpload.alert.operationInProgress') }}
        </p>
      </alert>
      <!-- Power off server warning alert -->
      <alert v-else-if="!isHostOff" variant="warning" class="mb-5">
        <p class="mb-0">
          {{
            $t('pageFirmware.singleFileUpload.alert.serverMustBePoweredOffTo')
          }}
        </p>
        <ul class="m-0">
          <li>
            {{
              $t(
                'pageFirmware.singleFileUpload.alert.switchRunningAndBackupImages'
              )
            }}
          </li>
          <li>
            {{ $t('pageFirmware.singleFileUpload.alert.updateFirmware') }}
          </li>
        </ul>
        <template #action>
          <b-link to="/control/server-power-operations">
            {{
              $t(
                'pageFirmware.singleFileUpload.alert.viewServerPowerOperations'
              )
            }}
          </b-link>
        </template>
      </alert>
    </b-col>
  </b-row>
</template>

<script>
import Alert from '@/components/Global/Alert';

export default {
  components: { Alert },
  props: {
    isHostOff: {
      required: true,
      type: Boolean,
    },
  },
  computed: {
    isOperationInProgress() {
      return this.$store.getters['controls/isOperationInProgress'];
    },
  },
};
</script>
