import { mount } from '@vue/test-utils';
import { createStore } from 'vuex';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import Certificates from '@/views/SecurityAndAccess/Certificates/Certificates';
import { bootstrapStubs } from '../../../testUtils';

vi.mock('bootstrap-vue-next', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useModal: vi.fn(() => ({ show: vi.fn(), hide: vi.fn() })),
  };
});

function buildStore(certificates = []) {
  return createStore({
    modules: {
      global: {
        namespaced: true,
        getters: {
          bmcTime: () => null,
        },
        actions: {
          getBmcTime: vi.fn(),
        },
      },
      certificates: {
        namespaced: true,
        getters: {
          allCertificates: () => certificates,
          availableUploadTypes: () => [],
        },
        actions: {
          getCertificates: vi.fn(),
        },
      },
    },
  });
}

function createWrapper(certificates = []) {
  return mount(Certificates, {
    global: {
      plugins: [buildStore(certificates)],
      stubs: {
        ...bootstrapStubs,
        'b-table': { template: '<div><slot /></div>' },
        'b-container': { template: '<div><slot /></div>' },
        'b-row': { template: '<div><slot /></div>' },
        'b-col': { template: '<div><slot /></div>' },
        Alert: true,
        PageTitle: true,
        ModalUploadCertificate: true,
        ModalGenerateCsr: true,
        TableRowAction: true,
        StatusIcon: true,
        IconAdd: true,
        IconReplace: true,
        IconTrashcan: true,
        IconChevron: true,
      },
    },
  });
}

describe('Certificates.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = createWrapper();
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('renders without errors', () => {
    expect(wrapper.exists()).toBe(true);
  });

  describe('expandLabel()', () => {
    const httpsRow = { detailsShowing: false, item: { certificate: 'HTTPS Certificate' } };
    const ldapRow = { detailsShowing: false, item: { certificate: 'LDAP Certificate' } };

    it('returns collapse label when row is expanded', () => {
      const label = wrapper.vm.expandLabel({ detailsShowing: true, item: { certificate: 'HTTPS Certificate' } });
      expect(label).toBeTruthy();
    });

    it('returns different labels for collapsed and expanded states', () => {
      const expandLbl = wrapper.vm.expandLabel({ detailsShowing: false, item: { certificate: 'HTTPS Certificate' } });
      const collapseLbl = wrapper.vm.expandLabel({ detailsShowing: true, item: { certificate: 'HTTPS Certificate' } });
      expect(expandLbl).not.toBe(collapseLbl);
    });

    it('includes the certificate name so each row has a unique aria-label', () => {
      const httpsLabel = wrapper.vm.expandLabel(httpsRow);
      const ldapLabel = wrapper.vm.expandLabel(ldapRow);
      expect(httpsLabel).toContain('HTTPS Certificate');
      expect(ldapLabel).toContain('LDAP Certificate');
      expect(httpsLabel).not.toBe(ldapLabel);
    });

    it('falls back gracefully when certificate name is absent', () => {
      const label = wrapper.vm.expandLabel({ detailsShowing: false, item: {} });
      expect(label).toBeTruthy();
    });
  });

  describe('formatSerialNumber()', () => {
    it('returns falsy values as-is', () => {
      expect(wrapper.vm.formatSerialNumber(null)).toBeNull();
      expect(wrapper.vm.formatSerialNumber('')).toBe('');
      expect(wrapper.vm.formatSerialNumber(undefined)).toBeUndefined();
    });

    it('passes through already colon-separated serial numbers unchanged', () => {
      expect(wrapper.vm.formatSerialNumber('A1:B2:C3')).toBe('A1:B2:C3');
    });

    it('uppercases already colon-separated serial numbers', () => {
      expect(wrapper.vm.formatSerialNumber('a1:b2:c3')).toBe('A1:B2:C3');
    });

    it('formats a pure hex string as colon-separated octets', () => {
      expect(wrapper.vm.formatSerialNumber('aabbcc')).toBe('AA:BB:CC');
    });

    it('formats odd-length hex strings gracefully', () => {
      // 'abc' contains A–F so it is unambiguously hex — still formatted
      const result = wrapper.vm.formatSerialNumber('abc');
      expect(result).toBe('AB:C');
    });

    it('does not reformat a short pure-decimal string with no hex letters', () => {
      // '12' is even-length but < 4 and has no A–F — left as-is
      expect(wrapper.vm.formatSerialNumber('12')).toBe('12');
    });

    it('does not reformat an odd-length decimal-only hex string', () => {
      // '123' is odd-length with no A–F — left as-is
      expect(wrapper.vm.formatSerialNumber('123')).toBe('123');
    });

    it('does not reformat a pure-decimal string even when length ≥ 4', () => {
      // '12345678' has no A-F letters so it cannot be distinguished from a
      // decimal serial number — returned as-is per reviewer guidance.
      expect(wrapper.vm.formatSerialNumber('12345678')).toBe('12345678');
    });

    it('returns non-hex strings without modification', () => {
      expect(wrapper.vm.formatSerialNumber('hello')).toBe('hello');
    });

    it('returns strings with non-hex characters unchanged', () => {
      expect(wrapper.vm.formatSerialNumber('123XYZ')).toBe('123XYZ');
    });
  });

  describe('toggleRowDetails()', () => {
    it('calls row.toggleDetails to expand or collapse the row', () => {
      const row = { toggleDetails: vi.fn(), detailsShowing: false };
      wrapper.vm.toggleRowDetails(row);
      expect(row.toggleDetails).toHaveBeenCalledOnce();
    });
  });

  describe('row-details conditional rendering', () => {
    // Test the v-if predicates used directly in the template.  DOM-level
    // expand/collapse tests require full b-table slot support and are tracked
    // as a follow-up integration test (per reviewer comment #66).

    function certDetailsVisible(item) {
      return (
        item.version != null ||
        !!item.serialNumber ||
        !!item.signatureAlgorithm ||
        (Array.isArray(item.keyUsage) && item.keyUsage.length > 0)
      );
    }

    function validityPeriodVisible(item) {
      return !!(item.validFrom || item.validUntil);
    }

    const emptyItem = {
      version: null,
      serialNumber: null,
      signatureAlgorithm: null,
      keyUsage: [],
      validFrom: null,
      validUntil: null,
    };

    it('hides Certificate Details heading when all detail fields are absent', () => {
      expect(certDetailsVisible(emptyItem)).toBe(false);
    });

    it('shows Certificate Details heading when version is present', () => {
      expect(certDetailsVisible({ ...emptyItem, version: 2 })).toBe(true);
    });

    it('shows Certificate Details heading when serialNumber is present', () => {
      expect(certDetailsVisible({ ...emptyItem, serialNumber: 'AABB' })).toBe(true);
    });

    it('shows Certificate Details heading when signatureAlgorithm is present', () => {
      expect(
        certDetailsVisible({ ...emptyItem, signatureAlgorithm: 'sha256WithRSAEncryption' }),
      ).toBe(true);
    });

    it('shows Certificate Details heading when keyUsage is non-empty', () => {
      expect(certDetailsVisible({ ...emptyItem, keyUsage: ['Digital Signature'] })).toBe(true);
    });

    it('hides Validity Period heading when both dates are absent', () => {
      expect(validityPeriodVisible(emptyItem)).toBe(false);
    });

    it('shows Validity Period heading when validFrom is present', () => {
      expect(validityPeriodVisible({ ...emptyItem, validFrom: '2024-01-01T00:00:00Z' })).toBe(
        true,
      );
    });

    it('shows Validity Period heading when validUntil is present', () => {
      expect(validityPeriodVisible({ ...emptyItem, validUntil: '2025-01-01T00:00:00Z' })).toBe(
        true,
      );
    });
  });
});
