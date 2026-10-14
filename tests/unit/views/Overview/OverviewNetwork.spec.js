import { mount } from '@vue/test-utils';
import { createStore } from 'vuex';
import { vi } from 'vitest';
import OverviewNetwork from '@/views/Overview/OverviewNetwork.vue';
import { bootstrapStubs } from '../../testUtils';

const iface = (id, linkStatus, staticAddress = '', dhcpAddress = []) => ({
  id,
  hostname: 'bmc',
  linkStatus,
  staticAddress,
  dhcpAddress,
});

describe('OverviewNetwork.vue', () => {
  const mountCard = (interfaces) => {
    const store = createStore({
      modules: {
        network: {
          namespaced: true,
          getters: { globalNetworkSettings: () => interfaces },
          actions: { getEthernetData: vi.fn(() => Promise.resolve()) },
        },
      },
    });
    return mount(OverviewNetwork, {
      global: {
        plugins: [store],
        mocks: { $eventBus: { $emit: vi.fn() } },
        stubs: {
          ...bootstrapStubs,
          'overview-card': { template: '<div><slot /></div>' },
        },
      },
    });
  };

  const fields = ['hostname', 'interface', 'linkStatus', 'ipv4', 'dhcp'];
  const field = (wrapper, name) =>
    wrapper.get(`[data-test-id="overviewNetwork-text-${name}"]`).text();

  it('prefers the first LinkUp interface that has an address', () => {
    const wrapper = mountCard([
      iface('eth0', 'LinkUp'),
      iface('eth1', 'LinkUp', '10.0.0.2'),
      iface('eth2', 'LinkUp', '10.0.0.3'),
    ]);
    expect(field(wrapper, 'interface')).toBe('eth1');
    expect(field(wrapper, 'linkStatus')).toBe('LinkUp');
    expect(field(wrapper, 'ipv4')).toBe('10.0.0.2');
  });

  it('treats a DHCP address as an address', () => {
    const wrapper = mountCard([
      iface('eth0', 'LinkDown'),
      iface('eth1', 'LinkUp', '', [{ Address: '192.168.1.5' }]),
    ]);
    expect(field(wrapper, 'interface')).toBe('eth1');
    expect(field(wrapper, 'dhcp')).toBe('192.168.1.5');
  });

  it('falls back to the first LinkUp interface when none has an address', () => {
    const wrapper = mountCard([
      iface('eth0', 'LinkDown', '10.0.0.9'),
      iface('eth1', 'LinkUp'),
    ]);
    expect(field(wrapper, 'interface')).toBe('eth1');
    expect(field(wrapper, 'linkStatus')).toBe('LinkUp');
  });

  it('falls back to the first interface when none is LinkUp', () => {
    const wrapper = mountCard([
      iface('eth0', 'LinkDown'),
      iface('eth1', 'LinkDown', '10.0.0.9'),
    ]);
    expect(field(wrapper, 'interface')).toBe('eth0');
    expect(field(wrapper, 'linkStatus')).toBe('LinkDown');
  });

  it('renders placeholders without interfaces', () => {
    const wrapper = mountCard([]);
    fields.forEach((name) => expect(field(wrapper, name)).toBe('--'));
  });
});
