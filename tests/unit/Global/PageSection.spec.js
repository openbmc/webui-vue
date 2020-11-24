import { mount, createLocalVue } from '@vue/test-utils';
import Vue from 'vue';
import PageSection from '@/components/Global/PageSection';

// Silencing warnings about undefined Bootsrap-vue components
Vue.config.silent = true;
const localVue = createLocalVue();

describe('PageSection.vue', () => {
  const wrapper = mount(PageSection, {
    localVue,
    mocks: {
      $t: (key) => key,
    },
  });
  it('should exist', () => {
    expect(wrapper.exists()).toBe(true);
  });
  it('should render correctly', () => {
    expect(wrapper.element).toMatchSnapshot();
  });
});
