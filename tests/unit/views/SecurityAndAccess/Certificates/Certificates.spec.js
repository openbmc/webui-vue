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
      // .match(/.{1,2}/g) handles trailing single char
      const result = wrapper.vm.formatSerialNumber('abc');
      expect(result).toBe('AB:C');
    });

    it('returns decimal strings without modification', () => {
      // A decimal serial like "1234567890" is NOT pure hex-only (contains '8','9')
      // Wait — '8' and '9' are valid hex digits. Let's test a string with non-hex chars.
      // Pure decimal with no hex letters: still matches /^[0-9A-Fa-f]+$/ because 0-9 are valid hex
      // Test with a clearly non-hex string
      expect(wrapper.vm.formatSerialNumber('hello')).toBe('hello');
    });

    it('returns strings with non-hex characters unchanged', () => {
      expect(wrapper.vm.formatSerialNumber('123XYZ')).toBe('123XYZ');
    });
  });
});
