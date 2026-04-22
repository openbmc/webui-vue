import { createStore } from 'vuex';
import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('@/store/api', () => ({
  default: {
    get: vi.fn(),
    all: vi.fn((promises) => Promise.all(promises)),
    spread: vi.fn((fn) => (results) => fn(...results)),
  },
}));

import api from '@/store/api';
import CertificatesStore from '@/store/modules/SecurityAndAccess/CertificatesStore';

const CERT_LOCATION =
  '/redfish/v1/Managers/bmc/NetworkProtocol/HTTPS/Certificates/1';

const mockCertData = {
  '@odata.id': CERT_LOCATION,
  Name: 'HTTPS Certificate',
  ValidNotBefore: '2024-01-01T00:00:00+00:00',
  ValidNotAfter: '2025-01-01T00:00:00+00:00',
  SerialNumber: 'AABBCCDD',
  SignatureAlgorithm: 'sha256WithRSAEncryption',
  KeyUsage: ['DigitalSignature', 'KeyEncipherment'],
  Version: 2,
  CertificateString: '-----BEGIN CERTIFICATE-----\nMIIB...\n-----END CERTIFICATE-----',
  Issuer: {
    CommonName: 'My CA',
    Organization: 'My Org',
    OrganizationalUnit: 'My Unit',
    City: 'San Jose',
    State: 'CA',
    Country: 'US',
    Email: 'ca@example.com',
  },
  Subject: {
    CommonName: 'bmc.example.com',
    Organization: 'BMC Corp',
    OrganizationalUnit: 'IT',
    City: 'Austin',
    State: 'TX',
    Country: 'US',
    Email: 'bmc@example.com',
  },
};

function buildStore() {
  return createStore({
    modules: {
      global: {
        namespaced: true,
        actions: {
          getBmcPath: () => '/redfish/v1/Managers/bmc',
        },
      },
      certificates: CertificatesStore,
    },
  });
}

function mockApiGet(certData = mockCertData) {
  api.get.mockImplementation((url) => {
    if (url === '/redfish/v1/CertificateService/CertificateLocations') {
      return Promise.resolve({
        data: {
          Links: { Certificates: [{ '@odata.id': CERT_LOCATION }] },
        },
      });
    }
    return Promise.resolve({ data: certData });
  });
}

describe('CertificatesStore – certificate mapping', () => {
  let store;

  beforeEach(() => {
    vi.clearAllMocks();
    store = buildStore();
    mockApiGet();
  });

  it('maps issuer fields from Redfish Issuer object', async () => {
    await store.dispatch('certificates/getCertificates');
    const cert = store.getters['certificates/allCertificates'][0];

    expect(cert.issuer.commonName).toBe('My CA');
    expect(cert.issuer.organization).toBe('My Org');
    expect(cert.issuer.organizationalUnit).toBe('My Unit');
    expect(cert.issuer.city).toBe('San Jose');
    expect(cert.issuer.state).toBe('CA');
    expect(cert.issuer.country).toBe('US');
    expect(cert.issuer.email).toBe('ca@example.com');
  });

  it('maps subject fields from Redfish Subject object', async () => {
    await store.dispatch('certificates/getCertificates');
    const cert = store.getters['certificates/allCertificates'][0];

    expect(cert.subject.commonName).toBe('bmc.example.com');
    expect(cert.subject.organization).toBe('BMC Corp');
    expect(cert.subject.organizationalUnit).toBe('IT');
    expect(cert.subject.city).toBe('Austin');
    expect(cert.subject.state).toBe('TX');
    expect(cert.subject.country).toBe('US');
    expect(cert.subject.email).toBe('bmc@example.com');
  });

  it('maps serialNumber and signatureAlgorithm', async () => {
    await store.dispatch('certificates/getCertificates');
    const cert = store.getters['certificates/allCertificates'][0];

    expect(cert.serialNumber).toBe('AABBCCDD');
    expect(cert.signatureAlgorithm).toBe('sha256WithRSAEncryption');
  });

  it('maps keyUsage array', async () => {
    await store.dispatch('certificates/getCertificates');
    const cert = store.getters['certificates/allCertificates'][0];

    expect(cert.keyUsage).toEqual(['DigitalSignature', 'KeyEncipherment']);
  });

  it('converts ASN.1 Version integer to human-readable X.509 version (Version+1)', async () => {
    await store.dispatch('certificates/getCertificates');
    const cert = store.getters['certificates/allCertificates'][0];

    // Redfish Version=2 is the ASN.1 encoding for X.509 v3
    expect(cert.version).toBe(3);
  });

  it('leaves version undefined when API omits the Version field', async () => {
    const { Version: _omitted, ...dataWithoutVersion } = mockCertData;
    mockApiGet(dataWithoutVersion);

    await store.dispatch('certificates/getCertificates');
    const cert = store.getters['certificates/allCertificates'][0];

    expect(cert.version).toBeUndefined();
  });

  it('handles Version=0 (X.509 v1) without treating it as falsy', async () => {
    mockApiGet({ ...mockCertData, Version: 0 });

    await store.dispatch('certificates/getCertificates');
    const cert = store.getters['certificates/allCertificates'][0];

    expect(cert.version).toBe(1);
  });

  it('does not expose certificateString in the store', async () => {
    await store.dispatch('certificates/getCertificates');
    const cert = store.getters['certificates/allCertificates'][0];

    expect(cert.certificateString).toBeUndefined();
  });
});
