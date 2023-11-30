<template>
  <BContainer fluid="xl">
    <page-title />
    <div class="terminal-container">
      <kvm-console :isFullWindow="isFullWindow" />
    </div>
  </BContainer>
</template>

<script setup>
import PageTitle from '@/components/Global/PageTitle.vue';
import KvmConsole from './KvmConsole.vue';
import { ref } from 'vue';
const isFullWindow = ref(false)
</script>

<style scoped>
.terminal-container {
  width: 100%;
}
</style>
