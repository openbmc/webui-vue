<template>
  <page-section :section-title="$t('pageNetwork.staticDns')">
    <b-row>
      <b-col lg="6">
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
</template>

<script>
import BVToastMixin from '@/components/Mixins/BVToastMixin';
import IconEdit from '@carbon/icons-vue/es/edit/20';
import IconTrashcan from '@carbon/icons-vue/es/trash-can/20';
import PageSection from '@/components/Global/PageSection';
import TableRowAction from '@/components/Global/TableRowAction';
import { mapState } from 'vuex';

export default {
  name: 'DNSTable',
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
        dnsStaticTableItems: [],
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
    };
  },
  computed: {
    ...mapState('network', ['ethernetData']),
  },
  created() {
    this.getStaticDnsItems();
    this.$store.dispatch('network/getEthernetData').finally(() => {
      // Emit initial data fetch complete to parent component
      this.$root.$emit('network-table-dns-complete');
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
