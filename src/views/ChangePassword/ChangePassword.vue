<template>
  <div class="change-password-container mx-auto ml-md-5 mb-3">
    <alert variant="danger" class="mb-4">
      <p>{{ $t('pageChangePassword.changePasswordAlertMessage') }}</p>
    </alert>
    <dl>
      <dt>{{ $t('pageChangePassword.username') }}</dt>
      <dd>{{ username }}</dd>
    </dl>
    <b-form novalidate @submit.prevent="changePassword">
      <b-form-group
        label-for="password"
        :label="$t('pageChangePassword.newPassword')"
      >
        <input-password-toggle>
          <b-form-input
            id="password"
            v-model="form.password"
            autofocus="autofocus"
            type="password"
            :state="getValidationState($v.form.password)"
            @blur="$v.form.password.$touch()"
          >
          </b-form-input>
          <b-form-invalid-feedback role="alert">
            <template v-if="!$v.form.password.required">
              {{ $t('global.form.fieldRequired') }}
            </template>
          </b-form-invalid-feedback>
        </input-password-toggle>
      </b-form-group>
      <b-form-group
        label-for="password-confirm"
        :label="$t('pageChangePassword.confirmNewPassword')"
      >
        <input-password-toggle>
          <b-form-input
            id="password-confirm"
            v-model="form.passwordConfirm"
            type="password"
            :state="getValidationState($v.form.passwordConfirm)"
            @blur="$v.form.passwordConfirm.$touch()"
          >
          </b-form-input>
          <b-form-invalid-feedback role="alert">
            <template v-if="!$v.form.passwordConfirm.required">
              {{ $t('global.form.fieldRequired') }}
            </template>
            <template v-else-if="!$v.form.passwordConfirm.sameAsPassword">
              {{ $t('global.form.passwordsDoNotMatch') }}
            </template>
          </b-form-invalid-feedback>
        </input-password-toggle>
      </b-form-group>
      <div class="text-right">
        <b-button type="button" variant="link" to="login" @click="goBack">
          {{ $t('pageChangePassword.goBack') }}
        </b-button>
        <b-button type="submit" variant="primary">
          {{ $t('pageChangePassword.changePassword') }}
        </b-button>
      </div>
    </b-form>
  </div>
</template>

<script>
import { required, sameAs } from 'vuelidate/lib/validators';
import Alert from '@/components/Global/Alert';
import VuelidateMixin from '@/components/Mixins/VuelidateMixin';
import InputPasswordToggle from '@/components/Global/InputPasswordToggle';

export default {
  name: 'ChangePassword',
  components: { Alert, InputPasswordToggle },
  mixins: [VuelidateMixin],
  data() {
    return {
      form: {
        password: null,
        passwordConfirm: null
      },
      username: this.$store.getters['global/username']
    };
  },
  validations() {
    return {
      form: {
        password: { required },
        passwordConfirm: {
          required,
          sameAsPassword: sameAs('password')
        }
      }
    };
  },
  methods: {
    goBack() {
      // Remove temporary session created if navigating back
      // to the Login page
      this.$store.commit('authentication/logout');
    },
    changePassword() {
      // Should make PATCH request with new password
      // then reroute to Overview page
    }
  }
};
</script>

<style lang="scss" scoped>
.change-password-container {
  max-width: 360px;
}
</style>
