<template>
  <b-container fluid="xl">
    <page-title />

    <page-section :section-title="$t('pageSerialoverLAN.subTitle')">
      <p>{{ $t('pageSerialoverLAN.subTitleDesc') }}</p>
    </page-section>

    <page-section class="consoleContainer mb-0">
      <div class="terminal-container">
        <serial-over-lan-console />
      </div>
    </page-section>
  </b-container>
</template>

<script>
import PageTitle from '@/components/Global/PageTitle';
import PageSection from '@/components/Global/PageSection';
import SerialOverLanConsole from './SerialOverLanConsole';

export default {
  name: 'SerialOverLan',
  components: {
    PageSection,
    PageTitle,
    SerialOverLanConsole
  }
};
</script>

<style scoped lang="scss">
.consoleContainer {
  width: 40vw;
  height: 48vh;
}
.terminal-container {
  width: 100%;
}
</style>
