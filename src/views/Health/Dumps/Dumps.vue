<template>
  <b-container fluid="xl">
    <page-title />
    <b-row class="mb-5">
      <b-col sm="6">
        <dumps-form />
      </b-col>
    </b-row>
    <b-row>
      <b-col>
        <page-section :section-title="$t('pageDumps.dumpsHistory')">
          <b-table
            show-empty
            hover
            sort-icon-left
            no-sort-reset
            responsive="md"
            sort-by="dateTime"
            :fields="fields"
            :items="tableItems"
            :empty-text="$t('global.table.emptyMessage')"
          >
            <!-- Date and Time column -->
            <template #cell(dateTime)="{ value }">
              <p class="mb-0">{{ value | formatDate }}</p>
              <p class="mb-0">{{ value | formatTime }}</p>
            </template>

            <!-- Actions column -->
            <template #cell(actions)="row">
              <table-row-action
                v-for="(action, index) in row.item.actions"
                :key="index"
                :value="action.value"
                :title="action.title"
                @click-table-action="onTableRowAction($event, row.item)"
              >
                <template #icon>
                  <icon-download v-if="action.value === 'download'" />
                  <icon-delete v-if="action.value === 'delete'" />
                </template>
              </table-row-action>
            </template>
          </b-table>
        </page-section>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import IconDelete from '@carbon/icons-vue/es/trash-can/20';
import IconDownload from '@carbon/icons-vue/es/document--export/20';

import DumpsForm from './DumpsForm';
import PageTitle from '@/components/Global/PageTitle';
import PageSection from '@/components/Global/PageSection';
import TableRowAction from '@/components/Global/TableRowAction';

export default {
  components: {
    DumpsForm,
    IconDelete,
    IconDownload,
    PageSection,
    PageTitle,
    TableRowAction,
  },
  data() {
    return {
      fields: [
        {
          key: 'dateTime',
          label: this.$t('pageDumps.table.dateAndTime'),
          sortable: true,
        },
        {
          key: 'dumpType',
          label: this.$t('pageDumps.table.dumpType'),
          sortable: false,
        },
        {
          key: 'id',
          label: this.$t('pageDumps.table.id'),
          sortable: false,
        },
        {
          key: 'size',
          label: this.$t('pageDumps.table.size'),
          sortable: false,
        },
        {
          key: 'actions',
          sortable: false,
          label: '',
          tdClass: 'text-right text-nowrap',
        },
      ],
    };
  },
  computed: {
    dumps() {
      return this.$store.getters['dumps/allDumps'];
    },
    tableItems() {
      return this.dumps.map((item) => {
        return {
          ...item,
          actions: [
            {
              value: 'download',
              title: this.$t('global.action.download'),
            },
            {
              value: 'delete',
              title: this.$t('global.action.delete'),
            },
          ],
        };
      });
    },
  },
  methods: {
    onTableRowAction(action, { id }) {
      if (action === 'delete') {
        this.$bvModal
          .msgBoxConfirm(
            this.$t('pageDumps.modal.deleteDumpConfirmation', { id }),
            {
              title: this.$t('pageDumps.modal.deleteDump'),
              okTitle: this.$t('pageDumps.modal.deleteDump'),
              okVariant: 'danger',
            }
          )
          .then((deleteConfrimed) => {
            if (deleteConfrimed); // delete dump
          });
      }
    },
  },
};
</script>
