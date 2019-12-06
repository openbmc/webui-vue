<template>
  <div>
    <AppHeader ref="focusTarget" />
    <b-container fluid class="page-container">
      <b-row no-gutters>
        <b-col tag="nav" cols="12" md="3" lg="2">
          <AppNavigation />
        </b-col>
        <b-col cols="12" md="9" lg="10">
          <main id="main-content">
            <router-view ref="routerView" />
          </main>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script>
import AppHeader from "@/components/AppHeader";
import AppNavigation from "@/components/AppNavigation";
export default {
  name: "App",
  components: {
    AppHeader,
    AppNavigation
  },
  watch: {
    $route: function() {
      // $nextTick = DOM updated
      this.$nextTick(function() {
        // Get the focusTarget DOM element
        let focusTarget = this.$refs.focusTarget.$el;

        // Make focustarget programmatically focussable
        focusTarget.setAttribute("tabindex", "-1");

        // Focus element
        focusTarget.focus();

        // Remove tabindex from focustarget
        // Reason: https://axesslab.com/skip-links/#update-3-a-comment-from-gov-uk
        focusTarget.removeAttribute("tabindex");
      });
    }
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
