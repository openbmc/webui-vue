<template>
  <BForm class="login-form" novalidate @submit.prevent="login">
    <BAlert class="login-error mb-4" v-model="authError" variant="danger">
      <icon-misuse class="misuse-icon" />
      <p id="login-error-alert">
        {{ t('pageLogin.alert.message') }}
      </p>
    </BAlert>
    <BFormGroup label-for="language" :label="t('pageLogin.language')">
      <BFormSelect
        id="language"
        v-model="$i18n.locale"
        :options="languages"
        data-test-id="login-select-language"
      ></BFormSelect>
    </BFormGroup>
    <BFormGroup label-for="username" :label="t('pageLogin.username')">
      <BFormInput
        id="username"
        v-model="userInfo.username"
        aria-describedby="login-error-alert username-required"
        type="text"
        autofocus="autofocus"
        data-test-id="login-input-username"
        :state="getValidationState(v$.username)"
      >
      </BFormInput>
      <BFormInvalidFeedback id="username-required" role="alert">
        <template v-if="v$.username.required">
          {{ t('global.form.fieldRequired') }}
        </template>
      </BFormInvalidFeedback>
    </BFormGroup>
    <BFormGroup label-for="password" :label="t('pageLogin.password')">
      <BFormInput
        id="password"
        v-model="userInfo.password"
        aria-describedby="login-error-alert password-required"
        type="password"
        data-test-id="login-input-password"
        class="form-control-with-button"
        :state="getValidationState(v$.password)"
      >
      </BFormInput>
      <BFormInvalidFeedback id="password-required" role="alert">
        <template v-if="v$.password.required">
          {{ t('global.form.fieldRequired') }}
        </template>
      </BFormInvalidFeedback>
    </BFormGroup>
    <BButton
      class="mt-3 btn-primary"
      type="submit"
      variant="primary"
      data-test-id="login-button-submit"
      :disabled="disableSubmitButton"
    >
      {{ $t('pageLogin.logIn') }}</BButton
    >
  </BForm>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import i18n from '@/i18n';
import IconMisuse from '@carbon/icons-vue/es/misuse/20';
import { AuthenticationStore } from '../../store/modules/Authentication/AuthenticationStore';
import { useRouter } from 'vue-router';
import useVuelidateComposable from '@/components/Composables/useVuelidateComposable';
import { useVuelidate } from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import GlobalStore from '../../store/modules/GlobalStore';

const router = useRouter();
const globalStore = GlobalStore();
const { getValidationState } = useVuelidateComposable();
const Authentication = AuthenticationStore();
const authError = computed(() => {
  return Authentication.authError;
});
const { t } = useI18n();
const disableSubmitButton = ref(false);
const userInfo = reactive({ username: null, password: null });
const rules = { username: { required }, password: { required } };
const v$ = useVuelidate(rules, userInfo);
const languages = ref([
  {
    value: 'en-US',
    text: 'English',
  },
  {
    value: 'es',
    text: 'Español',
  },
  {
    value: 'ru-RU',
    text: 'Русский',
  },
]);

const login = () => {
  v$.value.$touch();
  if (v$.value.$invalid) return;
  disableSubmitButton.value = true;
  Authentication.login(userInfo.username, userInfo.password)
    .then(() => {
      localStorage.setItem('storedLanguage', i18n.locale);
      localStorage.setItem('storedUsername', userInfo.username);
      globalStore.username = userInfo.username;
      globalStore.languagePreference = i18n.locale;
      // router.push('/');
      return Authentication.getUserInfo(userInfo.username);
    })
    .then(({ PasswordChangeRequired, RoleId }) => {
      if (PasswordChangeRequired) {
        router.push('/change-password');
      } else {
        router.push('/');
      }
      if (RoleId) {
        globalStore.userPrivilege = RoleId;
      }
    })
    .catch((error) => console.log(error))
    .finally(() => (disableSubmitButton.value = false));
};
</script>
<style lang="scss">
.misuse-icon {
  margin-top: 2px;
  margin-right: 2px;
}
.login-error {
  height: 60px;
}
.login-form {
  @include media-breakpoint-up('md') {
    max-width: 360px;
  }
}

.form-label {
  margin-top: 2rem;
}
.btn-primary {
  color: #ffffff;
  background-color: #0068b5;
  border-color: #0068b5;
  border-radius: 0;
  padding-top: 10px;
  padding-right: $spacer;
  padding-bottom: 10px;
  padding-left: $spacer;
  &:hover {
    color: #ffffff;
    background-color: #005ca1;
    border-color: #005ca1;
  }
  &:active {
    color: #ffffff;
    background-color: #005ca1;
    border-color: #005ca1;
  }
  &:focus {
    color: #ffffff;
    background-color: #005ca1;
    border-color: #005ca1;
  }
}
</style>
