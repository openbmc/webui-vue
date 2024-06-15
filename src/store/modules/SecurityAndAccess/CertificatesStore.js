import api from '@/store/api';
import i18n from '@/i18n';

const getCertificateProp = (certificateTypes, type, prop) => {
  const certificate = certificateTypes.find(
    (certificate) => certificate.type === type,
  );
  return certificate ? certificate[prop] : null;
};

const CertificatesStore = {
  namespaced: true,
  state: {
    allCertificates: [],
    availableUploadTypes: [],
    certificateTypes: [],
  },
  getters: {
    allCertificates: (state) => state.allCertificates,
    availableUploadTypes: (state) => state.availableUploadTypes,
    certificateTypes: (state) => state.certificateTypes,
  },
  mutations: {
    setCertificates(state, certificates) {
      state.allCertificates = certificates;
    },
    setAvailableUploadTypes(state, availableUploadTypes) {
      state.availableUploadTypes = availableUploadTypes;
    },
    setCertificateTypes(state, certificateTypes) {
      state.certificateTypes = certificateTypes;
    },
  },
  actions: {
    async getCertificateTypes({ commit }) {
      const certificateTypes = [
        {
          type: 'HTTPS Certificate',
          location: `${await this.dispatch(
            'global/getBmcPath',
          )}/NetworkProtocol/HTTPS/Certificates/`,
          label: i18n.t('pageCertificates.httpsCertificate'),
        },
        {
          type: 'LDAP Certificate',
          location: '/redfish/v1/AccountService/LDAP/Certificates/',
          label: i18n.t('pageCertificates.ldapCertificate'),
        },
        {
          type: 'TrustStore Certificate',
          location: `${await this.dispatch(
            'global/getBmcPath',
          )}/Truststore/Certificates/`,
          // Web UI will show 'CA Certificate' instead of
          // 'TrustStore Certificate' after user testing revealed
          // the term 'TrustStore Certificate' wasn't recognized/was unfamilar
          label: i18n.t('pageCertificates.caCertificate'),
        },
      ];
      await commit('setCertificateTypes', certificateTypes);
    },
    async getCertificates({ dispatch, getters, commit }) {
      await dispatch('getCertificateTypes');
      return await api
        .get('/redfish/v1/CertificateService/CertificateLocations')
        .then(
          ({
            data: {
              Links: { Certificates },
            },
          }) => Certificates.map((certificate) => certificate['@odata.id']),
        )
        .then((certificateLocations) => {
          const promises = certificateLocations.map((location) =>
            api.get(location),
          );
          api.all(promises).then(
            api.spread((...responses) => {
              const certificates = responses.map(({ data }) => {
                const {
                  Name,
                  ValidNotAfter,
                  ValidNotBefore,
                  Issuer = {},
                  Subject = {},
                } = data;
                return {
                  type: Name,
                  location: data['@odata.id'],
                  certificate: getCertificateProp(
                    getters['certificateTypes'],
                    Name,
                    'label',
                  ),
                  issuedBy: Issuer.CommonName,
                  issuedTo: Subject.CommonName,
                  validFrom: new Date(ValidNotBefore),
                  validUntil: new Date(ValidNotAfter),
                };
              });
              const availableUploadTypes = getters['certificateTypes'].filter(
                ({ type }) =>
                  !certificates
                    .map((certificate) => certificate.type)
                    .includes(type),
              );

              commit('setCertificates', certificates);
              commit('setAvailableUploadTypes', availableUploadTypes);
            }),
          );
        });
    },
    async addNewCertificate({ dispatch, getters }, { file, type }) {
      return await api
        .post(
          getCertificateProp(getters['certificateTypes'], type, 'location'),
          file,
          {
            headers: { 'Content-Type': 'application/x-pem-file' },
          },
        )
        .then(() => dispatch('getCertificates'))
        .then(() =>
          i18n.t('pageCertificates.toast.successAddCertificate', {
            certificate: getCertificateProp(
              getters['certificateTypes'],
              type,
              'label',
            ),
          }),
        )
        .catch((error) => {
          console.log(error);
          throw new Error(i18n.t('pageCertificates.toast.errorAddCertificate'));
        });
    },
    async replaceCertificate(
      { dispatch, getters },
      { certificateString, location, type },
    ) {
      const data = {};
      data.CertificateString = certificateString;
      data.CertificateType = 'PEM';
      data.CertificateUri = { '@odata.id': location };

      return await api
        .post(
          '/redfish/v1/CertificateService/Actions/CertificateService.ReplaceCertificate',
          data,
        )
        .then(() => dispatch('getCertificates'))
        .then(() =>
          i18n.t('pageCertificates.toast.successReplaceCertificate', {
            certificate: getCertificateProp(
              getters['certificateTypes'],
              type,
              'label',
            ),
          }),
        )
        .catch((error) => {
          console.log(error);
          throw new Error(
            i18n.t('pageCertificates.toast.errorReplaceCertificate'),
          );
        });
    },
    async deleteCertificate({ dispatch, getters }, { type, location }) {
      return await api
        .delete(location)
        .then(() => dispatch('getCertificates'))
        .then(() =>
          i18n.t('pageCertificates.toast.successDeleteCertificate', {
            certificate: getCertificateProp(
              getters['certificateTypes'],
              type,
              'label',
            ),
          }),
        )
        .catch((error) => {
          console.log(error);
          throw new Error(
            i18n.t('pageCertificates.toast.errorDeleteCertificate'),
          );
        });
    },
    async generateCsr({ getters }, userData) {
      const {
        certificateType,
        country,
        state,
        city,
        companyName,
        companyUnit,
        commonName,
        keyPairAlgorithm,
        keyBitLength,
        keyCurveId,
        contactPerson,
        emailAddress,
        alternateName,
      } = userData;
      const data = {};

      data.CertificateCollection = {
        '@odata.id': getCertificateProp(
          getters['certificateTypes'],
          certificateType,
          'location',
        ),
      };
      data.Country = country;
      data.State = state;
      data.City = city;
      data.Organization = companyName;
      data.OrganizationalUnit = companyUnit;
      data.CommonName = commonName;
      data.KeyPairAlgorithm = keyPairAlgorithm;
      data.AlternativeNames = alternateName;

      if (keyCurveId) data.KeyCurveId = keyCurveId;
      if (keyBitLength) data.KeyBitLength = keyBitLength;
      if (contactPerson) data.ContactPerson = contactPerson;
      if (emailAddress) data.Email = emailAddress;

      return await api
        .post(
          '/redfish/v1/CertificateService/Actions/CertificateService.GenerateCSR',
          data,
        )
        //TODO: Success response also throws error so
        // can't accurately show legitimate error in UI
        .catch((error) => console.log(error));
    },
  },
};

export default CertificatesStore;
