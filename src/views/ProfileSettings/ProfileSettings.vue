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
      <page-section :section-title="$t('profileSettings.timezoneDisplay')">
        <p>{{ $t('profileSettings.timezoneDisplayDesc') }}</p>
        <b-row>
          <b-col md="9" lg="8" xl="9">
            <b-form-group :label="$t('profileSettings.timezone')">
              <b-form-radio
                v-model="form.isUtcDisplay"
                :value="true"
                @change="$v.form.isUtcDisplay.$touch()"
              >
                {{ $t('profileSettings.defaultUTC') }}
              </b-form-radio>
              <b-form-radio
                v-model="form.isUtcDisplay"
                :value="false"
                @change="$v.form.isUtcDisplay.$touch()"
              >
                {{
                  $t('profileSettings.browserOffset', {
                    timezone
                  })
                }}
              </b-form-radio>
            </b-form-group>
          </b-col>
        </b-row>
      </page-section>
      <b-button variant="primary" type="submit">
        {{ $t('global.action.save') }}
      </b-button>
    </b-form>
  </b-container>
</template>

<script>
import i18n from '@/i18n';
import PageTitle from '@/components/Global/PageTitle';
import PageSection from '@/components/Global/PageSection';
import BVToastMixin from '@/components/Mixins/BVToastMixin';
import VuelidateMixin from '@/components/Mixins/VuelidateMixin.js';
import InputPasswordToggle from '@/components/Global/InputPasswordToggle';
import { utcToZonedTime, format } from 'date-fns-tz';
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
        confirmPassword: '',
        isUtcDisplay: this.$store.getters['global/isUtcDisplay']
      }
    };
  },
  validations() {
    return {
      form: {
        isUtcDisplay: { required },
        newPassword: {
          minLength: minLength(this.passwordRequirements.minLength),
          maxLength: maxLength(this.passwordRequirements.maxLength)
        },
        confirmPassword: {
          sameAsPassword: sameAs('newPassword')
        }
      }
    };
  },
  computed: {
    username() {
      return this.$store.getters['global/username'];
    },
    timezone() {
      const pattern = `z O`;
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const zonedDate = utcToZonedTime(new Date(), timezone);
      return format(zonedDate, pattern, { timezone }).replace('GMT', 'UTC');
    }
  },
  methods: {
    saveNewPasswordInputData() {
      this.$v.form.confirmPassword.$touch();
      this.$v.form.newPassword.$touch();
      if (this.$v.$invalid) return;
      let userData = {
        originalUsername: this.username,
        password: this.form.newPassword
      };

      this.$store
        .dispatch('localUsers/updateUser', userData)
        .then(message => this.successToast(message))
        .catch(({ message }) => this.errorToast(message));
    },
    saveTimeZonePrefrenceData() {
      localStorage.setItem('storedUtcDisplay', this.form.isUtcDisplay);
      this.$store.commit('global/setUtcTime', this.form.isUtcDisplay);
      this.successToast(
        i18n.t('profileSettings.toast.successTimezonePreference')
      );
    },
    submitForm() {
      this.form.confirmPassword || this.form.newPassword
        ? this.saveNewPasswordInputData()
        : '';
      this.$v.form.isUtcDisplay.$anyDirty
        ? this.saveTimeZonePrefrenceData()
        : '';
    }
  }
};
</script>
