<template>
  <b-container fluid="xl">
    <page-title />

    <b-row>
      <b-col md="8" lg="8" xl="6">
        <page-section :section-title="$t('profileSettings.profileInfoTitle')">
          <dl>
            <dt>{{ $t('profileSettings.username') }}</dt>
            <dd>
              {{ username }}
            </dd>
          </dl>
        </page-section>
      </b-col>
    </b-row>

    <b-form @submit.prevent="submitForm">
      <b-row>
        <b-col sm="8" md="6" xl="3">
          <page-section :section-title="$t('profileSettings.changePassword')">
            <b-form-group
              id="input-group-1"
              :label="$t('profileSettings.newPassword')"
              label-for="input-1"
            >
              <b-form-text id="password-help-block">
                {{
                  $t('pageLocalUserManagement.modal.passwordMustBeBetween', {
                    min: passwordRequirements.minLength,
                    max: passwordRequirements.maxLength
                  })
                }}
              </b-form-text>
              <input-password-toggle>
                <b-form-input
                  id="password"
                  v-model="form.newPassword"
                  type="password"
                  aria-describedby="password-help-block"
                  :state="getValidationState($v.form.newPassword)"
                  @input="$v.form.newPassword.$touch()"
                />
                <b-form-invalid-feedback role="alert">
                  <template v-if="!$v.form.newPassword.required">
                    {{ $t('global.form.fieldRequired') }}
                  </template>
                  <template
                    v-if="
                      !$v.form.newPassword.minLength ||
                        !$v.form.newPassword.maxLength
                    "
                  >
                    {{
                      $t('profileSettings.newPassLabelTextInfo', {
                        min: passwordRequirements.minLength,
                        max: passwordRequirements.maxLength
                      })
                    }}
                  </template>
                </b-form-invalid-feedback>
              </input-password-toggle>
            </b-form-group>
            <b-form-group
              id="input-group-2"
              :label="$t('profileSettings.confirmPassword')"
              label-for="input-2"
            >
              <input-password-toggle>
                <b-form-input
                  id="password-confirmation"
                  v-model="form.confirmPassword"
                  type="password"
                  :state="getValidationState($v.form.confirmPassword)"
                  @input="$v.form.confirmPassword.$touch()"
                />
                <b-form-invalid-feedback role="alert">
                  <template v-if="!$v.form.confirmPassword.required">
                    {{ $t('global.form.fieldRequired') }}
                  </template>
                  <template v-else-if="!$v.form.confirmPassword.sameAsPassword">
                    {{ $t('profileSettings.passwordsDoNotMatch') }}
                  </template>
                </b-form-invalid-feedback>
              </input-password-toggle>
            </b-form-group>
          </page-section>
        </b-col>
      </b-row>
      <b-button variant="primary" type="submit">
        {{ $t('global.action.save') }}
      </b-button>
    </b-form>
  </b-container>
</template>

<script>
import InputPasswordToggle from '@/components/Global/InputPasswordToggle';
import PageTitle from '@/components/Global/PageTitle';
import PageSection from '@/components/Global/PageSection';
import BVToastMixin from '@/components/Mixins/BVToastMixin';
import VuelidateMixin from '@/components/Mixins/VuelidateMixin.js';
import {
  maxLength,
  minLength,
  required,
  sameAs
} from 'vuelidate/lib/validators';

export default {
  name: 'ProfileSettings',
  components: { PageTitle, PageSection, InputPasswordToggle },
  mixins: [BVToastMixin, VuelidateMixin],
  data() {
    return {
      passwordRequirements: {
        minLength: 8,
        maxLength: 20
      },
      form: {
        newPassword: '',
        confirmPassword: ''
      }
    };
  },
  validations() {
    return {
      form: {
        newPassword: {
          required,
          minLength: minLength(this.passwordRequirements.minLength),
          maxLength: maxLength(this.passwordRequirements.maxLength)
        },
        confirmPassword: {
          required,
          sameAsPassword: sameAs('newPassword')
        }
      }
    };
  },
  computed: {
    username() {
      return this.$store.getters['global/username'];
    }
  },
  methods: {
    submitForm() {
      this.$v.$touch();
      if (this.$v.$invalid) return;
      let userData = {
        originalUsername: this.username,
        password: this.form.newPassword
      };

      this.$store
        .dispatch('localUsers/updateUser', userData)
        .then(message => this.successToast(message))
        .catch(({ message }) => this.errorToast(message));
    }
  }
};
</script>
