<template>
  <b-container fluid="xl">
    <page-title :description="$t('pageNetworkSettings.pageDescription')" />
    <page-section :section-title="$t('pageNetworkSettings.interface')">
      <b-row>
        <b-col lg="3">
          <b-form-group
            label-for="interface-select"
            :label="$t('pageNetworkSettings.form.networkInterface')"
          >
            <b-form-select
              id="interface-select"
              v-model="selectedInterfaceIndex"
              :disabled="loading"
              data-test-id="networkSettings-select-interface"
              :options="interfaceSelectOptions"
              @change="selectInterface"
            >
            </b-form-select>
          </b-form-group>
        </b-col>
      </b-row>
    </page-section>
    <b-form novalidate @submit.prevent="submitForm">
      <b-form-group :disabled="loading">
        <page-section :section-title="$t('pageNetworkSettings.system')">
          <b-row>
            <b-col lg="3">
              <b-form-group
                :label="$t('pageNetworkSettings.form.defaultGateway')"
                label-for="default-gateway"
              >
                <b-form-input
                  id="default-gateway"
                  v-model.trim="form.gateway"
                  data-test-id="networkSettings-input-gateway"
                  type="text"
                  :state="getValidationState($v.form.gateway)"
                  @change="$v.form.gateway.$touch()"
                />
                <b-form-invalid-feedback role="alert">
                  <div v-if="!$v.form.gateway.required">
                    {{ $t('global.form.fieldRequired') }}
                  </div>
                  <div v-if="!$v.form.gateway.ipAddress">
                    {{ $t('global.form.invalidFormat') }}
                  </div>
                </b-form-invalid-feedback>
              </b-form-group>
            </b-col>
            <b-col lg="3">
              <b-form-group
                :label="$t('pageNetworkSettings.form.hostname')"
                label-for="hostname-field"
              >
                <b-form-input
                  id="hostname-field"
                  v-model.trim="form.hostname"
                  data-test-id="networkSettings-input-hostname"
                  type="text"
                  :state="getValidationState($v.form.hostname)"
                  @change="$v.form.hostname.$touch()"
                />
                <b-form-invalid-feedback role="alert">
                  <div v-if="!$v.form.hostname.required">
                    {{ $t('global.form.fieldRequired') }}
                  </div>
                  <div v-if="!$v.form.hostname.validateHostname">
                    {{
                      $t('global.form.lengthMustBeBetween', { min: 1, max: 64 })
                    }}
                  </div>
                </b-form-invalid-feedback>
              </b-form-group>
            </b-col>
            <b-col lg="3">
              <b-form-group
                :label="$t('pageNetworkSettings.form.macAddress')"
                label-for="mac-address"
              >
                <b-form-input
                  id="mac-address"
                  v-model.trim="form.macAddress"
                  data-test-id="networkSettings-input-macAddress"
                  type="text"
                  :state="getValidationState($v.form.macAddress)"
                  @change="$v.form.macAddress.$touch()"
                />
                <b-form-invalid-feedback role="alert">
                  <div v-if="!$v.form.macAddress.required">
                    {{ $t('global.form.fieldRequired') }}
                  </div>
                  <div v-if="!$v.form.macAddress.macAddress">
                    {{ $t('global.form.invalidFormat') }}
                  </div>
                </b-form-invalid-feedback>
              </b-form-group>
            </b-col>
          </b-row>
        </page-section>
        <page-section :section-title="$t('pageNetworkSettings.ipv4')">
          <b-form-group :label="$t('pageNetworkSettings.ipv4Configuration')">
            <b-form-text id="enable-secure-help-block">
              {{ $t('pageNetworkSettings.ipv4Helper') }}
            </b-form-text>
            <b-form-radio
              v-model="form.dhcpEnabled"
              name="dhcp-radio"
              :value="true"
              @change="onChangeIpv4Config"
            >
              {{ $t('pageNetworkSettings.dhcp') }}
            </b-form-radio>
            <b-form-radio
              v-model="form.dhcpEnabled"
              name="static-radio"
              :value="false"
              @change="onChangeIpv4Config"
            >
              {{ $t('pageNetworkSettings.static') }}
            </b-form-radio>
          </b-form-group>
          <b-row>
            <b-col lg="9" class="mb-3">
              <h3 class="h4">
                {{ $t('pageNetworkSettings.dhcp') }}
              </h3>
              <b-table
                responsive="md"
                hover
                :fields="ipv4DhcpTableFields"
                :items="form.ipv4DhcpTableItems"
                :empty-text="$t('global.table.emptyMessage')"
                class="mb-0"
                show-empty
              >
                <template #cell(Address)="{ item, index }">
                  <b-form-input
                    v-model.trim="item.Address"
                    :data-test-id="`networkSettings-input-dhcpIpv4-${index}`"
                    :aria-label="
                      $t('pageNetworkSettings.table.dhcpIpv4AddressRow') +
                      ' ' +
                      (index + 1)
                    "
                    readonly
                  />
                </template>
                <template #cell(SubnetMask)="{ item, index }">
                  <b-form-input
                    v-model.trim="item.SubnetMask"
                    :data-test-id="`networkSettings-input-subnetMask-${index}`"
                    :aria-label="
                      $t('pageNetworkSettings.table.dhcpIpv4SubnetRow') +
                      ' ' +
                      (index + 1)
                    "
                    readonly
                  />
                </template>
                <template #cell(actions)="{ item, index }">
                  <table-row-action
                    v-for="(action, actionIndex) in item.actions"
                    :key="actionIndex"
                    :value="action.value"
                    :title="action.title"
                    :enabled="false"
                    @click-table-action="
                      onDeleteIpv4StaticTableRow($event, index)
                    "
                  >
                    <template #icon>
                      <icon-trashcan v-if="action.value === 'delete'" />
                    </template>
                  </table-row-action>
                </template>
              </b-table>
            </b-col>
            <b-col lg="9" class="mb-3">
              <h3 class="h4">
                {{ $t('pageNetworkSettings.static') }}
              </h3>
              <b-table
                responsive="md"
                hover
                :fields="ipv4StaticTableFields"
                :items="form.ipv4StaticTableItems"
                :empty-text="$t('global.table.emptyMessage')"
                class="mb-0"
                show-empty
              >
                <template #cell(Address)="{ item, index }">
                  <b-form-input
                    v-model.trim="item.Address"
                    :data-test-id="`networkSettings-input-staticIpv4-${index}`"
                    :aria-label="
                      $t('pageNetworkSettings.table.staticIpv4AddressRow') +
                      ' ' +
                      (index + 1)
                    "
                    :state="
                      getValidationState(
                        $v.form.ipv4StaticTableItems.$each.$iter[index].Address
                      )
                    "
                    @change="
                      $v.form.ipv4StaticTableItems.$each.$iter[
                        index
                      ].Address.$touch()
                    "
                  />
                  <b-form-invalid-feedback role="alert">
                    <div
                      v-if="
                        !$v.form.ipv4StaticTableItems.$each.$iter[index].Address
                          .required
                      "
                    >
                      {{ $t('global.form.fieldRequired') }}
                    </div>
                    <div
                      v-if="
                        !$v.form.ipv4StaticTableItems.$each.$iter[index].Address
                          .ipAddress
                      "
                    >
                      {{ $t('global.form.invalidFormat') }}
                    </div>
                  </b-form-invalid-feedback>
                </template>
                <template #cell(SubnetMask)="{ item, index }">
                  <b-form-input
                    v-model.trim="item.SubnetMask"
                    :data-test-id="`networkSettings-input-subnetMask-${index}`"
                    :aria-label="
                      $t('pageNetworkSettings.table.staticIpv4SubnetRow') +
                      ' ' +
                      (index + 1)
                    "
                    :state="
                      getValidationState(
                        $v.form.ipv4StaticTableItems.$each.$iter[index]
                          .SubnetMask
                      )
                    "
                    @change="
                      $v.form.ipv4StaticTableItems.$each.$iter[
                        index
                      ].SubnetMask.$touch()
                    "
                  />
                  <b-form-invalid-feedback role="alert">
                    <div
                      v-if="
                        !$v.form.ipv4StaticTableItems.$each.$iter[index]
                          .SubnetMask.required
                      "
                    >
                      {{ $t('global.form.fieldRequired') }}
                    </div>
                    <div
                      v-if="
                        !$v.form.ipv4StaticTableItems.$each.$iter[index]
                          .SubnetMask.ipAddress
                      "
                    >
                      {{ $t('global.form.invalidFormat') }}
                    </div>
                  </b-form-invalid-feedback>
                </template>
                <template #cell(actions)="{ item, index }">
                  <table-row-action
                    v-for="(action, actionIndex) in item.actions"
                    :key="actionIndex"
                    :value="action.value"
                    :title="action.title"
                    @click-table-action="
                      onDeleteIpv4StaticTableRow($event, index)
                    "
                  >
                    <template #icon>
                      <icon-trashcan v-if="action.value === 'delete'" />
                    </template>
                  </table-row-action>
                </template>
              </b-table>
              <b-button variant="link" @click="addIpv4StaticTableRow">
                <icon-add />
                {{ $t('pageNetworkSettings.table.addStaticIpv4Address') }}
              </b-button>
            </b-col>
          </b-row>
        </page-section>
        <page-section :section-title="$t('pageNetworkSettings.staticDns')">
          <b-row>
            <b-col lg="4" class="mb-3">
              <b-table
                responsive
                hover
                :fields="dnsTableFields"
                :items="form.dnsStaticTableItems"
                :empty-text="$t('global.table.emptyMessage')"
                class="mb-0"
                show-empty
              >
                <template #cell(address)="{ item, index }">
                  <b-form-input
                    v-model.trim="item.address"
                    :data-test-id="`networkSettings-input-dnsAddress-${index}`"
                    :aria-label="
                      $t('pageNetworkSettings.table.staticDnsRow') +
                      ' ' +
                      (index + 1)
                    "
                    :state="
                      getValidationState(
                        $v.form.dnsStaticTableItems.$each.$iter[index].address
                      )
                    "
                    @change="
                      $v.form.dnsStaticTableItems.$each.$iter[
                        index
                      ].address.$touch()
                    "
                  />
                  <b-form-invalid-feedback role="alert">
                    <div
                      v-if="
                        !$v.form.dnsStaticTableItems.$each.$iter[index].address
                          .required
                      "
                    >
                      {{ $t('global.form.fieldRequired') }}
                    </div>
                    <div
                      v-if="
                        !$v.form.dnsStaticTableItems.$each.$iter[index].address
                          .ipAddress
                      "
                    >
                      {{ $t('global.form.invalidFormat') }}
                    </div>
                  </b-form-invalid-feedback>
                </template>
                <template #cell(actions)="{ item, index }">
                  <table-row-action
                    v-for="(action, actionIndex) in item.actions"
                    :key="actionIndex"
                    :value="action.value"
                    :title="action.title"
                    @click-table-action="onDeleteDnsTableRow($event, index)"
                  >
                    <template #icon>
                      <icon-trashcan v-if="action.value === 'delete'" />
                    </template>
                  </table-row-action>
                </template>
              </b-table>
              <b-button variant="link" @click="addDnsTableRow">
                <icon-add /> {{ $t('pageNetworkSettings.table.addDns') }}
              </b-button>
            </b-col>
          </b-row>
        </page-section>
        <b-button
          variant="primary"
          type="submit"
          data-test-id="networkSettings-button-saveNetworkSettings"
        >
          {{ $t('global.action.saveSettings') }}
        </b-button>
      </b-form-group>
    </b-form>
  </b-container>
</template>

<script>
import IconTrashcan from '@carbon/icons-vue/es/trash-can/20';
import IconAdd from '@carbon/icons-vue/es/add--alt/20';
import BVToastMixin from '@/components/Mixins/BVToastMixin';
import LoadingBarMixin, { loading } from '@/components/Mixins/LoadingBarMixin';
import PageSection from '@/components/Global/PageSection';
import PageTitle from '@/components/Global/PageTitle';
import TableRowAction from '@/components/Global/TableRowAction';
import VuelidateMixin from '@/components/Mixins/VuelidateMixin';
import { mapState } from 'vuex';
import {
  required,
  helpers,
  ipAddress,
  macAddress,
} from 'vuelidate/lib/validators';

// Hostname pattern
const validateHostname = helpers.regex('validateHostname', /^\S{0,64}$/);

export default {
  name: 'NetworkSettings',
  components: {
    PageTitle,
    PageSection,
    TableRowAction,
    IconTrashcan,
    IconAdd,
  },
  mixins: [BVToastMixin, VuelidateMixin, LoadingBarMixin],
  beforeRouteLeave(to, from, next) {
    this.hideLoader();
    next();
  },
  data() {
    return {
      ipv4DhcpTableFields: [
        {
          key: 'Address',
          label: this.$t('pageNetworkSettings.table.ipAddress'),
        },
        {
          key: 'SubnetMask',
          label: this.$t('pageNetworkSettings.table.subnet'),
        },
        { key: 'actions', label: '', tdClass: 'text-right' },
      ],
      ipv4StaticTableFields: [
        {
          key: 'Address',
          label: this.$t('pageNetworkSettings.table.ipAddress'),
        },
        {
          key: 'SubnetMask',
          label: this.$t('pageNetworkSettings.table.subnet'),
        },
        { key: 'actions', label: '', tdClass: 'text-right' },
      ],
      dnsTableFields: [
        {
          key: 'address',
          label: this.$t('pageNetworkSettings.table.ipAddress'),
        },
        { key: 'actions', label: '', tdClass: 'text-right' },
      ],
      selectedInterfaceIndex: 0,
      selectedInterface: {},
      form: {
        dhcpEnabled: null,
        gateway: '',
        hostname: '',
        macAddress: '',
        ipv4StaticTableItems: [],
        ipv4DhcpTableItems: [],
        dnsStaticTableItems: [],
      },
      loading,
    };
  },
  validations() {
    return {
      form: {
        gateway: { required, ipAddress },
        hostname: { required, validateHostname },
        ipv4StaticTableItems: {
          $each: {
            Address: {
              required,
              ipAddress,
            },
            SubnetMask: {
              required,
              ipAddress,
            },
          },
        },
        macAddress: { required, macAddress: macAddress() },
        dnsStaticTableItems: {
          $each: {
            address: {
              required,
              ipAddress,
            },
          },
        },
      },
    };
  },
  computed: {
    ...mapState('networkSettings', [
      'ethernetData',
      'interfaceOptions',
      'defaultGateway',
    ]),
    interfaceSelectOptions() {
      return this.interfaceOptions.map((option, index) => {
        return {
          text: option,
          value: index,
        };
      });
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
      .dispatch('networkSettings/getEthernetData')
      .finally(() => this.endLoader());
  },
  methods: {
    selectInterface() {
      this.selectedInterface = this.ethernetData[this.selectedInterfaceIndex];
      this.getIpv4DhcpTableItems();
      this.getIpv4StaticTableItems();
      this.getDnsStaticTableItems();
      this.getInterfaceSettings();
    },
    getInterfaceSettings() {
      this.form.gateway = this.defaultGateway;
      this.form.hostname = this.selectedInterface.HostName;
      this.form.macAddress = this.selectedInterface.MACAddress;
      this.form.dhcpEnabled = this.selectedInterface.DHCPv4.DHCPEnabled;
    },
    onChangeIpv4Config(value) {
      this.form.dhcpEnabled = value;
    },
    getDnsStaticTableItems() {
      const dns = this.selectedInterface.StaticNameServers || [];
      this.form.dnsStaticTableItems = dns.map((server) => {
        return {
          address: server,
          actions: [
            {
              value: 'delete',
              enabled: this.form.dhcpEnabled,
              title: this.$t('pageNetworkSettings.table.deleteDns'),
            },
          ],
        };
      });
    },
    addDnsTableRow() {
      this.$v.form.dnsStaticTableItems.$touch();
      this.form.dnsStaticTableItems.push({
        address: '',
        actions: [
          {
            value: 'delete',
            enabled: this.form.dhcpEnabled,
            title: this.$t('pageNetworkSettings.table.deleteDns'),
          },
        ],
      });
    },
    deleteDnsTableRow(index) {
      this.$v.form.dnsStaticTableItems.$touch();
      this.form.dnsStaticTableItems.splice(index, 1);
    },
    onDeleteDnsTableRow(action, row) {
      this.deleteDnsTableRow(row);
    },
    getIpv4DhcpTableItems() {
      const addresses = this.selectedInterface.IPv4Addresses || [];
      this.form.ipv4DhcpTableItems = addresses
        .filter((ipv4) => ipv4.AddressOrigin === 'DHCP')
        .map((ipv4) => {
          return {
            Address: ipv4.Address,
            SubnetMask: ipv4.SubnetMask,
            actions: [
              {
                value: 'delete',
                enabled: false,
                title: this.$t('pageNetworkSettings.table.deleteDhcpIpv4'),
              },
            ],
          };
        });
    },
    getIpv4StaticTableItems() {
      const addresses = this.selectedInterface.IPv4StaticAddresses || [];
      this.form.ipv4StaticTableItems = addresses.map((ipv4) => {
        return {
          Address: ipv4.Address,
          SubnetMask: ipv4.SubnetMask,
          actions: [
            {
              value: 'delete',
              enabled: this.form.dhcpEnabled,
              title: this.$t('pageNetworkSettings.table.deleteStaticIpv4'),
            },
          ],
        };
      });
    },
    addIpv4StaticTableRow() {
      this.$v.form.ipv4StaticTableItems.$touch();
      this.form.ipv4StaticTableItems.push({
        Address: '',
        SubnetMask: '',
        actions: [
          {
            value: 'delete',
            enabled: this.form.dhcpEnabled,
            title: this.$t('pageNetworkSettings.table.deleteStaticIpv4'),
          },
        ],
      });
    },
    deleteIpv4StaticTableRow(index) {
      this.$v.form.ipv4StaticTableItems.$touch();
      this.form.ipv4StaticTableItems.splice(index, 1);
    },
    onDeleteIpv4StaticTableRow(action, row) {
      this.deleteIpv4StaticTableRow(row);
    },
    submitForm() {
      this.$v.$touch();
      if (this.$v.$invalid) return;
      this.startLoader();
      let networkInterfaceSelected = this.selectedInterface;
      let selectedInterfaceIndex = this.selectedInterfaceIndex;
      let interfaceId = networkInterfaceSelected.Id;
      let isDhcpEnabled = this.form.dhcpEnabled;
      let macAddress = this.form.macAddress;
      let hostname = this.form.hostname;
      let networkSettingsForm = {
        interfaceId,
        hostname,
        macAddress,
        selectedInterfaceIndex,
      };
      // Enabling DHCP without any available IP addresses will bring network down
      if (this.form.ipv4DhcpTableItems.length) {
        networkSettingsForm.isDhcpEnabled = isDhcpEnabled;
      } else {
        networkSettingsForm.isDhcpEnabled = false;
        this.errorToast(
          this.$t('pageNetworkSettings.toast.errorSaveDhcpSettings')
        );
      }
      networkSettingsForm.staticIpv4 = this.form.ipv4StaticTableItems.map(
        (updateIpv4) => {
          delete updateIpv4.actions;
          updateIpv4.Gateway = this.form.gateway;
          return updateIpv4;
        }
      );
      networkSettingsForm.staticNameServers = this.form.dnsStaticTableItems.map(
        (updateDns) => {
          return updateDns.address;
        }
      );
      this.$store
        .dispatch(
          'networkSettings/updateInterfaceSettings',
          networkSettingsForm
        )
        .then((success) => {
          this.successToast(success);
        })
        .catch(({ message }) => this.errorToast(message))
        .finally(() => {
          this.$v.form.$reset();
          this.endLoader();
        });
    },
  },
};
</script>
