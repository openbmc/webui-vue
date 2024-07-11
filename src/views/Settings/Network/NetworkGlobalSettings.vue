<template>
  <page-section
    v-if="firstInterface"
    :section-title="$t('pageNetwork.networkSettings')"
  >
    <b-row>
      <b-col md="2">
        <dl>
          <dt>
            {{ $t('pageNetwork.hostname') }}
            <b-button variant="link" class="p-1" @click="initSettingsModal()">
              <icon-edit :title="$t('pageNetwork.modal.editHostnameTitle')" />
            </b-button>
          </dt>
          <dd style="word-break: break-all">
            {{ dataFormatter(firstInterface.hostname) }}
          </dd>
        </dl>
      </b-col>
      <b-col md="2">
        <dl>
          <dt>{{ $t('pageNetwork.ipVersion') }}</dt>
          <dd>{{ $t('pageNetwork.ipv4') }}</dd>
          <dd>{{ $t('pageNetwork.ipv6') }}</dd>
        </dl>
      </b-col>
      <b-col md="2">
        <dl>
          <dt>{{ $t('pageNetwork.useDomainName') }}</dt>
          <dd>
            <b-form-checkbox
              id="useDomainNameSwitch"
              v-model="useDomainNameState"
              data-test-id="networkSettings-switch-useDomainName"
              switch
              @change="changeDomainNameState"
            >
              <span v-if="useDomainNameState">
                {{ $t('global.status.enabled') }}
              </span>
              <span v-else>{{ $t('global.status.disabled') }}</span>
            </b-form-checkbox>
          </dd>
          <dd>
            <b-form-checkbox
              id="useDomainNameSwitchIpv6"
              v-model="useDomainNameStateIpv6"
              data-test-id="networkSettings-switch-useDomainNameIpv6"
              switch
              @change="changeDomainNameStateIpv6"
            >
              <span v-if="useDomainNameStateIpv6">
                {{ $t('global.status.enabled') }}
              </span>
              <span v-else>{{ $t('global.status.disabled') }}</span>
            </b-form-checkbox>
          </dd>
        </dl>
      </b-col>
      <b-col md="2">
        <dl>
          <dt>{{ $t('pageNetwork.useDns') }}</dt>
          <dd>
            <b-form-checkbox
              id="useDnsSwitch"
              v-model="useDnsState"
              data-test-id="networkSettings-switch-useDns"
              switch
              @change="changeDnsState"
            >
              <span v-if="useDnsState">
                {{ $t('global.status.enabled') }}
              </span>
              <span v-else>{{ $t('global.status.disabled') }}</span>
            </b-form-checkbox>
          </dd>
          <dd>
            <b-form-checkbox
              id="useDnsSwitchIpv6"
              v-model="useDnsStateIpv6"
              data-test-id="networkSettings-switch-useDnsIpv6"
              switch
              @change="changeDnsStateIpv6"
            >
              <span v-if="useDnsStateIpv6">
                {{ $t('global.status.enabled') }}
              </span>
              <span v-else>{{ $t('global.status.disabled') }}</span>
            </b-form-checkbox>
          </dd>
        </dl>
      </b-col>
      <b-col md="2">
        <dl>
          <dt>{{ $t('pageNetwork.useNtp') }}</dt>
          <dd>
            <b-form-checkbox
              id="useNtpSwitch"
              v-model="useNtpState"
              data-test-id="networkSettings-switch-useNtp"
              switch
              @change="changeNtpState"
            >
              <span v-if="useNtpState">
                {{ $t('global.status.enabled') }}
              </span>
              <span v-else>{{ $t('global.status.disabled') }}</span>
            </b-form-checkbox>
          </dd>
          <dd>
            <b-form-checkbox
              id="useNtpSwitchIpv6"
              v-model="useNtpStateIpv6"
              data-test-id="networkSettings-switch-useNtpIpv6"
              switch
              @change="changeNtpStateIpv6"
            >
              <span v-if="useNtpStateIpv6">
                {{ $t('global.status.enabled') }}
              </span>
              <span v-else>{{ $t('global.status.disabled') }}</span>
            </b-form-checkbox>
          </dd>
        </dl>
      </b-col>
    </b-row>
  </page-section>
</template>

<script>
import BVToastMixin from '@/components/Mixins/BVToastMixin';
import IconEdit from '@carbon/icons-vue/es/edit/16';
import DataFormatterMixin from '@/components/Mixins/DataFormatterMixin';
import PageSection from '@/components/Global/PageSection';
import { mapState } from 'vuex';
import { useI18n } from 'vue-i18n';

export default {
  name: 'GlobalNetworkSettings',
  components: { IconEdit, PageSection },
  mixins: [BVToastMixin, DataFormatterMixin],

  data() {
    return {
      $t: useI18n().t,
      hostname: '',
    };
  },
  computed: {
    ...mapState('network', ['ethernetData']),
    firstInterface() {
      return this.$store.getters['network/globalNetworkSettings'][0];
    },
    useDomainNameState: {
      get() {
        return this.$store.getters['network/globalNetworkSettings'][0]
          .useDomainNameEnabled;
      },
      set(newValue) {
        return newValue;
      },
    },
    useDnsState: {
      get() {
        return this.$store.getters['network/globalNetworkSettings'][0]
          .useDnsEnabled;
      },
      set(newValue) {
        return newValue;
      },
    },
    useNtpState: {
      get() {
        return this.$store.getters['network/globalNetworkSettings'][0]
          .useNtpEnabled;
      },
      set(newValue) {
        return newValue;
      },
    },
    useDomainNameStateIpv6: {
      get() {
        return this.$store.getters['network/globalNetworkSettings'][0]
          .useDomainNameEnabledIpv6;
      },
      set(newValue) {
        return newValue;
      },
    },
    useDnsStateIpv6: {
      get() {
        return this.$store.getters['network/globalNetworkSettings'][0]
          .useDnsEnabledIpv6v6;
      },
      set(newValue) {
        return newValue;
      },
    },
    useNtpStateIpv6: {
      get() {
        return this.$store.getters['network/globalNetworkSettings'][0]
          .useNtpEnabledIpv6;
      },
      set(newValue) {
        return newValue;
      },
    },
  },
  created() {
    this.$store.dispatch('network/getEthernetData').finally(() => {
      // Emit initial data fetch complete to parent component
      this.$root.$emit('network-global-settings-complete');
    });
  },
  methods: {
    changeDomainNameState(state) {
      this.$store
        .dispatch('network/saveDomainNameState', {
          domainState: state,
          ipVersion: 'IPv4',
        })
        .then((success) => {
          this.successToast(success);
        })
        .catch(({ message }) => this.errorToast(message));
    },
    changeDnsState(state) {
      this.$store
        .dispatch('network/saveDnsState', {
          dnsState: state,
          ipVersion: 'IPv4',
        })
        .then((message) => {
          this.successToast(message);
        })
        .catch(({ message }) => this.errorToast(message));
    },
    changeNtpState(state) {
      this.$store
        .dispatch('network/saveNtpState', {
          ntpState: state,
          ipVersion: 'IPv4',
        })
        .then((message) => {
          this.successToast(message);
        })
        .catch(({ message }) => this.errorToast(message));
    },
    changeDomainNameStateIpv6(state) {
      this.$store
        .dispatch('network/saveDomainNameState', {
          domainState: state,
          ipVersion: 'IPv6',
        })
        .then((success) => {
          this.successToast(success);
        })
        .catch(({ message }) => this.errorToast(message));
    },
    changeDnsStateIpv6(state) {
      this.$store
        .dispatch('network/saveDnsState', {
          dnsState: state,
          ipVersion: 'IPv6',
        })
        .then((message) => {
          this.successToast(message);
        })
        .catch(({ message }) => this.errorToast(message));
    },
    changeNtpStateIpv6(state) {
      this.$store
        .dispatch('network/saveNtpState', {
          ntpState: state,
          ipVersion: 'IPv6',
        })
        .then((message) => {
          this.successToast(message);
        })
        .catch(({ message }) => this.errorToast(message));
    },
    initSettingsModal() {
      this.$bvModal.show('modal-hostname');
    },
  },
};
</script>
