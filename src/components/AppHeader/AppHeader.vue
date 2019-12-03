<template>
  <div>
    <a href="#main-content">Skip to main content</a>
    <header>
      <b-navbar toggleable="lg" variant="dark" type="dark">
        <b-navbar-nav small>
          <b-nav-text>BMC System Management</b-nav-text>
        </b-navbar-nav>
        <b-navbar-nav small class="ml-auto">
          <b-nav-item>
            <user-avatar-20 />
            User Avatar
          </b-nav-item>
        </b-navbar-nav>
      </b-navbar>
      <b-navbar toggleable="lg" variant="light">
        <b-navbar-nav>
          <b-navbar-brand href="/">
            {{ orgName }}
          </b-navbar-brand>
        </b-navbar-nav>
        <b-navbar-nav>
          <b-nav-text>{{ hostName }}</b-nav-text>
          <b-nav-text>{{ ipAddress }}</b-nav-text>
        </b-navbar-nav>
        <b-navbar-nav class="ml-auto">
          <b-nav>
            <b-nav-item>
              <b-button variant="link">
                Server health
                <b-badge pill variant="danger">Critical</b-badge>
              </b-button>
            </b-nav-item>
            <b-nav-item>
              <b-button variant="link">
                Server power
                <b-badge pill variant="success">Running</b-badge>
              </b-button>
            </b-nav-item>
            <b-nav-item>
              <b-button variant="link">
                <Renew20 />
                Refresh Data
              </b-button>
            </b-nav-item>
          </b-nav>
        </b-navbar-nav>
      </b-navbar>
    </header>
  </div>
</template>

<script>
import UserAvatar20 from "@carbon/icons-vue/es/user--avatar/20";
import Renew20 from "@carbon/icons-vue/es/renew/20";
export default {
  name: "AppHeader",
  components: { Renew20, UserAvatar20 },
  created() {
    this.getHostInfo();
  },
  data() {
    return {
      orgName: "IBM",
      ipAddress: "127.0.0.0"
    };
  },
  computed: {
    hostName() {
      return this.$store.getters["global/hostName"];
    },
    hostStatus() {
      return this.$store.getters["global/hostStatus"];
    }
  },
  methods: {
    getHostInfo() {
      this.$store.dispatch("global/getHostName");
    }
  }
};
</script>

<style lang="scss" scoped>
.navbar-text {
  padding: 0;
}
</style>
