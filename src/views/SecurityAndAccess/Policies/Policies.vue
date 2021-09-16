<template>
  <b-container fluid="xl">
    <page-title />
    <b-row>
      <b-col md="8">
        <page-section :section-title="$t('pagePolicies.networkServices')">
          <b-row v-if="!modifySSHPolicyDisabled" class="section-divider">
            <b-col class="d-flex align-items-center justify-content-between">
              <dl class="mr-3 w-75">
                <dt id="ssh-label">{{ $t('pagePolicies.ssh') }}</dt>
                <dd id="ssh-description">
                  {{ $t('pagePolicies.sshDescription') }}
                </dd>
              </dl>
              <b-form-checkbox
                id="sshSwitch"
                v-model="sshProtocolState"
                data-test-id="policies-toggle-bmcShell"
                aria-labelledby="ssh-label"
                aria-describedby="ssh-description"
                switch
                @change="changeSshProtocolState"
              >
                <span v-if="sshProtocolState">
                  {{ $t('global.status.enabled') }}
                </span>
                <span v-else>{{ $t('global.status.disabled') }}</span>
              </b-form-checkbox>
            </b-col>
          </b-row>
          <b-row class="section-divider">
            <b-col class="d-flex align-items-center justify-content-between">
              <dl class="mt-3 mr-3 w-75">
                <dt id="ipmi-label">{{ $t('pagePolicies.ipmi') }}</dt>
                <dd id="ipmi-description">
                  {{ $t('pagePolicies.ipmiDescription') }}
                </dd>
              </dl>
              <b-form-checkbox
                id="ipmiSwitch"
                v-model="ipmiProtocolState"
                data-test-id="polices-toggle-networkIpmi"
                aria-labelledby="ipmi-label"
                aria-describedby="ipmi-description"
                switch
                @change="changeIpmiProtocolState"
              >
                <span v-if="ipmiProtocolState">
                  {{ $t('global.status.enabled') }}
                </span>
                <span v-else>{{ $t('global.status.disabled') }}</span>
              </b-form-checkbox>
            </b-col>
          </b-row>
          <b-row class="section-divider">
            <b-col class="d-flex align-items-center justify-content-between">
              <dl class="mt-3 mr-3 w-75">
                <dt id="host-tpm-label">{{ $t('pagePolicies.hostTpm') }}</dt>
                <dd id="host-tpm-description">
                  {{ $t('pagePolicies.hostTpmDescription') }}
                </dd>
              </dl>
              <b-form-checkbox
                id="host-tpm-policy"
                v-model="tpmPolicyState"
                aria-labelledby="host-tpm-label"
                aria-describedby="host-tpm-description"
                switch
                @change="changeTpmPolicyState"
              >
                <span v-if="tpmPolicyState">
                  {{ $t('global.form.required') }}
                </span>
                <span v-else>{{ $t('global.status.disabled') }}</span>
              </b-form-checkbox>
            </b-col>
          </b-row>
        </page-section>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import PageSection from '@/components/Global/PageSection';
import PageTitle from '@/components/Global/PageTitle';

import LoadingBarMixin from '@/components/Mixins/LoadingBarMixin';
import BVToastMixin from '@/components/Mixins/BVToastMixin';

export default {
  name: 'Policies',
  components: { PageTitle, PageSection },
  mixins: [LoadingBarMixin, BVToastMixin],
  beforeRouteLeave(to, from, next) {
    this.hideLoader();
    next();
  },
  data() {
    return {
      modifySSHPolicyDisabled:
        process.env.VUE_APP_MODIFY_SSH_POLICY_DISABLED === 'true',
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
    tpmPolicyState: {
      get() {
        return this.$store.getters['policies/tpmPolicyEnabled'];
      },
      set(newValue) {
        return newValue;
      },
    },
  },
  created() {
    this.startLoader();
    this.$store.dispatch('policies/getTpmPolicy');
    this.$store
      .dispatch('policies/getNetworkProtocolStatus')
      .finally(() => this.endLoader());
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
    changeTpmPolicyState(state) {
      this.$store
        .dispatch('policies/saveTpmPolicy', state)
        .then((message) => this.successToast(message))
        .catch(({ message }) => this.errorToast(message));
    },
  },
};
</script>
