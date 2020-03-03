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
          <b-form class="login-form" novalidate @submit.prevent="login">
            <b-alert class="login-error" :show="authError" variant="danger">
              <p id="login-error-alert">
                <strong>{{ $t('login.errorMsg.title') }}</strong>
                <span>{{ $t('login.errorMsg.action') }}</span>
              </p>
            </b-alert>
            <div class="login-form__section">
              <label for="language">{{ $t('login.language.label') }}</label>
              <b-form-select
                id="language"
                v-model="$i18n.locale"
                :options="languages"
              ></b-form-select>
            </div>
            <div class="login-form__section">
              <label for="username">{{ $t('login.username.label') }}</label>
              <b-form-input
                id="username"
                v-model="userInfo.username"
                :aria-describedby="authError ? 'login-error-alert' : ''"
                :state="getValidationState($v.userInfo.username)"
                type="text"
                autofocus="autofocus"
                @input="$v.userInfo.username.$touch()"
              >
              </b-form-input>
              <b-form-invalid-feedback role="alert">
                <template v-if="!$v.userInfo.username.required">
                  {{ $t('login.username.validator') }}
                </template>
              </b-form-invalid-feedback>
            </div>
            <div class="login-form__section">
              <label for="password">{{ $t('login.password.label') }}</label>
              <b-form-input
                id="password"
                v-model="userInfo.password"
                :aria-describedby="authError ? 'login-error-alert' : ''"
                :state="getValidationState($v.userInfo.password)"
                type="password"
                @input="$v.userInfo.password.$touch()"
              >
              </b-form-input>
              <b-form-invalid-feedback role="alert">
                <template v-if="!$v.userInfo.password.required">
                  {{ $t('login.password.validator') }}
                </template>
              </b-form-invalid-feedback>
            </div>
            <b-button
              block
              class="mt-5"
              type="submit"
              variant="primary"
              :disabled="disableSubmitButton"
              >{{ $t('login.logIn.label') }}</b-button
            >
          </b-form>
        </b-col>
      </b-row>
    </b-container>
  </main>
</template>

<script>
import { required } from 'vuelidate/lib/validators';
import VuelidateMixin from '../../components/Mixins/VuelidateMixin.js';

export default {
  name: 'Login',
  mixins: [VuelidateMixin],
  data() {
    return {
      userInfo: {
        username: null,
        password: null
      },
      disableSubmitButton: false,
      languages: [
        { value: null, text: this.$t('login.languages.select') },
        {
          value: 'en',
          text: this.$t('login.languages.english')
        },
        {
          value: 'es',
          text: this.$t('login.languages.spanish')
        }
      ]
    };
  },
  computed: {
    authError() {
      return this.$store.getters['authentication/authError'];
    }
  },
  validations: {
    userInfo: {
      username: {
        required
      },
      password: {
        required
      }
    }
  },
  methods: {
    login: function() {
      this.$v.$touch();
      if (this.$v.$invalid) return;
      this.disableSubmitButton = true;
      const username = this.userInfo.username;
      const password = this.userInfo.password;
      this.$store
        .dispatch('authentication/login', [username, password])
        .then(() => this.$router.push('/'))
        .catch(error => console.log(error))
        .finally(() => (this.disableSubmitButton = false));
    }
  }
};
</script>

<style lang="scss" scoped>
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
}

.login-branding {
  text-align: center;
}
</style>
