<template>
  <b-container fluid>
    <page-title />
    <b-row>
      <b-col xl="9" class="text-right">
        <b-button
          variant="primary"
          :disabled="certificatesForUpload.length === 0"
          @click="initUploadCertificateModal(null)"
        >
          {{ $t('pageSslCertificates.addNewCertificate') }}
          <icon-add />
        </b-button>
      </b-col>
    </b-row>
    <b-row>
      <b-col xl="9">
        <b-table :fields="fields" :items="tableItems">
          <template v-slot:cell(validFrom)="{ value }">
            {{ value | formatDate }}
          </template>

          <template v-slot:cell(validUntil)="{ value }">
            {{ value | formatDate }}
          </template>

          <template v-slot:cell(actions)="{ value, item }">
            <table-row-action
              v-for="(action, index) in value"
              :key="index"
              :value="action.value"
              :title="action.title"
              :enabled="action.enabled"
              @click:tableAction="onTableRowAction($event, item)"
            >
              <template v-slot:icon>
                <icon-replace v-if="action.value === 'replace'" />
                <icon-trashcan v-if="action.value === 'delete'" />
              </template>
            </table-row-action>
          </template>
        </b-table>
      </b-col>
    </b-row>

    <!-- Modals -->
    <modal-upload-certificate
      :certificate="modalCertificate"
      @ok="uploadCertificate"
    />
  </b-container>
</template>

<script>
import IconAdd from '@carbon/icons-vue/es/add--alt/20';
import IconReplace from '@carbon/icons-vue/es/renew/20';
import IconTrashcan from '@carbon/icons-vue/es/trash-can/20';

import ModalUploadCertificate from './ModalUploadCertificate';
import PageTitle from '../../../components/Global/PageTitle';
import TableRowAction from '../../../components/Global/TableRowAction';

import BVToastMixin from '../../../components/Mixins/BVToastMixin';

export default {
  name: 'SslCertificates',
  components: {
    IconAdd,
    IconReplace,
    IconTrashcan,
    ModalUploadCertificate,
    PageTitle,
    TableRowAction
  },
  mixins: [BVToastMixin],
  data() {
    return {
      modalCertificate: null,
      fields: [
        {
          key: 'certificate',
          label: this.$t('pageSslCertificates.table.certificate')
        },
        {
          key: 'issuedBy',
          label: this.$t('pageSslCertificates.table.issuedBy')
        },
        {
          key: 'issuedTo',
          label: this.$t('pageSslCertificates.table.issuedTo')
        },
        {
          key: 'validFrom',
          label: this.$t('pageSslCertificates.table.validFrom')
        },
        {
          key: 'validUntil',
          label: this.$t('pageSslCertificates.table.validUntil')
        },
        {
          key: 'actions',
          label: '',
          tdClass: 'text-right'
        }
      ]
    };
  },
  computed: {
    certificates() {
      return this.$store.getters['sslCertificates/allCertificates'];
    },
    tableItems() {
      return this.certificates.map(certificate => {
        return {
          ...certificate,
          actions: [
            {
              value: 'replace',
              title: this.$t('pageSslCertificates.replaceCertificate')
            },
            {
              value: 'delete',
              title: this.$t('pageSslCertificates.deleteCertificate'),
              enabled:
                certificate.type === 'TrustStore Certificate' ? true : false
            }
          ]
        };
      });
    },
    certificatesForUpload() {
      return this.$store.getters['sslCertificates/availableUploadTypes'];
    }
  },
  created() {
    this.$store.dispatch('sslCertificates/getCertificates');
  },
  methods: {
    onTableRowAction(event, rowItem) {
      switch (event) {
        case 'replace':
          this.initUploadCertificateModal(rowItem);
          break;
        case 'delete':
          this.$bvModal
            .msgBoxConfirm(
              this.$t('pageSslCertificates.modal.deleteConfirmMessage', {
                issuedBy: rowItem.issuedBy,
                certificate: rowItem.certificate
              }),
              {
                title: this.$t('pageSslCertificates.deleteCertificate'),
                okTitle: this.$t('global.action.delete')
              }
            )
            .then(deleteConfirmed => {
              if (deleteConfirmed) this.deleteCertificate(rowItem);
            });
          break;
        default:
          break;
      }
    },
    initUploadCertificateModal(certificate = null) {
      this.modalCertificate = certificate;
      this.$bvModal.show('upload-certificate');
    },
    uploadCertificate({ addNew, file, type, location }) {
      if (addNew) {
        this.$store
          .dispatch('sslCertificates/addNewCertificate', { file, type })
          .then(success => this.successToast(success))
          .catch(({ message }) => this.errorToast(message));
      } else {
        const reader = new FileReader();
        reader.readAsBinaryString(file);
        reader.onloadend = event => {
          const certificateString = event.target.result;
          this.$store
            .dispatch('sslCertificates/replaceCertificate', {
              certificateString,
              type,
              location
            })
            .then(success => this.successToast(success))
            .catch(({ message }) => this.errorToast(message));
        };
      }
    },
    deleteCertificate({ type, location }) {
      this.$store
        .dispatch('sslCertificates/deleteCertificate', {
          type,
          location
        })
        .then(success => this.successToast(success))
        .catch(({ message }) => this.errorToast(message));
    }
  }
};
</script>
