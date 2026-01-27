<template>
  <page-section :section-title="$t('pageFirmware.sectionTitleBiosCards')">
    <b-row class="row-cols-1 row-cols-md-2">
      <!-- Running image -->
      <b-col class="mb-3">
        <b-card class="h-100">
          <template #header>
            <p class="fw-bold m-0">
              {{ $t('pageFirmware.cardTitleRunning') }}
            </p>
          </template>
          <dl class="mb-0">
            <dt>{{ $t('pageFirmware.cardBodyVersion') }}</dt>
            <dd class="mb-0">{{ runningVersion }}</dd>
          </dl>
        </b-card>
      </b-col>

      <!-- Backup image -->
      <b-col class="mb-3">
        <b-card class="h-100">
          <template #header>
            <p class="fw-bold m-0">
              {{ $t('pageFirmware.cardTitleBackup') }}
            </p>
          </template>
          <dl class="mb-0">
            <dt>{{ $t('pageFirmware.cardBodyVersion') }}</dt>
            <dd class="mb-0">
              <status-icon v-if="showBackupImageStatus" status="danger" />
              <span
                v-if="showBackupImageStatus"
                class="visually-hidden-focusable"
              >
                {{ backupStatus }}
              </span>
              {{ backupVersion }}
            </dd>
          </dl>
        </b-card>
      </b-col>
    </b-row>
  </page-section>
</template>

<script>
import PageSection from '@/components/Global/PageSection';
import StatusIcon from '@/components/Global/StatusIcon';
import { useFirmwareInventory } from '@/api/composables/useFirmwareInventory';

export default {
  components: { PageSection, StatusIcon },
  setup() {
    const firmware = useFirmwareInventory();
    return {
      // Redfish SoftwareInventory models
      ActiveBiosFirmware: firmware.ActiveBiosFirmware,
      BackupBiosFirmware: firmware.BackupBiosFirmware,
    };
  },
  computed: {
    // Use Redfish property names: Version, Status.Health
    runningVersion() {
      return this.ActiveBiosFirmware?.Version || '--';
    },
    backupVersion() {
      return this.BackupBiosFirmware?.Version || '--';
    },
    backupStatus() {
      return this.BackupBiosFirmware?.Status?.Health || null;
    },
    showBackupImageStatus() {
      return (
        this.backupStatus === 'Critical' || this.backupStatus === 'Warning'
      );
    },
  },
};
</script>

<style lang="scss" scoped>
.page-section {
  margin-top: -$spacer * 1.5;
}
</style>
