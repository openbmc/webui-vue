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

  // dd order: hostname, interface, link status, IPv4, DHCP
  const values = (wrapper) => wrapper.findAll('dd').map((dd) => dd.text());

  it('prefers the first LinkUp interface that has an address', () => {
    const wrapper = mountCard([
      iface('eth0', 'LinkUp'),
      iface('eth1', 'LinkUp', '10.0.0.2'),
      iface('eth2', 'LinkUp', '10.0.0.3'),
    ]);
    const [, id, link, ipv4] = values(wrapper);
    expect(id).toBe('eth1');
    expect(link).toBe('LinkUp');
    expect(ipv4).toBe('10.0.0.2');
  });

  it('treats a DHCP address as an address', () => {
    const wrapper = mountCard([
      iface('eth0', 'LinkDown'),
      iface('eth1', 'LinkUp', '', [{ Address: '192.168.1.5' }]),
    ]);
    const [, id, , , dhcp] = values(wrapper);
    expect(id).toBe('eth1');
    expect(dhcp).toBe('192.168.1.5');
  });

  it('falls back to the first LinkUp interface when none has an address', () => {
    const wrapper = mountCard([
      iface('eth0', 'LinkDown', '10.0.0.9'),
      iface('eth1', 'LinkUp'),
    ]);
    const [, id, link] = values(wrapper);
    expect(id).toBe('eth1');
    expect(link).toBe('LinkUp');
  });

  it('falls back to the first interface when none is LinkUp', () => {
    const wrapper = mountCard([
      iface('eth0', 'LinkDown'),
      iface('eth1', 'LinkDown', '10.0.0.9'),
    ]);
    const [, id, link] = values(wrapper);
    expect(id).toBe('eth0');
    expect(link).toBe('LinkDown');
  });

  it('renders without interfaces', () => {
    const wrapper = mountCard([]);
    expect(wrapper.findAll('dd')).toHaveLength(5);
  });
});
