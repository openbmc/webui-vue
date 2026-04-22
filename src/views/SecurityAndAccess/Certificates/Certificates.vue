<template>
  <b-container fluid="xl">
    <page-title />
    <b-row>
      <b-col xl="11">
        <!-- Expired certificates banner -->
        <alert :show="expiredCertificateTypes.length > 0" variant="danger">
          <template v-if="expiredCertificateTypes.length > 1">
            {{ $t('pageCertificates.alert.certificatesExpiredMessage') }}
          </template>
          <template v-else>
            {{
              $t('pageCertificates.alert.certificateExpiredMessage', {
                certificate: expiredCertificateTypes[0],
              })
            }}
          </template>
        </alert>
        <!-- Expiring certificates banner -->
        <alert :show="expiringCertificateTypes.length > 0" variant="warning">
          <template v-if="expiringCertificateTypes.length > 1">
            {{ $t('pageCertificates.alert.certificatesExpiringMessage') }}
          </template>
          <template v-else>
            {{
              $t('pageCertificates.alert.certificateExpiringMessage', {
                certificate: expiringCertificateTypes[0],
              })
            }}
          </template>
        </alert>
      </b-col>
    </b-row>
    <b-row>
      <b-col xl="11" class="text-end">
        <b-button
          data-test-id="certificates-button-generateCsr"
          variant="link"
          @click="showCsr = true"
        >
          <icon-add />
          {{ $t('pageCertificates.generateCsr') }}
        </b-button>
        <b-button
          variant="primary"
          :disabled="certificatesForUpload.length === 0"
          @click="initModalUploadCertificate(null)"
        >
          <icon-add />
          {{ $t('pageCertificates.addNewCertificate') }}
        </b-button>
      </b-col>
    </b-row>
    <b-row>
      <b-col xl="11">
        <b-table
          responsive="md"
          show-empty
          hover
          thead-class="table-light"
          :busy="isBusy"
          :fields="fields"
          :items="tableItems"
          :empty-text="$t('global.table.emptyMessage')"
        >
          <!-- Expand chevron icon -->
          <template #cell(expandRow)="row">
            <b-button
              variant="link"
              data-test-id="certificates-button-expandRow"
              :aria-label="expandLabel(row)"
              :title="expandLabel(row)"
              class="btn-icon-only"
              :class="{ collapsed: !row.detailsShowing }"
              @click="toggleRowDetails(row)"
            >
              <icon-chevron />
              <span class="visually-hidden">{{ expandLabel(row) }}</span>
            </b-button>
          </template>

          <template #row-details="{ item }">
            <b-container fluid>
              <b-row>
                <b-col sm="6">
                  <!-- Certificate Details Section -->
                  <h6 class="mt-0 mb-2 fw-bold">{{ $t('pageCertificates.certificateDetails') }}</h6>
                  <dl v-if="item.version != null" class="d-flex mb-2">
                    <dt class="me-2">{{ $t('pageCertificates.table.certificateVersion') }}:</dt>
                    <dd class="mb-0">v{{ item.version }}</dd>
                  </dl>
                  <dl v-if="item.serialNumber" class="d-flex mb-2">
                    <dt class="me-2">{{ $t('pageCertificates.table.serialNumber') }}:</dt>
                    <dd class="mb-0">{{ formatSerialNumber(item.serialNumber) }}</dd>
                  </dl>
                  <dl v-if="item.signatureAlgorithm" class="d-flex mb-2">
                    <dt class="me-2">{{ $t('pageCertificates.table.signatureAlgorithm') }}:</dt>
                    <dd class="mb-0">{{ item.signatureAlgorithm }}</dd>
                  </dl>
                  <dl v-if="item.keyUsage && item.keyUsage.length > 0" class="d-flex mb-2">
                    <dt class="me-2">{{ $t('pageCertificates.table.keyUsage') }}:</dt>
                    <dd class="mb-0">{{ item.keyUsage.join(', ') }}</dd>
                  </dl>
                  <!-- Issuer Information Section -->
                  <template v-if="item.issuer.commonName || item.issuer.organization || item.issuer.organizationalUnit || item.issuer.city || item.issuer.state || item.issuer.country || item.issuer.email">
                    <h6 class="mt-3 mb-2 fw-bold">{{ $t('pageCertificates.table.issuerInformation') }}</h6>
                    <dl v-if="item.issuer.commonName" class="d-flex mb-2">
                      <dt class="me-2">{{ $t('pageCertificates.table.issuerCommonName') }}:</dt>
                      <dd class="mb-0">{{ item.issuer.commonName }}</dd>
                    </dl>
                    <dl v-if="item.issuer.organization" class="d-flex mb-2">
                      <dt class="me-2">{{ $t('pageCertificates.table.issuerOrganization') }}:</dt>
                      <dd class="mb-0">{{ item.issuer.organization }}</dd>
                    </dl>
                    <dl v-if="item.issuer.organizationalUnit" class="d-flex mb-2">
                      <dt class="me-2">{{ $t('pageCertificates.table.issuerOrganizationUnit') }}:</dt>
                      <dd class="mb-0">{{ item.issuer.organizationalUnit }}</dd>
                    </dl>
                    <dl v-if="item.issuer.city" class="d-flex mb-2">
                      <dt class="me-2">{{ $t('pageCertificates.table.issuerCity') }}:</dt>
                      <dd class="mb-0">{{ item.issuer.city }}</dd>
                    </dl>
                    <dl v-if="item.issuer.state" class="d-flex mb-2">
                      <dt class="me-2">{{ $t('pageCertificates.table.issuerState') }}:</dt>
                      <dd class="mb-0">{{ item.issuer.state }}</dd>
                    </dl>
                    <dl v-if="item.issuer.country" class="d-flex mb-2">
                      <dt class="me-2">{{ $t('pageCertificates.table.issuerCountry') }}:</dt>
                      <dd class="mb-0">{{ item.issuer.country }}</dd>
                    </dl>
                    <dl v-if="item.issuer.email" class="d-flex mb-2">
                      <dt class="me-2">{{ $t('pageCertificates.table.issuerEmail') }}:</dt>
                      <dd class="mb-0">{{ item.issuer.email }}</dd>
                    </dl>
                  </template>
                </b-col>
                <b-col sm="6">
                  <!-- Validity Period Section -->
                  <h6 class="mt-0 mb-2 fw-bold">{{ $t('pageCertificates.validityPeriod') }}</h6>
                  <dl v-if="item.validFrom" class="d-flex mb-2">
                    <dt class="me-2">{{ $t('pageCertificates.table.validFrom') }}:</dt>
                    <dd class="mb-0">
                      {{ $filters.formatDate(item.validFrom) }}
                      {{ $filters.formatTime(item.validFrom) }}
                    </dd>
                  </dl>
                  <dl v-if="item.validUntil" class="d-flex mb-2">
                    <dt class="me-2">{{ $t('pageCertificates.table.validUntil') }}:</dt>
                    <dd class="mb-0">
                      {{ $filters.formatDate(item.validUntil) }}
                      {{ $filters.formatTime(item.validUntil) }}
                    </dd>
                  </dl>
                  <!-- Subject Information Section -->
                  <template v-if="item.subject.commonName || item.subject.organization || item.subject.organizationalUnit || item.subject.city || item.subject.state || item.subject.country || item.subject.email">
                    <h6 class="mt-3 mb-2 fw-bold">{{ $t('pageCertificates.table.subjectInformation') }}</h6>
                    <dl v-if="item.subject.commonName" class="d-flex mb-2">
                      <dt class="me-2">{{ $t('pageCertificates.table.issuedToCommonName') }}:</dt>
                      <dd class="mb-0">{{ item.subject.commonName }}</dd>
                    </dl>
                    <dl v-if="item.subject.organization" class="d-flex mb-2">
                      <dt class="me-2">{{ $t('pageCertificates.table.issuedToOrganization') }}:</dt>
                      <dd class="mb-0">{{ item.subject.organization }}</dd>
                    </dl>
                    <dl v-if="item.subject.organizationalUnit" class="d-flex mb-2">
                      <dt class="me-2">{{ $t('pageCertificates.table.issuedToOrganizationUnit') }}:</dt>
                      <dd class="mb-0">{{ item.subject.organizationalUnit }}</dd>
                    </dl>
                    <dl v-if="item.subject.city" class="d-flex mb-2">
                      <dt class="me-2">{{ $t('pageCertificates.table.issuedToCity') }}:</dt>
                      <dd class="mb-0">{{ item.subject.city }}</dd>
                    </dl>
                    <dl v-if="item.subject.state" class="d-flex mb-2">
                      <dt class="me-2">{{ $t('pageCertificates.table.issuedToState') }}:</dt>
                      <dd class="mb-0">{{ item.subject.state }}</dd>
                    </dl>
                    <dl v-if="item.subject.country" class="d-flex mb-2">
                      <dt class="me-2">{{ $t('pageCertificates.table.issuedToCountry') }}:</dt>
                      <dd class="mb-0">{{ item.subject.country }}</dd>
                    </dl>
                    <dl v-if="item.subject.email" class="d-flex mb-2">
                      <dt class="me-2">{{ $t('pageCertificates.table.issuedToEmail') }}:</dt>
                      <dd class="mb-0">{{ item.subject.email }}</dd>
                    </dl>
                  </template>
                </b-col>
              </b-row>
            </b-container>
          </template>

          <template #cell(validFrom)="{ value }">
            {{ $filters.formatDate(value) }}
          </template>

          <template #cell(validUntil)="{ value }">
            <status-icon
              v-if="getDaysUntilExpired(value) < 31"
              :status="getIconStatus(value)"
            />
            {{ $filters.formatDate(value) }}
          </template>

          <template #cell(actions)="{ value, item }">
            <table-row-action
              v-for="(action, index) in value"
              :key="index"
              :value="action.value"
              :title="action.title"
              :enabled="action.enabled"
              @click-table-action="onTableRowAction($event, item)"
            >
              <template #icon>
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
      v-model="showUpload"
      :certificate="modalCertificate"
      @ok="onModalOk"
    />
    <modal-generate-csr v-model="showCsr" />
  </b-container>
</template>

<script>
import IconAdd from '@carbon/icons-vue/es/add--alt/20';
import IconReplace from '@carbon/icons-vue/es/renew/20';
import IconTrashcan from '@carbon/icons-vue/es/trash-can/20';
import IconChevron from '@carbon/icons-vue/es/chevron--down/20';

import ModalGenerateCsr from './ModalGenerateCsr';
import ModalUploadCertificate from './ModalUploadCertificate';
import PageTitle from '@/components/Global/PageTitle';
import TableRowAction from '@/components/Global/TableRowAction';
import StatusIcon from '@/components/Global/StatusIcon';
import Alert from '@/components/Global/Alert';

import BVToastMixin from '@/components/Mixins/BVToastMixin';
import LoadingBarMixin from '@/components/Mixins/LoadingBarMixin';
import TableRowExpandMixin from '@/components/Mixins/TableRowExpandMixin';
import i18n from '@/i18n';
import { useModal } from 'bootstrap-vue-next';

export default {
  name: 'Certificates',
  components: {
    Alert,
    IconAdd,
    IconReplace,
    IconTrashcan,
    IconChevron,
    ModalGenerateCsr,
    ModalUploadCertificate,
    PageTitle,
    StatusIcon,
    TableRowAction,
  },
  mixins: [BVToastMixin, LoadingBarMixin, TableRowExpandMixin],
  beforeRouteLeave(to, from, next) {
    this.hideLoader();
    next();
  },
  setup() {
    const bvModal = useModal();
    return { bvModal };
  },
  data() {
    return {
      isBusy: true,
      modalCertificate: null,
      showUpload: false,
      showCsr: false,
      fileTypeCorrect: undefined,
      fields: [
        {
          key: 'expandRow',
          label: '',
          tdClass: 'table-row-expand',
        },
        {
          key: 'certificate',
          label: i18n.global.t('pageCertificates.table.certificate'),
        },
        {
          key: 'issuedBy',
          label: i18n.global.t('pageCertificates.table.issuedBy'),
        },
        {
          key: 'issuedTo',
          label: i18n.global.t('pageCertificates.table.issuedTo'),
        },
        {
          key: 'validFrom',
          label: i18n.global.t('pageCertificates.table.validFrom'),
        },
        {
          key: 'validUntil',
          label: i18n.global.t('pageCertificates.table.validUntil'),
        },
        {
          key: 'actions',
          label: '',
          tdClass: 'text-end text-nowrap',
        },
      ],
    };
  },
  computed: {
    certificates() {
      return this.$store.getters['certificates/allCertificates'];
    },
    tableItems() {
      return this.certificates.map((certificate) => {
        return {
          ...certificate,
          actions: [
            {
              value: 'replace',
              title: i18n.global.t('pageCertificates.replaceCertificate'),
            },
            {
              value: 'delete',
              title: i18n.global.t('pageCertificates.deleteCertificate'),
              enabled:
                certificate.type === 'TrustStore Certificate' ? true : false,
            },
          ],
        };
      });
    },
    certificatesForUpload() {
      return this.$store.getters['certificates/availableUploadTypes'];
    },
    bmcTime() {
      return this.$store.getters['global/bmcTime'];
    },
    expiredCertificateTypes() {
      return this.certificates.reduce((acc, val) => {
        const daysUntilExpired = this.getDaysUntilExpired(val.validUntil);
        if (daysUntilExpired < 1) {
          acc.push(val.certificate);
        }
        return acc;
      }, []);
    },
    expiringCertificateTypes() {
      return this.certificates.reduce((acc, val) => {
        const daysUntilExpired = this.getDaysUntilExpired(val.validUntil);
        if (daysUntilExpired < 31 && daysUntilExpired > 0) {
          acc.push(val.certificate);
        }
        return acc;
      }, []);
    },
  },
  async created() {
    this.startLoader();
    await this.$store.dispatch('global/getBmcTime');
    this.$store.dispatch('certificates/getCertificates').finally(() => {
      this.endLoader();
      this.isBusy = false;
    });
  },
  methods: {
    onTableRowAction(event, rowItem) {
      switch (event) {
        case 'replace':
          this.initModalUploadCertificate(rowItem);
          break;
        case 'delete':
          this.initModalDeleteCertificate(rowItem);
          break;
        default:
          break;
      }
    },
    initModalUploadCertificate(certificate = null) {
      this.modalCertificate = certificate;
      this.showUpload = true;
    },
    initModalDeleteCertificate(certificate) {
      this.confirmDialog(
        i18n.global.t('pageCertificates.modal.deleteConfirmMessage', {
          issuedBy: certificate.issuedBy,
          certificate: certificate.certificate,
        }),
        {
          title: i18n.global.t('pageCertificates.deleteCertificate'),
          okTitle: i18n.global.t('global.action.delete'),
          cancelTitle: i18n.global.t('global.action.cancel'),
          autoFocusButton: 'ok',
        },
      ).then((deleteConfirmed) => {
        if (deleteConfirmed) this.deleteCertificate(certificate);
      });
    },
    onModalOk({ addNew, file, type, location }) {
      if (addNew) {
        // Upload a new certificate
        this.fileTypeCorrect = this.getIsFileTypeCorrect(file);
        if (this.fileTypeCorrect) {
          this.addNewCertificate(file, type);
        } else {
          this.errorToast(
            i18n.global.t(
              'pageCertificates.alert.incorrectCertificateFileType',
            ),
            {
              title: i18n.global.t(
                'pageCertificates.toast.errorAddCertificate',
              ),
            },
          );
        }
      } else {
        // Replace an existing certificate
        this.replaceCertificate(file, type, location);
      }
    },
    addNewCertificate(file, type) {
      if (this.fileTypeCorrect === true) {
        this.startLoader();
        this.$store
          .dispatch('certificates/addNewCertificate', { file, type })
          .then((success) => this.successToast(success))
          .catch(({ message }) => this.errorToast(message))
          .finally(() => this.endLoader());
      }
    },
    replaceCertificate(file, type, location) {
      this.startLoader();
      const reader = new FileReader();
      reader.readAsBinaryString(file);
      reader.onloadend = (event) => {
        const certificateString = event.target.result;
        this.$store
          .dispatch('certificates/replaceCertificate', {
            certificateString,
            type,
            location,
          })
          .then((success) => this.successToast(success))
          .catch(({ message }) => this.errorToast(message))
          .finally(() => this.endLoader());
      };
    },
    deleteCertificate({ type, location }) {
      this.startLoader();
      this.$store
        .dispatch('certificates/deleteCertificate', {
          type,
          location,
        })
        .then((success) => this.successToast(success))
        .catch(({ message }) => this.errorToast(message))
        .finally(() => this.endLoader());
    },
    getDaysUntilExpired(date) {
      if (this.bmcTime) {
        const validUntilMs = date.getTime();
        const currentBmcTimeMs = this.bmcTime.getTime();
        const oneDayInMs = 24 * 60 * 60 * 1000;
        return Math.round((validUntilMs - currentBmcTimeMs) / oneDayInMs);
      }
      return new Date();
    },
    getIconStatus(date) {
      const daysUntilExpired = this.getDaysUntilExpired(date);
      if (daysUntilExpired < 1) {
        return 'danger';
      } else if (daysUntilExpired < 31) {
        return 'warning';
      }
    },
    getIsFileTypeCorrect(file) {
      const fileTypeExtension = file.name.split('.').pop();
      return fileTypeExtension === 'pem';
    },
    expandLabel(row) {
      const cert = row.item?.certificate ?? '';
      const base = row.detailsShowing
        ? this.$t('global.table.collapseTableRow')
        : this.$t('global.table.expandTableRow');
      return cert ? `${base} ${cert}` : base;
    },
    formatSerialNumber(serial) {
      if (!serial) return serial;
      // Already colon-separated (e.g. from firmware) — pass through unchanged
      if (serial.includes(':')) return serial.toUpperCase();
      // Pure hex string — format as colon-separated octets
      if (/^[0-9A-Fa-f]+$/.test(serial)) {
        const pairs = serial.match(/.{1,2}/g);
        return pairs ? pairs.join(':').toUpperCase() : serial.toUpperCase();
      }
      // Non-hex (e.g. decimal) — display raw Redfish value
      return serial;
    },
    confirmDialog(message, options = {}) {
      return this.$confirm({ message, ...options });
    },
  },
};
</script>
