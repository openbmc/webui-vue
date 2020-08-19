<template>
  <b-container fluid="xl">
    <page-title />

    <page-section :section-title="$t('pageSerialoverLAN.subTitle')">
      <p>{{ $t('pageSerialoverLAN.subTitleDesc') }}</p>
    </page-section>

    <page-section class="consoleContainer mb-0">
      <b-row>
        <b-col class="d-flex flex-column justify-content-center" sm="6" md="6">
          <p class="m-0">
            Status: <status-icon :status="'success'" /> Connected
          </p>
        </b-col>

        <b-col sm="6" md="6" class="d-flex justify-content-end">
          <b-button
            variant="link"
            type="button"
            class="pr-0 button-launch"
            @click="openConsoleWindow()"
          >
            <icon-launch />

            {{ $t('pageSerialoverLAN.openNewTab') }}
          </b-button>
        </b-col>
      </b-row>

      <div class="terminal-container">
        <serial-over-lan-console />
      </div>
    </page-section>
  </b-container>
</template>

<script>
import IconLaunch from '@carbon/icons-vue/es/launch/20';
import PageTitle from '@/components/Global/PageTitle';
import PageSection from '@/components/Global/PageSection';
import SerialOverLanConsole from './SerialOverLanConsole';
import StatusIcon from '@/components/Global/StatusIcon';

export default {
  name: 'SerialOverLan',
  components: {
    IconLaunch,
    PageSection,
    PageTitle,
    SerialOverLanConsole,
    StatusIcon
  },
  methods: {
    openConsoleWindow() {
      window.open(
        '#/console/serial-over-lan-console',
        '_blank',
        'directories=no,titlebar=no,toolbar=no,location=no,status=no,menubar=no,scrollbars=no,resizable=yes,width=600,height=550'
      );
    }
  }
};
</script>

<style scoped>
.consoleContainer {
  width: 40vw;
}
.terminal-container {
  width: 100%;
}
</style>
