<template>
  <b-container fluid="xl">
    <page-title />

    <b-row>
      <b-col md="8" lg="8" xl="6">
        <page-section
          :section-title="t('pageProfileSettings.profileInfoTitle')"
        >
          <dl>
            <dt>{{ t('pageProfileSettings.username') }}</dt>
            <dd>
              {{ username }}
            </dd>
          </dl>
          <!-- Show account details if local account exists -->
          <template v-if="accountDetails">
            <dl>
              <dt>{{ t('pageProfileSettings.role') }}</dt>
              <dd>{{ accountDetails.RoleId || '--' }}</dd>
            </dl>
            <dl>
              <dt>{{ t('pageProfileSettings.accountStatus') }}</dt>
              <dd>
                <template v-if="accountDetails.Enabled === true">
                  {{ t('global.status.enabled') }}
                </template>
                <template v-else-if="accountDetails.Enabled === false">
                  {{ t('global.status.disabled') }}
                </template>
                <template v-else>--</template>
              </dd>
            </dl>
            <dl v-if="accountDetails.AccountTypes?.length">
              <dt>{{ t('pageProfileSettings.accountTypes') }}</dt>
              <dd>{{ accountDetails.AccountTypes.join(', ') }}</dd>
            </dl>
            <dl v-if="accountDetails.Locked !== undefined">
              <dt>{{ t('pageProfileSettings.accountLocked') }}</dt>
              <dd>
                <template v-if="accountDetails.Locked">
                  {{ t('global.status.yes') }}
                </template>
                <template v-else>
                  {{ t('global.status.no') }}
                </template>
              </dd>
            </dl>
          </template>
          <!-- Show message for external/LDAP users -->
          <p v-else-if="isExternalUser" class="text-muted small">
            {{ t('pageProfileSettings.externalAccountMessage') }}
          </p>
        </page-section>
      </b-col>
    </b-row>

    <b-form @submit.prevent="submitForm">
      <!-- Hidden username field for browser autocomplete accessibility -->
      <input
        type="text"
        name="username"
        :value="username"
        autocomplete="username"
        class="visually-hidden"
        aria-hidden="true"
        tabindex="-1"
      />
      <b-row>
        <b-col sm="8" md="6" xl="3">
          <page-section
            :section-title="t('pageProfileSettings.changePassword')"
          >
            <b-form-group
              id="input-group-0"
              :label="t('pageProfileSettings.currentPassword')"
              label-for="input-0"
            >
              <input-password-toggle>
                <b-form-input
                  id="old-password"
                  v-model="form.currentPassword"
                  type="password"
                  autocomplete="current-password"
                  data-test-id="profileSettings-input-ocurrentPassword"
                  class="form-control-with-button"
                />
              </input-password-toggle>
            </b-form-group>
            <b-form-group
              id="input-group-1"
              :label="t('pageProfileSettings.newPassword')"
              label-for="input-1"
            >
              <b-form-text id="password-help-block">
                {{
                  t('pageUserManagement.modal.passwordMustBeBetween', {
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
                  autocomplete="new-password"
                  :state="getValidationState(v$.form.newPassword)"
                  data-test-id="profileSettings-input-newPassword"
                  class="form-control-with-button"
                  @input="v$.form.newPassword.$touch()"
                />
                <b-form-invalid-feedback role="alert">
                  <template
                    v-if="
                      v$.form.newPassword.minLength.$invalid ||
                      v$.form.newPassword.maxLength.$invalid
                    "
                  >
                    {{
                      t('pageProfileSettings.newPassLabelTextInfo', {
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
              :label="t('pageProfileSettings.confirmPassword')"
              label-for="input-2"
            >
              <input-password-toggle>
                <b-form-input
                  id="password-confirmation"
                  v-model="form.confirmPassword"
                  type="password"
                  autocomplete="new-password"
                  :state="getValidationState(v$.form.confirmPassword)"
                  data-test-id="profileSettings-input-confirmPassword"
                  class="form-control-with-button"
                  @input="v$.form.confirmPassword.$touch()"
                />
                <b-form-invalid-feedback role="alert">
                  <template
                    v-if="v$.form.confirmPassword.sameAsPassword.$invalid"
                  >
                    {{ t('pageProfileSettings.passwordsDoNotMatch') }}
                  </template>
                </b-form-invalid-feedback>
              </input-password-toggle>
            </b-form-group>
          </page-section>
        </b-col>
      </b-row>
      <page-section :section-title="t('pageProfileSettings.timezoneDisplay')">
        <p>{{ t('pageProfileSettings.timezoneDisplayDesc') }}</p>
        <b-row>
          <b-col md="9" lg="8" xl="9">
            <b-form-group :label="t('pageProfileSettings.timezone')">
              <b-form-radio
                v-model="form.isUtcDisplay"
                :value="true"
                data-test-id="profileSettings-radio-defaultUTC"
              >
                {{ t('pageProfileSettings.defaultUTC') }}
              </b-form-radio>
              <b-form-radio
                v-model="form.isUtcDisplay"
                :value="false"
                data-test-id="profileSettings-radio-browserOffset"
              >
                {{
                  t('pageProfileSettings.browserOffset', {
                    timezone: localTimezoneOffset,
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
        {{ t('global.action.saveSettings') }}
      </b-button>
    </b-form>
  </b-container>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue';
import { useStore } from 'vuex';
import { useI18n } from 'vue-i18n';
import { useToast } from 'bootstrap-vue-next';
import { useVuelidate } from '@vuelidate/core';
import { maxLength, minLength, sameAs } from '@vuelidate/validators';
import { format } from 'date-fns-tz';

import InputPasswordToggle from '@/components/Global/InputPasswordToggle.vue';
import PageTitle from '@/components/Global/PageTitle.vue';
import PageSection from '@/components/Global/PageSection.vue';
import eventBus from '@/eventBus';
import { useAuthStore } from '@/stores/auth';
import { useGetAccountServiceAccountById } from '@/api/endpoints/redfish.gen';

// Composables
const store = useStore();
const { t } = useI18n();
const toast = useToast();
const authStore = useAuthStore();

// ============================================================================
// Account Details (Vue Query)
// ============================================================================

const username = computed(() => store.getters['global/username']);

// Use Vue Query to fetch account details
// enabled: only fetch when username is available
const {
  data: accountDetails,
  isError: accountError,
  error: accountErrorDetails,
} = useGetAccountServiceAccountById(username, {
  query: {
    enabled: computed(() => !!username.value),
    retry: false, // Don't retry on 404 (LDAP users)
  },
});

// Check if user is external (LDAP/AD) based on 404 error
const isExternalUser = computed(() => {
  if (!accountError.value) return false;
  const err = accountErrorDetails.value as { response?: { status?: number } } | null;
  return err?.response?.status === 404;
});

// ============================================================================
// Password Requirements (Vuex)
// ============================================================================

const passwordRequirements = computed(
  () => store.getters['userManagement/accountPasswordRequirements'],
);

// Fetch account settings on mount
store.dispatch('userManagement/getAccountSettings');

// ============================================================================
// Form State
// ============================================================================

const form = reactive({
  newPassword: '',
  confirmPassword: '',
  currentPassword: '',
  isUtcDisplay: store.getters['global/isUtcDisplay'] as boolean,
});

// ============================================================================
// Validation (Vuelidate)
// ============================================================================

const rules = computed(() => ({
  form: {
    newPassword: {
      minLength: minLength(passwordRequirements.value?.minLength ?? 1),
      maxLength: maxLength(passwordRequirements.value?.maxLength ?? 128),
    },
    confirmPassword: {
      sameAsPassword: sameAs(form.newPassword),
    },
  },
}));

const v$ = useVuelidate(rules, { form });

function getValidationState(model: { $dirty?: boolean; $error?: boolean } | undefined) {
  if (!model) return null;
  const { $dirty, $error } = model;
  return $dirty ? !$error : null;
}

// ============================================================================
// Timezone
// ============================================================================

function getShortTimeZone(date: Date): string {
  const longTZ = date
    .toString()
    .match(/\((.*)\)/)
    ?.pop() ?? '';
  const regexNotUpper = /[*a-z ]/g;
  return longTZ.replace(regexNotUpper, '');
}

const localTimezoneOffset = computed(() => {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const shortTz = getShortTimeZone(new Date());
  const pattern = `'${shortTz}' O`;
  return format(new Date(), pattern, { timeZone: timezone }).replace('GMT', 'UTC');
});

// ============================================================================
// Loading Bar
// ============================================================================

function startLoader() {
  eventBus.$emit('loader-start');
}

function endLoader() {
  eventBus.$emit('loader-end');
}

// ============================================================================
// Toast Helpers
// ============================================================================

function successToast(message: string) {
  toast?.show?.({
    body: message,
    props: {
      title: t('global.status.success'),
      variant: 'success',
      isStatus: true,
      interval: 10000,
    },
  });
}

function errorToast(message: string) {
  toast?.show?.({
    body: message,
    props: {
      title: t('global.status.error'),
      variant: 'danger',
      isStatus: true,
    },
  });
}

// ============================================================================
// Form Actions
// ============================================================================

async function saveNewPasswordInputData() {
  v$.value.form.confirmPassword.$touch();
  v$.value.form.newPassword.$touch();
  if (v$.value.$invalid) return;

  const userData = {
    originalUsername: username.value,
    password: form.newPassword,
  };

  try {
    const message = await store.dispatch('userManagement/updateUser', userData);
    form.newPassword = '';
    form.confirmPassword = '';
    form.currentPassword = '';
    v$.value.$reset();
    successToast(message);
    authStore.logout();
  } catch (err) {
    const error = err as { message?: string };
    errorToast(error.message ?? t('global.status.error'));
  }
}

function saveTimeZonePreferenceData() {
  localStorage.setItem('storedUtcDisplay', String(form.isUtcDisplay));
  store.commit('global/setUtcTime', form.isUtcDisplay);
  successToast(t('pageProfileSettings.toast.successUpdatingTimeZone'));
}

function submitForm() {
  if (form.confirmPassword && form.newPassword && form.currentPassword) {
    confirmAuthenticate();
  }
  if (store.getters['global/isUtcDisplay'] !== form.isUtcDisplay) {
    saveTimeZonePreferenceData();
  }
}

async function confirmAuthenticate() {
  v$.value.form.newPassword.$touch();
  if (v$.value.$invalid) return;

  try {
    await authStore.login(username.value, form.currentPassword);
    saveNewPasswordInputData();
  } catch {
    v$.value.$reset();
    errorToast(t('pageProfileSettings.toast.wrongCredentials'));
  }
}
</script>
