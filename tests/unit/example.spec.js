import { expect } from 'chai';
import { shallowMount } from '@vue/test-utils';
import AppHeader from '@/components/AppHeader';
import $store from '@/store';

describe('AppHeader.vue', () => {
  it('renders AppHeader component', () => {
    const wrapper = shallowMount(AppHeader, {
      mocks: {
        $t: key => key,
        $store
      }
    });
    expect(wrapper.exists());
  });
});
