import { mount, createLocalVue } from '@vue/test-utils';
import Vue from 'vue';
import PageTitle from '@/components/Global/PageTitle';

// Silencing warnings about undefined Bootsrap-vue components
Vue.config.silent = true;
const localVue = createLocalVue();

describe('PageTitle.vue', () => {
  const wrapper = mount(PageTitle, {
    localVue,
    mocks: {
      $t: (key) => key,
      $route: {
        meta: '',
      },
    },
  });
  it('should exist', () => {
    expect(wrapper.exists()).toBe(true);
  });
  it('should render correctly', () => {
    expect(wrapper.element).toMatchSnapshot();
  });
});
