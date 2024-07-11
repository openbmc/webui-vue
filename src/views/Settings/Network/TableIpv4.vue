<template>
  <page-section :section-title="$t('pageNetwork.ipv4')">
    <b-row class="mb-4">
      <b-col lg="2" md="6">
        <dl>
          <dt>{{ $t('pageNetwork.dhcp') }}</dt>
          <dd>
            <b-form-checkbox
              id="dhcpSwitch"
              v-model="dhcpEnabledState"
              data-test-id="networkSettings-switch-dhcpEnabled"
              switch
              @change="changeDhcpEnabledState"
            >
              <span v-if="dhcpEnabledState">
                {{ $t('global.status.enabled') }}
              </span>
              <span v-else>{{ $t('global.status.disabled') }}</span>
            </b-form-checkbox>
          </dd>
        </dl>
      </b-col>
    </b-row>
    <b-row>
      <b-col>
        <h3 class="h5">
          {{ $t('pageNetwork.ipv4Addresses') }}
        </h3>
      </b-col>
      <b-col class="text-right">
        <b-button variant="primary" @click="initAddIpv4Address()">
          <icon-add />
          {{ $t('pageNetwork.table.addIpv4Address') }}
        </b-button>
      </b-col>
    </b-row>
    <b-table
      responsive="md"
      hover
      :fields="ipv4TableFields"
      :items="form.ipv4TableItems"
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
          @click-table-action="onIpv4TableAction(action, $event, index)"
        >
          <template #icon>
            <icon-edit v-if="action.value === 'edit'" />
            <icon-trashcan v-if="action.value === 'delete'" />
          </template>
        </table-row-action>
      </template>
    </b-table>
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
import { mapState } from 'vuex';
import { useI18n } from 'vue-i18n';
import i18n from '@/i18n';

export default {
  name: 'Ipv4Table',
  components: {
    IconAdd,
    IconEdit,
    IconTrashcan,
    PageSection,
    TableRowAction,
  },
  mixins: [BVToastMixin, LoadingBarMixin],
  props: {
    tabIndex: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      $t: useI18n().t,
      form: {
        ipv4TableItems: [],
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
      ipv4TableFields: [
        {
          key: 'Address',
          label: i18n.global.t('pageNetwork.table.ipAddress'),
        },
        {
          key: 'Gateway',
          label: i18n.global.t('pageNetwork.table.gateway'),
        },
        {
          key: 'SubnetMask',
          label: i18n.global.t('pageNetwork.table.subnet'),
        },
        {
          key: 'AddressOrigin',
          label: i18n.global.t('pageNetwork.table.addressOrigin'),
        },
        { key: 'actions', label: '', tdClass: 'text-right' },
      ],
    };
  },
  computed: {
    ...mapState('network', ['ethernetData']),
    selectedInterface() {
      return this.$store.getters['network/selectedInterfaceIndex'];
    },
    dhcpEnabledState: {
      get() {
        return this.$store.getters['network/globalNetworkSettings'][
          this.selectedInterface
        ].dhcpEnabled;
      },
      set(newValue) {
        return newValue;
      },
    },
    filteredActions() {
      return (item) => {
        if (item.AddressOrigin === 'DHCP') {
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
      this.getIpv4TableItems();
    },
    ethernetData() {
      this.getIpv4TableItems();
    },
  },
  created() {
    this.getIpv4TableItems();
    this.$store.dispatch('network/getEthernetData').finally(() => {
      // Emit initial data fetch complete to parent component
      this.$root.$emit('network-table-ipv4-complete');
    });
  },
  methods: {
    getIpv4TableItems() {
      const index = this.tabIndex;
      const addresses = this.ethernetData[index].IPv4Addresses || [];
      this.form.ipv4TableItems = addresses.map((ipv4) => {
        return {
          Address: ipv4.Address,
          SubnetMask: ipv4.SubnetMask,
          Gateway: ipv4.Gateway,
          AddressOrigin: ipv4.AddressOrigin,
          actions: [
            {
              value: 'delete',
              title: i18n.global.t('pageNetwork.table.deleteIpv4'),
            },
          ],
        };
      });
    },
    onIpv4TableAction(action, $event, index) {
      if ($event === 'delete') {
        this.deleteIpv4TableRow(index);
      }
    },
    deleteIpv4TableRow(index) {
      this.form.ipv4TableItems.splice(index, 1);
      const newIpv4Array = this.form.ipv4TableItems.map((ipv4) => {
        const { Address, SubnetMask, Gateway } = ipv4;
        return {
          Address,
          SubnetMask,
          Gateway,
        };
      });
      this.$store
        .dispatch('network/editIpv4Address', newIpv4Array)
        .then((message) => this.successToast(message))
        .catch(({ message }) => this.errorToast(message));
    },
    initAddIpv4Address() {
      this.$bvModal.show('modal-add-ipv4');
    },
    changeDhcpEnabledState(state) {
      this.$bvModal
        .msgBoxConfirm(
          state
            ? i18n.global.t('pageNetwork.modal.confirmEnableDhcp')
            : i18n.global.t('pageNetwork.modal.confirmDisableDhcp'),
          {
            title: i18n.global.t('pageNetwork.modal.dhcpConfirmTitle', {
              dhcpState: state
                ? i18n.global.t('global.action.enable')
                : i18n.global.t('global.action.disable'),
            }),
            okTitle: state
              ? i18n.global.t('global.action.enable')
              : i18n.global.t('global.action.disable'),
            okVariant: 'danger',
            cancelTitle: i18n.global.t('global.action.cancel'),
            autoFocusButton: 'cancel',
          },
        )
        .then((dhcpEnableConfirmed) => {
          if (dhcpEnableConfirmed) {
            this.$store
              .dispatch('network/saveDhcpEnabledState', state)
              .then((message) => this.successToast(message))
              .catch(({ message }) => this.errorToast(message));
          } else {
            let onDhcpCancel = document.getElementById('dhcpSwitch');
            onDhcpCancel.checked = !state;
          }
        });
    },
  },
};
</script>
