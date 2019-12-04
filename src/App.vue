<template>
  <div id="app">
    <AppHeader />
    <b-container fluid class="page-container">
      <b-row no-gutters>
        <b-col tag="nav" cols="12" md="3" lg="2">
          <AppNavigation />
        </b-col>
        <b-col cols="12" md="9" lg="10">
          <main id="#main-content">
            <router-view />
          </main>
        </b-col>
      </b-row>
    </b-container>
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

<style lang="scss" scoped>
.page-container {
  margin-right: 0;
  margin-left: 0;
  padding-right: 0;
  padding-left: 0;
}
</style>
