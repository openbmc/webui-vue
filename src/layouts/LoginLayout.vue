<template>
  <main>
    <b-container class="login-container" fluid>
      <b-row class="login-row" align-v="center">
        <b-col class="login-branding mt-5 mb-5 text-center" md="6">
          <div class="login-branding__container">
            <img
              class="logo"
              width="200px"
              src="@/assets/images/openbmc-logo.svg"
              alt=""
            />
            <h1>OpenBMC</h1>
          </div>
          <div v-if="logoEnabled" class="login-branding__container">
            <img class="logo" width="200px" height="200px" :src="logo" alt="" />
          </div>
        </b-col>
        <b-col md="6">
          <router-view />
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
      logoEnabled: process.env.VUE_APP_LOGO_LOGIN,
      logo: `themes/${process.env.VUE_APP_THEME}/${process.env.VUE_APP_LOGO_LOGIN}`
    };
  }
};
</script>

<style lang="scss" scoped>
@import 'src/assets/styles/helpers';

.login-container {
  @include media-breakpoint-up(md) {
    background: linear-gradient(to right, $light 50%, $container-bgd 50%);
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
    margin-right: 4rem;
  }
}
</style>
