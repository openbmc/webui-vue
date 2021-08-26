<template>
  <main>
    <div class="login-container">
      <div class="login-main">
        <div class="login-brand mb-5">
          <img
            width="90px"
            src="@/assets/images/login-company-logo.svg"
            :alt="altLogo"
          />
        </div>
        <h1 v-if="customizableGuiName" class="mb-5">
          {{ customizableGuiName }}
        </h1>
        <router-view class="login=form form-background" />
      </div>
      <div class="login-aside">
        <div class="login-aside__logo-brand">
          <!-- Add Secondary brand logo if needed -->
        </div>
        <div class="login-aside__logo-bmc">
          <img
            height="60px"
            src="@/assets/images/built-on-openbmc-logo.svg"
            alt="Built on OpenBMC"
          />
        </div>
      </div>
    </div>
  </main>
</template>

<script>
export default {
  name: 'LoginLayout',
  data() {
    return {
      altLogo: process.env.VUE_APP_COMPANY_NAME || 'OpenBMC',
      customizableGuiName: process.env.VUE_APP_GUI_NAME || '',
    };
  },
};
</script>

<style lang="scss" scoped>
.login-container {
  display: flex;
  flex-direction: column;
  gap: $spacer * 2;
  max-width: 1280px;
  min-width: 320px;
  height: 100vh;

  @include media-breakpoint-up('md') {
    flex-direction: row;
  }

  @include media-breakpoint-up('xxl') {
    margin: auto;
  }
}

.login-main {
  background: gray('100');
  min-height: 50vh;
  padding: $spacer * 3;

  @include media-breakpoint-up('md') {
    display: flex;
    flex-direction: column;
    flex: 1 1 75%;
    min-height: 100vh;
    padding: 0 $spacer * 5;
    justify-content: center;
  }
}

.login-form {
  @include media-breakpoint-up('md') {
    max-width: 360px;
  }
}

.login-aside {
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  gap: $spacer * 1.5;
  margin-right: $spacer * 3;

  @include media-breakpoint-up('md') {
    min-height: 100vh;
    padding-bottom: $spacer;
    flex: 1 1 25%;
  }
}

.login-aside__logo-brand:not(:empty) {
  &::after {
    content: '';
    display: inline-block;
    height: 2.5rem;
    width: 2px;
    background-color: gray('200');
    margin-left: $spacer * 1.5;
    vertical-align: middle;
  }
}
</style>
