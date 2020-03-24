import api from '../../api';
import i18n from '../../../i18n';

const CERTIFICATE_TYPES = [
  {
    type: 'HTTPS Certificate',
    location: '/redfish/v1/Managers/bmc/NetworkProtocol/HTTPS/Certificates/',
    label: i18n.t('pageSslCertificates.httpsCertificate')
  },
  {
    type: 'LDAP Certificate',
    location: '/redfish/v1/AccountService/LDAP/Certificates/',
    label: i18n.t('pageSslCertificates.ldapCertificate')
  },
  {
    type: 'TrustStore Certificate',
    location: '/redfish/v1/Managers/bmc/Truststore/Certificates/',
    label: i18n.t('pageSslCertificates.caCertificate')
  }
];

const getCertificateProp = (type, prop) => {
  const certificate = CERTIFICATE_TYPES.find(
    certificate => certificate.type === type
  );
  return certificate ? certificate[prop] : null;
};

const SslCertificatesStore = {
  namespaced: true,
  state: {
    allCertificates: [],
    availableUploadTypes: []
  },
  getters: {
    allCertificates: state => state.allCertificates,
    availableUploadTypes: state => state.availableUploadTypes
  },
  mutations: {
    setCertificates(state, certificates) {
      state.allCertificates = certificates;
    },
    setAvailableUploadTypes(state, availableUploadTypes) {
      state.availableUploadTypes = availableUploadTypes;
    }
  },
  actions: {
    getCertificates({ commit }) {
      api
        .get('/redfish/v1/CertificateService/CertificateLocations')
        .then(({ data: { Links: { Certificates } } }) =>
          Certificates.map(certificate => certificate['@odata.id'])
        )
        .then(certificateLocations => {
          const promises = certificateLocations.map(location =>
            api.get(location)
          );
          api.all(promises).then(
            api.spread((...responses) => {
              const certificates = responses.map(({ data }) => {
                const {
                  Name,
                  ValidNotAfter,
                  ValidNotBefore,
                  Issuer = {},
                  Subject = {}
                } = data;
                return {
                  type: Name,
                  location: data['@odata.id'],
                  certificate: getCertificateProp(Name, 'label'),
                  issuedBy: Issuer.CommonName,
                  issuedTo: Subject.CommonName,
                  validFrom: new Date(ValidNotBefore),
                  validUntil: new Date(ValidNotAfter)
                };
              });
              const availableUploadTypes = CERTIFICATE_TYPES.filter(
                ({ type }) =>
                  !certificates
                    .map(certificate => certificate.type)
                    .includes(type)
              );

              commit('setCertificates', certificates);
              commit('setAvailableUploadTypes', availableUploadTypes);
            })
          );
        });
    },
    async addNewCertificate({ dispatch }, { file, type }) {
      return await api
        .post(getCertificateProp(type, 'location'), file, {
          headers: { 'Content-Type': 'application/x-pem-file' }
        })
        .then(() => dispatch('getCertificates'))
        .then(() =>
          i18n.t('pageSslCertificates.toast.successAddCertificate', {
            certificate: getCertificateProp(type, 'label')
          })
        )
        .catch(error => {
          console.log(error);
          throw new Error(
            i18n.t('pageSslCertificates.toast.errorAddCertificate')
          );
        });
    },
    async replaceCertificate(
      { dispatch },
      { certificateString, location, type }
    ) {
      const data = {};
      data.CertificateString = certificateString;
      data.CertificateType = 'PEM';
      data.CertificateUri = { '@odata.id': location };

      return await api
        .post(
          '/redfish/v1/CertificateService/Actions/CertificateService.ReplaceCertificate',
          data
        )
        .then(() => dispatch('getCertificates'))
        .then(() =>
          i18n.t('pageSslCertificates.toast.successReplaceCertificate', {
            certificate: getCertificateProp(type, 'label')
          })
        )
        .catch(error => {
          console.log(error);
          throw new Error(
            i18n.t('pageSslCertificates.toast.errorReplaceCertificate')
          );
        });
    },
    async deleteCertificate({ dispatch }, { type, location }) {
      return await api
        .delete(location)
        .then(() => dispatch('getCertificates'))
        .then(() =>
          i18n.t('pageSslCertificates.toast.successDeleteCertificate', {
            certificate: getCertificateProp(type, 'label')
          })
        )
        .catch(error => {
          console.log(error);
          throw new Error(
            i18n.t('pageSslCertificates.toast.errorDeleteCertificate')
          );
        });
    }
  }
};

export default SslCertificatesStore;
