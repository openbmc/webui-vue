<template>
  <b-form class="login-form" novalidate @submit.prevent="login">
    <alert class="login-error mb-4" :show="authError" variant="danger">
      <p id="login-error-alert">
        {{ $t('pageLogin.alert.message') }}
      </p>
    </alert>
    <b-form-group label-for="language" :label="$t('pageLogin.language')">
      <b-form-select
        id="language"
        v-model="userLocale"
        :options="languages"
        data-test-id="login-select-language"
      ></b-form-select>
    </b-form-group>
    <b-form-group label-for="username" :label="$t('pageLogin.username')">
      <b-form-input
        id="username"
        v-model="userInfo.username"
        aria-describedby="login-error-alert username-required"
        :state="getValidationState(v$.userInfo.username)"
        type="text"
        autofocus="autofocus"
        data-test-id="login-input-username"
        @input="v$.userInfo.username.$touch()"
      >
      </b-form-input>
      <b-form-invalid-feedback id="username-required" role="alert">
        <template v-if="v$.userInfo.username.required.$invalid">
          {{ $t('global.form.fieldRequired') }}
        </template>
      </b-form-invalid-feedback>
    </b-form-group>
    <div class="login-form__section mb-3">
      <label for="password">{{ $t('pageLogin.password') }}</label>
      <input-password-toggle>
        <b-form-input
          id="password"
          v-model="userInfo.password"
          aria-describedby="login-error-alert password-required"
          :state="getValidationState(v$.userInfo.password)"
          type="password"
          data-test-id="login-input-password"
          class="form-control-with-button"
          @input="v$.userInfo.password.$touch()"
        >
        </b-form-input>
        <b-form-invalid-feedback id="password-required" role="alert">
          <template v-if="v$.userInfo.password.required.$invalid">
            {{ $t('global.form.fieldRequired') }}
          </template>
        </b-form-invalid-feedback>
      </input-password-toggle>
    </div>
    <b-button
      class="mt-3"
      type="submit"
      variant="primary"
      data-test-id="login-button-submit"
      :disabled="disableSubmitButton"
      >{{ $t('pageLogin.logIn') }}</b-button
    >
  </b-form>
</template>

<script>
import { required } from '@vuelidate/validators';
import VuelidateMixin from '@/components/Mixins/VuelidateMixin.js';
import { useVuelidate } from '@vuelidate/core';
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import Alert from '@/components/Global/Alert';
import InputPasswordToggle from '@/components/Global/InputPasswordToggle';

export default {
  name: 'Login',
  components: { Alert, InputPasswordToggle },
  mixins: [VuelidateMixin],
  setup() {
    const { locale } = useI18n();
    const userLocale = ref(locale.value);
    watch(userLocale, (newLocale) => {
      locale.value = newLocale;
      localStorage.setItem('storedLanguage', newLocale);
    });
    return {
      userLocale,
      v$: useVuelidate(),
    };
  },
  data() {
    return {
      $t: useI18n().t,
      userInfo: {
        username: null,
        password: null,
      },
      disableSubmitButton: false,
      languages: [
        {
          value: 'en-US',
          text: 'English',
        },
        {
          value: 'ka-GE',
          text: 'ქართული',
        },
        {
          value: 'ru-RU',
          text: 'Русский',
        },
      ],
    };
  },
  computed: {
    authError() {
      return this.$store.getters['authentication/authError'];
    },
  },
  validations: {
    userInfo: {
      username: {
        required,
      },
      password: {
        required,
      },
    },
  },
  methods: {
    login: function () {
      this.v$.$touch();
      if (this.v$.$invalid) return;
      this.disableSubmitButton = true;
      const username = this.userInfo.username;
      const password = this.userInfo.password;
      this.$store
        .dispatch('authentication/login', { username, password })
        .then((PasswordChangeRequired) => {
          localStorage.setItem('storedLanguage', this.userLocale);
          localStorage.setItem('storedUsername', username);
          this.$store.commit('global/setUsername', username);
          this.$store.commit('global/setLanguagePreference', this.userLocale);
          if (PasswordChangeRequired) {
            this.$router.push('/change-password');
          } else {
            this.$router.push('/');
          }
        })
        .catch((error) => console.log(error))
        .finally(() => (this.disableSubmitButton = false));
    },
  },
};
</script>
