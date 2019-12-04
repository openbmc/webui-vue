<template>
  <div>
    <a class="link-skip-nav btn btn-light" href="#main-content">
      Skip to content
    </a>
    <header id="page-header">
      <b-navbar toggleable="lg" variant="dark" type="dark">
        <!-- Left aligned nav items -->
        <b-navbar-nav>
          <b-nav-text>BMC System Management</b-nav-text>
        </b-navbar-nav>
        <!-- Right aligned nav items -->
        <b-navbar-nav class="ml-auto">
          <b-nav>
            <b-nav-item>
              Health
              <status-icon :status="'danger'" />
            </b-nav-item>
            <b-nav-item>
              Power
              <status-icon :status="hostStatusIcon" />
            </b-nav-item>
            <b-nav-item>
              Refresh
              <icon-renew />
            </b-nav-item>
            <b-nav-item @click="logout">
              Logout
              <icon-avatar />
            </b-nav-item>
          </b-nav>
        </b-navbar-nav>
      </b-navbar>
    </header>
  </div>
</template>

<script>
import IconAvatar from "@carbon/icons-vue/es/user--avatar/20";
import IconRenew from "@carbon/icons-vue/es/renew/20";
import StatusIcon from "../Global/StatusIcon";
export default {
  name: "AppHeader",
  components: { IconAvatar, IconRenew, StatusIcon },
  created() {
    this.getHostInfo();
  },
  computed: {
    hostStatus() {
      return this.$store.getters["global/hostStatus"];
    },
    hostStatusIcon() {
      switch (this.hostStatus) {
        case "on":
          return "success";
        case "error":
          return "danger";
        case "off":
        default:
          return "secondary";
      }
    }
  },
  methods: {
    getHostInfo() {
      this.$store.dispatch("global/getHostStatus");
    },
    logout() {
      this.$store.dispatch("authentication/logout").then(() => {
        this.$router.push("/login");
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.link-skip-nav {
  position: absolute;
  top: -60px;
  left: 0.5rem;
  z-index: 10;
  transition: 150ms cubic-bezier(0.4, 0.14, 1, 1);
  &:focus {
    top: 0.5rem;
    transition-timing-function: cubic-bezier(0, 0, 0.3, 1);
  }
}
.nav-item {
  svg {
    fill: $light;
  }
}
</style>
