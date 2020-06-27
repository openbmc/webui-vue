<template>
  <main>
    <b-container class="login-container" fluid>
      <b-row class="login-row" align-v="center">
        <b-col class="login-branding mt-5 mb-5" md="6">
          <div class="login-branding__container">
            <img class="logo" src="@/assets/images/openbmc-logo.svg" alt="" />
          </div>
          <div v-if="loginLogoEnabled" class="login-branding__container">
            <img
              class="logo mt-3"
              src="/logo-login.svg"
              :alt="`${envName} logo`"
            />
          </div>
        </b-col>
        <b-col md="6">
          <b-form class="login-form" novalidate @submit.prevent="login">
            <alert class="login-error" :show="authError" variant="danger">
              <p id="login-error-alert">
                {{ $t('pageLogin.alert.message') }}
              </p>
            </alert>
            <b-form-group
              label-for="language"
              :label="$t('pageLogin.language')"
            >
              <b-form-select
                id="language"
                v-model="$i18n.locale"
                :options="languages"
              ></b-form-select>
            </b-form-group>
            <b-form-group
              label-for="username"
              :label="$t('pageLogin.username')"
            >
              <b-form-input
                id="username"
                v-model="userInfo.username"
                aria-describedby="login-error-alert username-required"
                :state="getValidationState($v.userInfo.username)"
                type="text"
                autofocus="autofocus"
                @input="$v.userInfo.username.$touch()"
              >
              </b-form-input>
              <b-form-invalid-feedback id="username-required" role="alert">
                <template v-if="!$v.userInfo.username.required">
                  {{ $t('global.form.fieldRequired') }}
                </template>
              </b-form-invalid-feedback>
            </b-form-group>
            <div class="login-form__section">
              <label for="password">{{ $t('pageLogin.password') }}</label>
              <b-form-input
                id="password"
                v-model="userInfo.password"
                aria-describedby="login-error-alert password-required"
                :state="getValidationState($v.userInfo.password)"
                type="password"
                @input="$v.userInfo.password.$touch()"
              >
              </b-form-input>
              <b-form-invalid-feedback id="password-required" role="alert">
                <template v-if="!$v.userInfo.password.required">
                  {{ $t('global.form.fieldRequired') }}
                </template>
              </b-form-invalid-feedback>
            </div>
            <b-button
              block
              class="mt-5"
              type="submit"
              variant="primary"
              :disabled="disableSubmitButton"
              >{{ $t('pageLogin.logIn') }}</b-button
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
import i18n from '../../i18n';
import Alert from '../../components/Global/Alert';
import ENV_CONSTANTS from '@/envConstants.js';

export default {
  name: 'Login',
  components: { Alert },
  mixins: [VuelidateMixin],
  data() {
    return {
      envName: ENV_CONSTANTS.name,
      loginLogoEnabled: ENV_CONSTANTS.loginLogoEnabled,
      userInfo: {
        username: null,
        password: null
      },
      disableSubmitButton: false,
      languages: [
        {
          value: 'en-US',
          text: 'English'
        },
        {
          value: 'es',
          text: 'Español'
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
        .then(() => {
          localStorage.setItem('storedLanguage', i18n.locale);
          localStorage.setItem('storedUsername', username);
          this.$store.commit('global/setUsername', username);
          this.$store.commit('global/setLanguagePreference', i18n.locale);
        })
        .catch(error => console.log(error))
        .finally(() => (this.disableSubmitButton = false));
    }
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
  img {
    width: 200px;
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

.alert.login-error {
  margin-bottom: $spacer * 2;
}

.login-branding {
  text-align: center;
}
</style>
