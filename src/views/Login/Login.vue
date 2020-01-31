<template>
  <main>
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
        <b-col md="6">
          <b-form class="login-form" @submit.prevent="login" novalidate>
            <b-alert
              class="login-error"
              v-if="authStatus == 'error'"
              show
              variant="danger"
            >
              <p id="login-error-alert">
                <strong>{{ errorMsg.title }}</strong>
                <span v-if="errorMsg.action">{{ errorMsg.action }}</span>
              </p>
            </b-alert>
            <div class="login-form__section">
              <label for="username">{{ $t('Username') }}</label>
              <b-form-input
                id="username"
                v-model="userInfo.username"
                :aria-describedby="
                  authStatus == 'error' ? 'login-error-alert' : ''
                "
                type="text"
                required
                autofocus="autofocus"
              >
              </b-form-input>
            </div>
            <div class="login-form__section">
              <label for="password">{{ $t('Password') }}</label>
              <b-form-input
                id="password"
                v-model="userInfo.password"
                :aria-describedby="
                  authStatus == 'error' ? 'login-error-alert' : ''
                "
                type="password"
                required
              >
              </b-form-input>
            </div>
            <div class="login-form__section">
              <label for="language">{{ $t('Language') }}</label>
              <b-form-select
                id="language"
                v-model="$i18n.locale"
                :options="languages"
              ></b-form-select>
            </div>
            <b-button
              type="submit"
              variant="primary"
              :disabled="authStatus == 'processing'"
              >{{ $t('Log_in') }}</b-button
            >
          </b-form>
        </b-col>
      </b-row>
    </b-container>
  </main>
</template>

<script>
export default {
  name: 'Login',
  computed: {
    authStatus() {
      return this.$store.getters['authentication/authStatus'];
    }
  },
  data() {
    return {
      errorMsg: {
        title: null,
        action: null
      },
      userInfo: {
        username: null,
        password: null
      },
      disableSubmitButton: false,
      languages: [
        { value: null, text: 'Select an option' },
        {
          value: 'en',
          text: 'English'
        },
        {
          value: 'es',
          text: 'Spanish'
        }
      ]
    };
  },
  methods: {
    resetState: function() {
      this.errorMsg.title = null;
      this.errorMsg.action = null;
      this.$store.commit('authentication/authReset');
    },
    validateRequiredFields: function() {
      if (!this.userInfo.username || !this.userInfo.password) {
        this.$store.commit('authentication/authError');
      }
    },
    login: function() {
      this.resetState();
      this.validateRequiredFields();
      if (this.authStatus !== 'error') {
        const username = this.userInfo.username;
        const password = this.userInfo.password;
        this.$store
          .dispatch('authentication/login', [username, password])
          .then(() => {
            this.$router.push('/');
          })
          .catch(error => {
            this.errorMsg.title = 'Invalid username or password.';
            this.errorMsg.action = 'Please try again.';
            console.log(error);
          });
      } else {
        this.errorMsg.title = 'Username and password required.';
      }
    }
  }
};
</script>

<style lang="scss" scoped>
@import '~bootstrap/scss/functions';
@import '~bootstrap/scss/variables';
@import '~bootstrap/scss/mixins';

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

.login-form {
  max-width: 360px;
  margin-right: auto;
  margin-left: auto;

  @include media-breakpoint-up(md) {
    margin-left: 4rem;
  }
}

.login-form__section {
  margin-bottom: $spacer;
}

.login-error {
  margin-bottom: $spacer * 2;

  p {
    margin-bottom: 0;
  }

  strong {
    display: block;
    font-size: 1rem;
    font-weight: 600;
    margin-bottom: 0;
  }

  strong + span {
    margin-top: $spacer / 2;
    margin-bottom: 0;
  }
}

.login-branding {
  text-align: center;
}
</style>
