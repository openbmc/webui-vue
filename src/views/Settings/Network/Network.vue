<template>
  <b-container fluid="xl">
    <page-title :description="$t('pageNetwork.pageDescription')" />
    <page-section :section-title="$t('pageNetwork.networkSettings')">
      <b-row class="w-75">
        <b-col md="3">
          <dl>
            <dt>{{ $t('pageNetwork.hostname') }}</dt>
            <dd>{{ dataFormatter(hostname) }}</dd>
          </dl>
        </b-col>
        <b-col md="3">
          <dl class="text-nowrap">
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
          </dl>
        </b-col>
        <b-col md="3">
          <dl class="text-nowrap">
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
          </dl>
        </b-col>
        <b-col md="3">
          <dl class="text-nowrap">
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
          </dl>
        </b-col>
      </b-row>
    </page-section>
    <page-section>
      <b-row>
        <b-col>
          <b-card no-body>
            <b-tabs active-nav-item-class="font-weight-bold" card>
              <b-tab
                v-for="(data, index) in ethernetData"
                :key="data.Id"
                :title="data.Id"
                active
                @click="getTabIndex(index)"
              >
                <page-section class="mt-3">
                  <b-row>
                    <b-col md="3">
                      <dl>
                        <dt>{{ $t('pageNetwork.linkStatus') }}</dt>
                        <dd>
                          {{ dataFormatter(data.LinkStatus) }}
                        </dd>
                      </dl>
                    </b-col>
                    <b-col md="3">
                      <dl>
                        <dt>{{ $t('pageNetwork.speed') }}</dt>
                        <dd>
                          {{ dataFormatter(data.SpeedMbps) }}
                        </dd>
                      </dl>
                    </b-col>
                  </b-row>
                </page-section>
                <page-section
                  :section-title="$t('pageNetwork.interfaceSection')"
                >
                  <b-row>
                    <b-col md="3">
                      <dl class="text-nowrap">
                        <dt>{{ $t('pageNetwork.fqdn') }}</dt>
                        <dd>
                          {{ dataFormatter(data.FQDN) }}
                        </dd>
                      </dl>
                    </b-col>
                    <b-col md="3">
                      <dl class="text-nowrap">
                        <dt>{{ $t('pageNetwork.macAddress') }}</dt>
                        <dd>
                          {{ dataFormatter(data.MACAddress) }}
                        </dd>
                      </dl>
                    </b-col>
                  </b-row>
                </page-section>
                <page-section :section-title="$t('pageNetwork.ipv4')">
                  <b-row>
                    <b-col lg="9" class="mb-3">
                      <h3 class="h5">
                        {{ $t('pageNetwork.ipv4Addresses') }}
                      </h3>
                      <b-table
                        responsive="md"
                        hover
                        :fields="ipv4TableFields"
                        :items="form.ipv4TableItems"
                        :empty-text="$t('global.table.emptyMessage')"
                        class="mb-0"
                        show-empty
                      >
                        <template #cell(actions)="{ item }">
                          <table-row-action
                            v-for="(action, actionIndex) in item.actions"
                            :key="actionIndex"
                            :value="action.value"
                            :title="action.title"
                            :enabled="action.enabled"
                            @click-table-action="
                              onIpv4TableAction(action, $event, index)
                            "
                          >
                            <template #icon>
                              <icon-edit v-if="action.value === 'edit'" />
                              <icon-trashcan v-if="action.value === 'delete'" />
                            </template>
                          </table-row-action>
                        </template>
                      </b-table>
                    </b-col>
                  </b-row>
                </page-section>
                <page-section :section-title="$t('pageNetwork.staticDns')">
                  <b-row>
                    <b-col lg="9" class="mb-3">
                      <b-table
                        responsive="md"
                        hover
                        :fields="dnsTableFields"
                        :items="form.dnsStaticTableItems"
                        :empty-text="$t('global.table.emptyMessage')"
                        class="mb-0"
                        show-empty
                      >
                        <template #cell(actions)="{ item }">
                          <table-row-action
                            v-for="(action, actionIndex) in item.actions"
                            :key="actionIndex"
                            :value="action.value"
                            :title="action.title"
                            :enabled="action.enabled"
                            @click-table-action="
                              onDnsTableAction(action, $event, index)
                            "
                          >
                            <template #icon>
                              <icon-edit v-if="action.value === 'edit'" />
                              <icon-trashcan v-if="action.value === 'delete'" />
                            </template>
                          </table-row-action>
                        </template>
                      </b-table>
                    </b-col>
                  </b-row>
                </page-section>
              </b-tab>
            </b-tabs>
          </b-card>
        </b-col>
      </b-row>
    </page-section>
  </b-container>
</template>

<script>
import BVToastMixin from '@/components/Mixins/BVToastMixin';
import DataFormatterMixin from '@/components/Mixins/DataFormatterMixin';
import IconEdit from '@carbon/icons-vue/es/edit/20';
import IconTrashcan from '@carbon/icons-vue/es/trash-can/20';
import LoadingBarMixin, { loading } from '@/components/Mixins/LoadingBarMixin';
import PageSection from '@/components/Global/PageSection';
import PageTitle from '@/components/Global/PageTitle';
import TableRowAction from '@/components/Global/TableRowAction';
import { mapState } from 'vuex';

export default {
  name: 'Network',
  components: {
    IconEdit,
    IconTrashcan,
    PageSection,
    PageTitle,
    TableRowAction,
  },
  mixins: [BVToastMixin, DataFormatterMixin, LoadingBarMixin],
  beforeRouteLeave(to, from, next) {
    this.hideLoader();
    next();
  },
  data() {
    return {
      firstInterface: '',
      hostname: '',
      loading,
      tabIndex: 0,
      form: {
        dnsStaticTableItems: [],
        ipv4TableItems: [],
      },
      actions: [
        {
          value: 'edit',
          title: this.$t('global.action.edit'),
        },
        {
          value: 'delete',
          title: this.$t('global.action.delete'),
        },
      ],
      dnsTableFields: [
        {
          key: 'address',
          label: this.$t('pageNetwork.table.ipAddress'),
        },
        { key: 'actions', label: '', tdClass: 'text-right' },
      ],
      ipv4TableFields: [
        {
          key: 'Address',
          label: this.$t('pageNetwork.table.ipAddress'),
        },
        {
          key: 'Gateway',
          label: this.$t('pageNetwork.table.gateway'),
        },
        {
          key: 'SubnetMask',
          label: this.$t('pageNetwork.table.subnet'),
        },
        { key: 'actions', label: '', tdClass: 'text-right' },
      ],
    };
  },
  computed: {
    ...mapState('network', ['ethernetData']),
    useDomainNameState: {
      get() {
        return this.$store.getters['network/isDomainNameEnabled'];
      },
      set(newValue) {
        return newValue;
      },
    },
    useDnsState: {
      get() {
        return this.$store.getters['network/isDnsEnabled'];
      },
      set(newValue) {
        return newValue;
      },
    },
    useNtpState: {
      get() {
        return this.$store.getters['network/isNtpEnabled'];
      },
      set(newValue) {
        return newValue;
      },
    },
  },
  watch: {
    ethernetData: function () {
      this.selectInterface();
    },
  },
  created() {
    this.startLoader();
    this.$store
      .dispatch('network/getEthernetData')
      .finally(() => this.endLoader());
  },
  methods: {
    selectInterface() {
      this.firstInterface = this.ethernetData[0];
      this.getNetworkSettings();
      this.getIpv4TableItems();
      this.getStaticDnsItems();
    },
    getNetworkSettings() {
      this.hostname = this.firstInterface.HostName;
    },
    changeDomainNameState(state) {
      this.$store
        .dispatch('network/saveDomainNameState', state)
        .then((success) => {
          this.successToast(success);
        })
        .catch(({ message }) => this.errorToast(message));
    },
    changeDnsState(state) {
      this.$store
        .dispatch('network/saveDnsState', state)
        .then((message) => this.successToast(message))
        .catch(({ message }) => this.errorToast(message));
    },
    changeNtpState(state) {
      this.$store
        .dispatch('network/saveNtpState', state)
        .then((message) => this.successToast(message))
        .catch(({ message }) => this.errorToast(message));
    },
    getTabIndex(index) {
      const selectedTabIndex = index;
      this.tabIndex = selectedTabIndex;
      this.getIpv4TableItems();
      this.getStaticDnsItems();
    },
    getIpv4TableItems() {
      const index = this.tabIndex;
      const addresses = this.ethernetData[index].IPv4Addresses || [];
      this.form.ipv4TableItems = addresses.map((ipv4) => {
        return {
          Address: ipv4.Address,
          SubnetMask: ipv4.SubnetMask,
          Gateway: ipv4.Gateway,
          actions: [
            {
              value: 'edit',
              title: this.$t('pageNetwork.table.editIpv4'),
              enabled: false,
            },
            {
              value: 'delete',
              title: this.$t('pageNetwork.table.deleteIpv4'),
              enabled: false,
            },
          ],
        };
      });
    },
    onIpv4TableAction(action, row) {
      if (action === 'delete') {
        this.form.ipv4TableItems.splice(row, 1);
        // TODO: delete row in store
      }
    },
    getStaticDnsItems() {
      const index = this.tabIndex;
      const dns = this.ethernetData[index].StaticNameServers || [];
      this.form.dnsStaticTableItems = dns.map((server) => {
        return {
          address: server,
          actions: [
            {
              value: 'edit',
              title: this.$t('pageNetwork.table.editDns'),
            },
            {
              value: 'delete',
              title: this.$t('pageNetwork.table.deleteDns'),
            },
          ],
        };
      });
    },
    onDnsTableAction(action, row) {
      if (action === 'delete') {
        this.form.dnsStaticTableItems.splice(row, 1);
        // TODO: delete row in store
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.col-md-3 {
  max-width: 40%;
}
</style>
