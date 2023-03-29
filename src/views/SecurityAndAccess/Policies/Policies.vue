<template>
  <b-container fluid="xl">
    <page-title />
    <b-row>
      <b-col md="8">
        <b-row v-if="!modifySSHPolicyDisabled" class="setting-section">
          <b-col class="d-flex align-items-center justify-content-between">
            <dl class="mr-3 w-75">
              <dt>{{ $t('pagePolicies.ssh') }}</dt>
              <dd>
                {{ $t('pagePolicies.sshDescription') }}
              </dd>
            </dl>
            <b-form-checkbox
              id="sshSwitch"
              v-model="sshProtocolState"
              data-test-id="policies-toggle-bmcShell"
              switch
              @change="changeSshProtocolState"
            >
              <span class="sr-only">
                {{ $t('pagePolicies.ssh') }}
              </span>
              <span v-if="sshProtocolState">
                {{ $t('global.status.enabled') }}
              </span>
              <span v-else>{{ $t('global.status.disabled') }}</span>
            </b-form-checkbox>
          </b-col>
        </b-row>
        <b-row class="setting-section">
          <b-col class="d-flex align-items-center justify-content-between">
            <dl class="mt-3 mr-3 w-75">
              <dt>{{ $t('pagePolicies.ipmi') }}</dt>
              <dd>
                {{ $t('pagePolicies.ipmiDescription') }}
              </dd>
            </dl>
            <b-form-checkbox
              id="ipmiSwitch"
              v-model="ipmiProtocolState"
              data-test-id="polices-toggle-networkIpmi"
              switch
              @change="changeIpmiProtocolState"
            >
              <span class="sr-only">
                {{ $t('pagePolicies.ipmi') }}
              </span>
              <span v-if="ipmiProtocolState">
                {{ $t('global.status.enabled') }}
              </span>
              <span v-else>{{ $t('global.status.disabled') }}</span>
            </b-form-checkbox>
          </b-col>
        </b-row>
        <b-row class="setting-section">
          <b-col class="d-flex align-items-center justify-content-between">
            <dl class="mt-3 mr-3 w-75">
              <dt>{{ $t('pagePolicies.vtpm') }}</dt>
              <dd>
                {{ $t('pagePolicies.vtpmDescription') }}
              </dd>
            </dl>
            <b-form-checkbox
              id="vtpmSwitch"
              v-model="vtpmState"
              data-test-id="policies-toggle-vtpm"
              switch
              @change="changeVtpmState"
            >
              <span class="sr-only">
                {{ $t('pagePolicies.vtpm') }}
              </span>
              <span v-if="vtpmState">
                {{ $t('global.status.enabled') }}
              </span>
              <span v-else>{{ $t('global.status.disabled') }}</span>
            </b-form-checkbox>
          </b-col>
        </b-row>
        <b-row class="setting-section">
          <b-col class="d-flex align-items-center justify-content-between">
            <dl class="mt-3 mr-3 w-75">
              <dt>{{ $t('pagePolicies.rtad') }}</dt>
              <dd>
                {{ $t('pagePolicies.rtadDescription') }}
              </dd>
            </dl>
            <b-form-checkbox
              id="rtadSwitch"
              v-model="rtadState"
              data-test-id="policies-toggle-rtad"
              switch
              @change="changeRtadState"
            >
              <span class="sr-only">
                {{ $t('pagePolicies.rtad') }}
              </span>
              <span v-if="rtadState">
                {{ $t('global.status.enabled') }}
              </span>
              <span v-else>{{ $t('global.status.disabled') }}</span>
            </b-form-checkbox>
          </b-col>
        </b-row>
        <b-row class="setting-section">
          <b-col class="d-flex align-items-center justify-content-between">
            <dl class="mt-3 mr-3 w-75">
              <dt>{{ $t('pagePolicies.webSessionTimeOut') }}</dt>
              <dd>
                {{ $t('pagePolicies.webSessionTimeOutDescription') }}
              </dd>
            </dl>
          </b-col>
          <b-col lg="3" class="session-timeout">
            <b-form-select
              id="session-timeout-options"
              v-model="sessionTimeoutState"
              :options="sessionTimeOutOptions"
              @change="saveSessionTimeoutValue"
            >
              <template #first>
                <b-form-select-option :value="null" disabled>
                  {{ $t('global.form.selectAnOption') }}
                </b-form-select-option>
              </template>
            </b-form-select>
          </b-col>
        </b-row>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import PageTitle from '@/components/Global/PageTitle';

import LoadingBarMixin from '@/components/Mixins/LoadingBarMixin';
import BVToastMixin from '@/components/Mixins/BVToastMixin';

export default {
  name: 'Policies',
  components: { PageTitle },
  mixins: [LoadingBarMixin, BVToastMixin],
  beforeRouteLeave(to, from, next) {
    this.hideLoader();
    next();
  },
  data() {
    return {
      modifySSHPolicyDisabled:
        process.env.VUE_APP_MODIFY_SSH_POLICY_DISABLED === 'true',
      sessionTimeOutOptions: [
        { value: 1800, text: this.$t('pagePolicies.options.30minutes') },
        { value: 3600, text: this.$t('pagePolicies.options.1hour') },
        { value: 7200, text: this.$t('pagePolicies.options.2hours') },
        { value: 14400, text: this.$t('pagePolicies.options.4hours') },
        { value: 28800, text: this.$t('pagePolicies.options.8hours') },
        { value: 86400, text: this.$t('pagePolicies.options.1day') },
      ],
    };
  },
  computed: {
    sshProtocolState: {
      get() {
        return this.$store.getters['policies/sshProtocolEnabled'];
      },
      set(newValue) {
        return newValue;
      },
    },
    ipmiProtocolState: {
      get() {
        return this.$store.getters['policies/ipmiProtocolEnabled'];
      },
      set(newValue) {
        return newValue;
      },
    },
    rtadState: {
      get() {
        if (this.$store.getters['policies/rtadEnabled'] === 'Enabled') {
          return true;
        } else {
          return false;
        }
      },
      set(newValue) {
        return newValue;
      },
    },
    vtpmState: {
      get() {
        if (this.$store.getters['policies/vtpmEnabled'] === 'Enabled') {
          return true;
        } else {
          return false;
        }
      },
      set(newValue) {
        return newValue;
      },
    },
    sessionTimeoutState: {
      get() {
        return this.$store.getters['policies/getSessionTimeoutValue'];
      },
      set(newValue) {
        return newValue;
      },
    },
  },
  created() {
    this.startLoader();
    Promise.all([
      this.$store.dispatch('policies/getBiosStatus'),
      this.$store.dispatch('policies/getNetworkProtocolStatus'),
      this.$store.dispatch('policies/getSessionTimeout'),
    ]).finally(() => this.endLoader());
  },
  methods: {
    changeIpmiProtocolState(state) {
      this.$store
        .dispatch('policies/saveIpmiProtocolState', state)
        .then((message) => this.successToast(message))
        .catch(({ message }) => this.errorToast(message));
    },
    changeSshProtocolState(state) {
      this.$store
        .dispatch('policies/saveSshProtocolState', state)
        .then((message) => this.successToast(message))
        .catch(({ message }) => this.errorToast(message));
    },
    changeRtadState(state) {
      this.$store
        .dispatch('policies/saveRtadState', state ? 'Enabled' : 'Disabled')
        .then((message) => this.successToast(message))
        .catch(({ message }) => this.errorToast(message));
    },
    changeVtpmState(state) {
      this.$store
        .dispatch('policies/saveVtpmState', state ? 'Enabled' : 'Disabled')
        .then((message) => this.successToast(message))
        .catch(({ message }) => this.errorToast(message));
    },
    saveSessionTimeoutValue(sessionTimeoutState) {
      this.$store
        .dispatch('policies/saveSessionTimeoutValue', sessionTimeoutState)
        .then((message) => this.successToast(message))
        .catch(({ message }) => this.errorToast(message));
    },
  },
};
</script>

<style lang="scss" scoped>
.setting-section {
  border-bottom: 1px solid gray('300');
}
.session-timeout {
  align-self: center;
}
</style>
