<template>
  <b-container fluid="xl">
    <page-title />
    <page-section :section-title="$t('pageSerialoverLAN.subTitle')">
      <dl>
        <dt>{{ $t('pageSerialoverLAN.subTitleDesc') }}</dt>
      </dl>
    </page-section>

    <serial-over-lan-console />

    <div class="text-right">
      <b-button
        variant="link"
        type="button"
        class="button-launch"
        @click="openConsoleWindow()"
      >
        <launch />

        {{ $t('pageSerialoverLAN.openNewTab') }}
      </b-button>
    </div>
  </b-container>
</template>

<script>
import Launch from '@carbon/icons-vue/es/launch/32';
import PageTitle from '../../../components/Global/PageTitle';
import PageSection from '@/components/Global/PageSection';
import SerialOverLanConsole from './SerialOverLanConsole';

export default {
  name: 'SerialOverLan',
  components: { Launch, PageSection, PageTitle, SerialOverLanConsole },
  mounted() {
    this.openTerminal();
  },
  methods: {
    openConsoleWindow() {
      window.open(
        '#/console/serial-over-lan',
        '_blank',
        'directories=no,titlebar=no,toolbar=no,location=no,status=no,menubar=no,scrollbars=no,resizable=yes,width=600,height=550'
      );
    }
  }
};
</script>

<style scoped>
.button-launch > svg {
  height: 25px;
}
</style>
