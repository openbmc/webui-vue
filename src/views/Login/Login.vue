<template>
  <b-container class="login-container" fluid>
    <b-row class="login-row" align-v="center">
      <b-col class="login-branding mt-5 mb-5" md="6">
        <div class="login-branding__container">
          <img
            class="logo"
            width="200px"
            src="@/assets/images/openbmc-logo.svg"
            alt=""
          />
          <h1>OpenBMC</h1>
        </div>
      </b-col>

      <b-col class="login-form" md="6">
        <b-form @submit.prevent="login">
          <b-form-group
            id="username-group"
            label="Username"
            label-for="username"
          >
            <b-form-input id="username" v-model="username" type="text" required>
            </b-form-input>
          </b-form-group>

          <b-form-group
            id="password-group"
            label="Password"
            label-for="username"
          >
            <b-form-input
              id="password"
              v-model="password"
              type="password"
              required
            >
            </b-form-input>
          </b-form-group>

          <b-button type="submit" variant="primary">Login</b-button>
        </b-form>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
export default {
  name: "Login",
  data() {
    return {
      username: "",
      password: ""
    };
  },
  methods: {
    login: function() {
      const username = this.username;
      const password = this.password;
      this.$store
        .dispatch("authentication/login", [username, password])
        .then(() => this.$router.push("/"))
        .catch(error => console.log(error));
    }
  }
};
</script>

<style lang="scss" scoped>
@import "~bootstrap/scss/functions";
@import "~bootstrap/scss/variables";
@import "~bootstrap/scss/mixins";

.login-container {
  @include media-breakpoint-up(md) {
    background: linear-gradient(
      to right,
      var(--light) 50%,
      var(--secondary-light) 50%
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
    margin-right: 4rem;
  }
}

.login-form form {
  max-width: 360px;
  margin-right: auto;
  margin-left: auto;

  @include media-breakpoint-up(md) {
    margin-left: 4rem;
  }
}

.login-branding {
  text-align: center;
}
</style>
