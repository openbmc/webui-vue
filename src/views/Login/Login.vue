<template>
  <BForm class="login-form" novalidate @submit.prevent="login">
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
    <b-button
      class="mt-3 btn-primary"
      type="submit"
      variant="primary"
      data-test-id="login-button-submit"
      :disabled="disableSubmitButton"
    >
      {{ $t('pageLogin.logIn') }}</b-button
    >
  </BForm>
</template>

<script>
import { ref, reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import { AuthenticationStore } from '../../store/modules/Authentication/AuthenticationStore'
import i18n from '@/i18n'
import { useRouter } from 'vue-router'
import VuelidateMixin from '@/components/Mixins/VuelidateMixin.js'
import { useVuelidate } from '@vuelidate/core'
import { required } from '@vuelidate/validators'
export default {
  name: 'LoginPage',
  mixins: [VuelidateMixin],
  setup() {
    const router = useRouter()

    const Authentication = AuthenticationStore()
    const { t } = useI18n()
    const userInfo = reactive({ username: null, password: null })
    const rules = { username: { required }, password: { required } }
    const v$ = useVuelidate(rules, userInfo)
    const languages = ref([
      {
        value: 'en-US',
        text: 'English'
      },
      {
        value: 'es',
        text: 'Español'
      },
      {
        value: 'ru-RU',
        text: 'Русский'
      }
    ])

    const login = () => {
      console.log('userinfo', userInfo)
      v$.value.$touch()
      if (v$.value.$invalid) return
      Authentication.login(userInfo.username, userInfo.password)
        .then(() => {
          localStorage.setItem('storedLanguage', i18n.locale)
          localStorage.setItem('storedUsername', userInfo.username)
          router.push('/')
          return Authentication.getUserInfo(userInfo.username)
          
        })
        .catch((error) => console.log(error))
    }

    return {
      v$,
      userInfo,
      rules,
      languages,
      login,
      t
    }
  }
}
</script>
<style lang="scss">
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
