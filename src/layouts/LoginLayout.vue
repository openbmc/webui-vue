<template>
  <main>
    <div class="login-container">
      <div class="login-main">
        <div>
          <div class="login-brand mb-5">
            <img
              :alt="altLogo"
              src="@/assets/images/login-company-logo.svg"
              width="90"
            />
          </div>
          <h1 v-if="customizableGuiName" class="h3 mb-5">
            {{ customizableGuiName }}
          </h1>
          <RouterView class="login=form form-background" />
        </div>
      </div>
      <div class="login-aside">
        <div class="login-aside__logo-brand">
          <!-- Add Secondary brand logo if needed -->
        </div>
        <br />
        <div class="login-aside__logo-bmc">
          <img
            alt="Built on OpenBMC"
            src="@/assets/images/built-on-openbmc-logo.svg"
            width="60"
          />
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref } from 'vue';
const altLogo = ref('intel');
const customizableGuiName = ref('BMC System Management');
</script>

<style lang="scss" scoped>
.login-container {
  background: gray('100');
  display: flex;
  flex-direction: column;
  gap: $spacer * 2;
  max-width: 1400px;
  min-width: 320px;
  min-height: 100vh;
  justify-content: space-around;

  @include media-breakpoint-up('md') {
    background: $white;
    flex-direction: row;
  }
}

.login-main {
  min-height: 50vh;
  padding: $spacer * 3;

  @include media-breakpoint-up('md') {
    background: gray('100');
    display: flex;
    flex-direction: column;
    flex: 1 1 75%;
    min-height: 100vh;
    justify-content: center;
    align-items: center;
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
  margin-bottom: $spacer;

  @include media-breakpoint-up('md') {
    min-height: 100vh;
    padding-bottom: $spacer;
    flex: 1 1 25%;
    margin-bottom: 0;
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
