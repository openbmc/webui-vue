<template>
  <page-section :section-title="$t('pageNetwork.ipv6')">
    <b-row class="mb-4">
      <b-col lg="2" md="6">
        <dl>
          <dt>{{ $t('pageNetwork.dhcp6') }}</dt>
          <dd>
            <b-form-checkbox
              id="dhcp6Switch"
              v-model="dhcp6EnabledState"
              data-test-id="networkSettings-switch-dhcp6Enabled"
              switch
              @change="changeDhcp6EnabledState"
            >
              <span v-if="dhcp6EnabledState">
                {{ $t('global.status.enabled') }}
              </span>
              <span v-else>{{ $t('global.status.disabled') }}</span>
            </b-form-checkbox>
          </dd>
        </dl>
      </b-col>
      <b-col lg="2" md="6">
        <dl class="text-nowrap">
          <dt>
            {{ $t('pageNetwork.ipv6DefaultGateway') }}
            <b-button
              v-if="defaultGatewayEditable"
              variant="link"
              class="p-1"
              @click="initDefaultGatewayModal()"
            >
              <icon-edit
                :title="$t('pageNetwork.modal.editIPv6DefaultGatewayTitle')"
              />
            </b-button>
          </dt>
          <dd>
            {{ dataFormatter(defaultGateway) }}
          </dd>
        </dl>
      </b-col>
    </b-row>
    <b-row>
      <b-col>
        <h3 class="h5">
          {{ $t('pageNetwork.ipv6Addresses') }}
        </h3>
      </b-col>
      <b-col class="text-end">
        <b-button variant="primary" @click="initAddIpv6Address()">
          <icon-add />
          {{ $t('pageNetwork.table.addIpv6Address') }}
        </b-button>
      </b-col>
    </b-row>
    <b-table
      responsive="md"
      hover
      thead-class="table-light"
      :fields="ipv6TableFields"
      :items="form.ipv6TableItems"
      :empty-text="$t('global.table.emptyMessage')"
      class="mb-0"
      show-empty
    >
      <template #cell(actions)="{ item, index }">
        <table-row-action
          v-for="(action, actionIndex) in filteredActions(item)"
          :key="actionIndex"
          :value="action.value"
          :title="action.title"
          :enabled="action.enabled"
          @click-table-action="onIpv6TableAction(action, $event, index)"
        >
          <template #icon>
            <icon-edit v-if="action.value === 'edit'" />
            <icon-trashcan v-if="action.value === 'delete'" />
          </template>
        </table-row-action>
      </template>
    </b-table>
    <modal-ipv6 v-model="showAddIpv6" />
  </page-section>
</template>

<script>
import BVToastMixin from '@/components/Mixins/BVToastMixin';
import IconAdd from '@carbon/icons-vue/es/add--alt/20';
import IconEdit from '@carbon/icons-vue/es/edit/20';
import IconTrashcan from '@carbon/icons-vue/es/trash-can/20';
import LoadingBarMixin from '@/components/Mixins/LoadingBarMixin';
import PageSection from '@/components/Global/PageSection';
import TableRowAction from '@/components/Global/TableRowAction';
import DataFormatterMixin from '@/components/Mixins/DataFormatterMixin';
import ModalIpv6 from './ModalIpv6.vue';
import { mapState } from 'vuex';
import i18n from '@/i18n';
import { useI18n } from 'vue-i18n';
import { useModal } from 'bootstrap-vue-next';

export default {
  name: 'Ipv6Table',
  components: {
    IconAdd,
    IconEdit,
    IconTrashcan,
    PageSection,
    TableRowAction,
    ModalIpv6,
  },
  mixins: [BVToastMixin, LoadingBarMixin, DataFormatterMixin],
  props: {
    tabIndex: {
      type: Number,
      default: 0,
    },
  },
  setup() {
    const bvModal = useModal();
    return { bvModal };
  },
  data() {
    return {
      $t: useI18n().t,
      showAddIpv6: false,
      showDefaultGatewayModal: false,
      form: {
        ipv6TableItems: [],
      },
      actions: [
        {
          value: 'edit',
          title: i18n.global.t('global.action.edit'),
        },
        {
          value: 'delete',
          title: i18n.global.t('global.action.delete'),
        },
      ],
      ipv6TableFields: [
        {
          key: 'Address',
          label: i18n.global.t('pageNetwork.table.ipAddress'),
        },
        {
          key: 'PrefixLength',
          label: i18n.global.t('pageNetwork.table.prefixLength'),
        },
        {
          key: 'AddressOrigin',
          label: i18n.global.t('pageNetwork.table.addressOrigin'),
        },
        { key: 'actions', label: '', tdClass: 'text-end' },
      ],
      defaultGateway: '',
      defaultGatewayEditable:
        process.env.VUE_APP_ENV_NAME !== 'nvidia-bluefield',
    };
  },
  computed: {
    ...mapState('network', ['ethernetData']),
    selectedInterface() {
      return this.$store.getters['network/selectedInterfaceIndex'];
    },
    dhcp6EnabledState: {
      get() {
        return (
          this.$store.getters['network/globalNetworkSettings'][
            this.selectedInterface
          ].dhcp6Enabled === 'Enabled'
        );
      },
      set(newValue) {
        return newValue;
      },
    },
    filteredActions() {
      return (item) => {
        if (item.AddressOrigin === 'DHCPv6' || item.AddressOrigin === 'SLAAC') {
          return item.actions.filter((action) => action.value !== 'delete');
        } else {
          return item.actions;
        }
      };
    },
  },
  watch: {
    // Watch for change in tab index
    tabIndex() {
      this.getIpv6TableItems();
      this.getDefaultGateway();
    },
    ethernetData() {
      this.getIpv6TableItems();
      this.getDefaultGateway();
    },
  },
  created() {
    this.getIpv6TableItems();
    this.getDefaultGateway();
    this.$store.dispatch('network/getEthernetData').finally(() => {
      // Emit initial data fetch complete to parent component
      require('@/eventBus').default.$emit('network-table-ipv6-complete');
    });
  },
  methods: {
    getDefaultGateway() {
      this.defaultGateway = this.ethernetData[this.tabIndex].IPv6DefaultGateway;
    },
    getIpv6TableItems() {
      const index = this.tabIndex;
      const addresses =
        this.ethernetData[index].IPv6Addresses.filter(
          (ipv6) =>
            ipv6.AddressOrigin === 'LinkLocal' ||
            ipv6.AddressOrigin === 'Static' ||
            ipv6.AddressOrigin === 'SLAAC' ||
            ipv6.AddressOrigin === 'DHCPv6',
        ) || [];
      this.form.ipv6TableItems = addresses.map((ipv6) => {
        return {
          Address: ipv6.Address,
          PrefixLength: ipv6.PrefixLength,
          AddressOrigin: ipv6.AddressOrigin,
          actions: [
            {
              value: 'delete',
              title: i18n.global.t('pageNetwork.table.deleteIpv6'),
            },
          ],
        };
      });
    },
    onIpv6TableAction(action, $event, index) {
      if ($event === 'delete') {
        this.deleteIpv6TableRow(index);
      }
    },
    deleteIpv6TableRow(index) {
      const AddressOrigin = this.form.ipv6TableItems[index].AddressOrigin;
      this.form.ipv6TableItems.splice(index, 1);
      const newIpv6Array = this.form.ipv6TableItems.map((ipv6) => {
        const { Address, PrefixLength } = ipv6;
        return {
          Address,
          PrefixLength,
        };
      });
      if (
        newIpv6Array.length == 0 &&
        (AddressOrigin === 'Static' || AddressOrigin === 'LinkLocal')
      ) {
        this.$store
          .dispatch('network/saveDhcp6EnabledState', true)
          .then((message) => this.successToast(message))
          .catch(({ message }) => this.errorToast(message));
      }
      this.$store
        .dispatch('network/editIpv6Address', newIpv6Array)
        .then((message) => this.successToast(message))
        .catch(({ message }) => this.errorToast(message));
    },
    initAddIpv6Address() {
      this.showAddIpv6 = true;
    },
    changeDhcp6EnabledState(state) {
      const dhcpState = state
        ? i18n.global.t('global.action.enable')
        : i18n.global.t('global.action.disable');
      this.confirmDialog(
        state
          ? i18n.global.t('pageNetwork.modal.confirmEnableDhcp')
          : i18n.global.t('pageNetwork.modal.confirmDisableDhcp'),
        {
          title: i18n.global.t('pageNetwork.modal.dhcpConfirmTitle', {
            dhcpState,
          }),
          okTitle: dhcpState,
          okVariant: 'danger',
          cancelTitle: i18n.global.t('global.action.cancel'),
          autoFocusButton: 'cancel',
        },
      ).then((dhcpEnableConfirmed) => {
        if (dhcpEnableConfirmed) {
          this.$store
            .dispatch('network/saveDhcp6EnabledState', state)
            .then((message) => this.successToast(message))
            .catch(({ message }) => this.errorToast(message));
        } else {
          let onDhcpCancel = document.getElementById('dhcp6Switch');
          onDhcpCancel.checked = !state;
        }
      });
    },
    confirmDialog(message, options = {}) {
      return this.$confirm({ message, ...options });
    },
    initDefaultGatewayModal() {
      this.showDefaultGatewayModal = true;
    },
  },
};
</script>
