<template>
  <b-container fluid="xl">
    <page-title />
    <div class="terminal-container">
      <kvm-console :is-full-window="false" />
    </div>
  </b-container>
</template>

<script>
import PageTitle from '@/components/Global/PageTitle';
import KvmConsole from './KvmConsole';

export default {
  name: 'Kvm',
  components: { PageTitle, KvmConsole },
};
</script>

<style scoped>
.button-launch > svg {
  height: 25px;
}
.button-launch {
  padding-left: 0px;
}

.terminal-container {
  width: 100%;
}
</style>
