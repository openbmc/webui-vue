<template>
  <div>
    <a href="#main-content">Skip to main content</a>
    <header>
      <b-navbar toggleable="lg" type="dark" variant="primary">
        <div>
          <router-link to="/">{{ orgName }} System Management</router-link>
        </div>
        <div>
          <span>{{ serverName }}</span>
          <span>{{ ipAddress }}</span>
        </div>
        <div>
          <b-button variant="link">
            <Renew20 />
            Refresh Data
          </b-button>
          <b-button variant="link">
            <user-avatar-20 />
            User Avatar
          </b-button>
        </div>
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
  data() {
    return {
      orgName: "IBM",
      serverName: "Witherspoon Something or Another",
      ipAddress: "127.0.0.0"
    };
  }
};
</script>

<style lang="scss" scoped></style>
