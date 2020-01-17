<template>
  <div id="app">
    <AppHeader />
    <AppNavigation />
    <main id="#main-content">
      <router-view />
    </main>
  </div>
</template>

<style lang="scss">
@import "@/assets/styles/_obmc-custom";
</style>

<script>
import AppHeader from "@/components/AppHeader";
import AppNavigation from "@/components/AppNavigation";
export default {
  name: "App",
  components: {
    AppHeader,
    AppNavigation
  }
};
</script>
