<template>
  <page-section :section-title="$t('pageNetwork.ipv4')">
    <b-row>
      <b-col>
        <h3 class="h5">
          {{ $t('pageNetwork.ipv4Addresses') }}
        </h3>
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
      <template #cell(actions)="{ item }">
        <table-row-action
          v-for="(action, actionIndex) in item.actions"
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
import IconEdit from '@carbon/icons-vue/es/edit/20';
import IconTrashcan from '@carbon/icons-vue/es/trash-can/20';
import PageSection from '@/components/Global/PageSection';
import TableRowAction from '@/components/Global/TableRowAction';
import { mapState } from 'vuex';

export default {
  name: 'Ipv4Table',
  components: {
    IconEdit,
    IconTrashcan,
    PageSection,
    TableRowAction,
  },
  mixins: [BVToastMixin],
  props: {
    tabIndex: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      form: {
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
        {
          key: 'AddressOrigin',
          label: this.$t('pageNetwork.table.addressOrigin'),
        },
        { key: 'actions', label: '', tdClass: 'text-right' },
      ],
    };
  },
  computed: {
    ...mapState('network', ['ethernetData']),
  },
  watch: {
    // Watch for change in tab index
    tabIndex() {
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
  },
};
</script>
