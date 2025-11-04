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
import { useI18n } from 'vue-i18n';

export default {
  components: { PageSection },
  data() {
    return {
      $t: useI18n().t,
    };
  },
  computed: {
    running() {
      return this.$store.getters['firmware/activeBiosFirmware'];
    },
    backup() {
      return this.$store.getters['firmware/backupBiosFirmware'];
    },
    runningVersion() {
      return this.running?.version || '--';
    },
    backupVersion() {
      return this.backup?.version || '--';
    },
    backupStatus() {
      return this.backup?.status || null;
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
