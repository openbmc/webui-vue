<template>
  <b-container fluid="xl">
    <page-title />

    <b-row>
      <b-col md="8" lg="8" xl="6">
        <page-section
          :section-title="$t('pageProfileSettings.profileInfoTitle')"
        >
          <dl>
            <dt>{{ $t('pageProfileSettings.username') }}</dt>
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
          <page-section
            :section-title="$t('pageProfileSettings.changePassword')"
          >
            <b-form-group
              id="input-group-1"
              :label="$t('pageProfileSettings.newPassword')"
              label-for="input-1"
            >
              <b-form-text id="password-help-block">
                {{
                  $t('pageUserManagement.modal.passwordMustBeBetween', {
                    min: passwordRequirements.minLength,
                    max: passwordRequirements.maxLength,
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
                  data-test-id="profileSettings-input-newPassword"
                  class="form-control-with-button"
                  @input="$v.form.newPassword.$touch()"
                />
                <b-form-invalid-feedback role="alert">
                  <template
                    v-if="
                      !$v.form.newPassword.minLength ||
                      !$v.form.newPassword.maxLength
                    "
                  >
                    {{
                      $t('pageProfileSettings.newPassLabelTextInfo', {
                        min: passwordRequirements.minLength,
                        max: passwordRequirements.maxLength,
                      })
                    }}
                  </template>
                </b-form-invalid-feedback>
              </input-password-toggle>
            </b-form-group>
            <b-form-group
              id="input-group-2"
              :label="$t('pageProfileSettings.confirmPassword')"
              label-for="input-2"
            >
              <input-password-toggle>
                <b-form-input
                  id="password-confirmation"
                  v-model="form.confirmPassword"
                  type="password"
                  :state="getValidationState($v.form.confirmPassword)"
                  data-test-id="profileSettings-input-confirmPassword"
                  class="form-control-with-button"
                  @input="$v.form.confirmPassword.$touch()"
                />
                <b-form-invalid-feedback role="alert">
                  <template v-if="!$v.form.confirmPassword.sameAsPassword">
                    {{ $t('pageProfileSettings.passwordsDoNotMatch') }}
                  </template>
                </b-form-invalid-feedback>
              </input-password-toggle>
            </b-form-group>
          </page-section>
        </b-col>
      </b-row>
      <page-section :section-title="$t('pageProfileSettings.timezoneDisplay')">
        <p>{{ $t('pageProfileSettings.timezoneDisplayDesc') }}</p>
        <b-row>
          <b-col md="9" lg="8" xl="9">
            <b-form-group :label="$t('pageProfileSettings.timezone')">
              <b-form-radio
                v-model="form.isUtcDisplay"
                :value="true"
                data-test-id="profileSettings-radio-defaultUTC"
              >
                {{ $t('pageProfileSettings.defaultUTC') }}
              </b-form-radio>
              <b-form-radio
                v-model="form.isUtcDisplay"
                :value="false"
                data-test-id="profileSettings-radio-browserOffset"
              >
                {{
                  $t('pageProfileSettings.browserOffset', {
                    timezone,
                  })
                }}
              </b-form-radio>
            </b-form-group>
          </b-col>
        </b-row>
      </page-section>
      <b-button
        variant="primary"
        type="submit"
        data-test-id="profileSettings-button-saveSettings"
      >
        {{ $t('global.action.saveSettings') }}
      </b-button>
    </b-form>
  </b-container>
</template>

<script>
import BVToastMixin from '@/components/Mixins/BVToastMixin';
import InputPasswordToggle from '@/components/Global/InputPasswordToggle';
import { maxLength, minLength, sameAs } from 'vuelidate/lib/validators';
import LoadingBarMixin from '@/components/Mixins/LoadingBarMixin';
import LocalTimezoneLabelMixin from '@/components/Mixins/LocalTimezoneLabelMixin';
import PageTitle from '@/components/Global/PageTitle';
import PageSection from '@/components/Global/PageSection';
import VuelidateMixin from '@/components/Mixins/VuelidateMixin.js';

export default {
  name: 'ProfileSettings',
  components: { InputPasswordToggle, PageSection, PageTitle },
  mixins: [
    BVToastMixin,
    LocalTimezoneLabelMixin,
    LoadingBarMixin,
    VuelidateMixin,
  ],
  data() {
    return {
      form: {
        newPassword: '',
        confirmPassword: '',
        isUtcDisplay: this.$store.getters['global/isUtcDisplay'],
      },
    };
  },
  computed: {
    username() {
      return this.$store.getters['global/username'];
    },
    passwordRequirements() {
      return this.$store.getters['userManagement/accountPasswordRequirements'];
    },
    timezone() {
      return this.localOffset();
    },
  },
  created() {
    this.startLoader();
    this.$store
      .dispatch('userManagement/getAccountSettings')
      .finally(() => this.endLoader());
  },
  validations() {
    return {
      form: {
        newPassword: {
          minLength: minLength(this.passwordRequirements.minLength),
          maxLength: maxLength(this.passwordRequirements.maxLength),
        },
        confirmPassword: {
          sameAsPassword: sameAs('newPassword'),
        },
      },
    };
  },
  methods: {
    saveNewPasswordInputData() {
      this.$v.form.confirmPassword.$touch();
      this.$v.form.newPassword.$touch();
      if (this.$v.$invalid) return;
      let userData = {
        originalUsername: this.username,
        password: this.form.newPassword,
      };

      this.$store
        .dispatch('userManagement/updateUser', userData)
        .then((message) => {
          (this.form.newPassword = ''), (this.form.confirmPassword = '');
          this.$v.$reset();
          this.successToast(message);
        })
        .catch(({ message }) => this.errorToast(message));
    },
    saveTimeZonePrefrenceData() {
      localStorage.setItem('storedUtcDisplay', this.form.isUtcDisplay);
      this.$store.commit('global/setUtcTime', this.form.isUtcDisplay);
      this.successToast(
        this.$t('pageProfileSettings.toast.successSaveSettings')
      );
    },
    submitForm() {
      if (this.form.confirmPassword || this.form.newPassword) {
        this.saveNewPasswordInputData();
      }
      this.saveTimeZonePrefrenceData();
    },
  },
};
</script>
