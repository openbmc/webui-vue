<template>
  <main>
    <b-container class="login-container" fluid>
      <b-row class="login-row" align-v="center">
        <b-col md="6">
          <h2 class="mx-auto ml-md-5 mb-5 login-heading">
            BMC System Management
          </h2>
          <router-view />
        </b-col>
        <b-col
          class="login-branding mt-3 mb-3 text-center"
          md="6"
          align-self="end"
        >
          <div class="login-branding__container">
            <img
              class="logo"
              width="60px"
              src="@/assets/images/logo-login.svg"
              :alt="altLogo"
            />
          </div>
        </b-col>
      </b-row>
    </b-container>
  </main>
</template>

<script>
export default {
  name: 'LoginLayout',
  data() {
    return {
      altLogo: `${process.env.VUE_APP_COMPANY_NAME} logo`,
    };
  },
};
</script>

<style lang="scss" scoped>
.login-container {
  @include media-breakpoint-up(md) {
    background: linear-gradient(
      to left,
      theme-color('light') 40%,
      gray('200') 40%
    );
  }
}

.login-row {
  @include media-breakpoint-up(md) {
    min-height: 100vh;
  }
}

.login-branding__container {
  @include media-breakpoint-up(md) {
    float: right;
  }
}

.login-heading {
  font-weight: normal;
  @media (max-width: 768px) {
    max-width: 215px;
  }
}
</style>
