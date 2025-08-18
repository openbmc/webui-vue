<template>
  <page-section :section-title="$t('pageNetwork.staticDns')">
    <b-row>
      <b-col lg="6">
        <div class="text-end">
          <b-button variant="primary" @click="initDnsModal()">
            <icon-add />
            {{ $t('pageNetwork.table.addDnsAddress') }}
          </b-button>
        </div>
        <b-table
          responsive="md"
          hover
          thead-class="table-light"
          :fields="dnsTableFields"
          :items="form.dnsStaticTableItems"
          :empty-text="$t('global.table.emptyMessage')"
          class="mb-0"
          show-empty
        >
          <template #cell(actions)="{ item, index }">
            <table-row-action
              v-for="(action, actionIndex) in item.actions"
              :key="actionIndex"
              :value="action.value"
              :title="action.title"
              :enabled="action.enabled"
              @click-table-action="onDnsTableAction(action, $event, index)"
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
  <modal-dns v-model="showDnsModal" @ok="saveDnsAddress" />
</template>

<script>
import BVToastMixin from '@/components/Mixins/BVToastMixin';
import LoadingBarMixin from '@/components/Mixins/LoadingBarMixin';
import IconAdd from '@carbon/icons-vue/es/add--alt/20';
import IconEdit from '@carbon/icons-vue/es/edit/20';
import IconTrashcan from '@carbon/icons-vue/es/trash-can/20';
import PageSection from '@/components/Global/PageSection';
import TableRowAction from '@/components/Global/TableRowAction';
import ModalDns from './ModalDns.vue';
import { mapState } from 'vuex';
import i18n from '@/i18n';
import { useModal } from 'bootstrap-vue-next';

export default {
  name: 'DNSTable',
  components: {
    IconAdd,
    IconEdit,
    IconTrashcan,
    PageSection,
    TableRowAction,
    ModalDns,
  },
  mixins: [BVToastMixin, LoadingBarMixin],
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
      form: {
        dnsStaticTableItems: [],
      },
      showDnsModal: false,
      actions: [
        {
          value: 'edit',
          title: 'global.action.edit',
        },
        {
          value: 'delete',
          title: 'global.action.delete',
        },
      ],
      dnsTableFields: [
        {
          key: 'address',
          label: i18n.global.t('pageNetwork.table.ipAddress'),
        },
        { key: 'actions', label: '', tdClass: 'text-end' },
      ],
    };
  },
  computed: {
    ...mapState('network', ['ethernetData']),
  },
  watch: {
    // Watch for change in tab index
    tabIndex() {
      this.getStaticDnsItems();
    },
    ethernetData() {
      this.getStaticDnsItems();
    },
  },
  created() {
    this.getStaticDnsItems();
    this.$store.dispatch('network/getEthernetData').finally(() => {
      // Emit initial data fetch complete to parent component
      require('@/eventBus').default.$emit('network-table-dns-complete');
    });
  },
  methods: {
    getStaticDnsItems() {
      const index = this.tabIndex;
      const dns = this.ethernetData[index].StaticNameServers || [];
      this.form.dnsStaticTableItems = dns.map((server) => {
        return {
          address: server,
          actions: [
            {
              value: 'delete',
              title: 'pageNetwork.table.deleteDns',
            },
          ],
        };
      });
    },
    onDnsTableAction(action, $event, index) {
      if ($event === 'delete') {
        this.deleteDnsTableRow(index);
      }
    },
    deleteDnsTableRow(index) {
      this.form.dnsStaticTableItems.splice(index, 1);
      const newDnsArray = this.form.dnsStaticTableItems.map((dns) => {
        return dns.address;
      });
      this.$store
        .dispatch('network/editDnsAddress', newDnsArray)
        .then((message) => this.successToast(message))
        .catch(({ message }) => this.errorToast(message));
    },
    initDnsModal() {
      this.showDnsModal = true;
    },
    saveDnsAddress(modalFormData) {
      this.startLoader();
      this.$store
        .dispatch('network/saveDnsAddress', modalFormData)
        .then((message) => this.successToast(message))
        .catch(({ message }) => this.errorToast(message))
        .finally(() => this.endLoader());
    },
  },
};
</script>
