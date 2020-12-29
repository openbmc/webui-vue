import { mount, createLocalVue } from '@vue/test-utils';
import LoadingBar from '@/components/Global/LoadingBar';

const localVue = createLocalVue();

describe('LoadingBar.vue', () => {
  const wrapper = mount(LoadingBar, {
    localVue,
    mocks: {
      $t: (key) => key,
    },
  });
  it('should exist', () => {
    expect(wrapper.exists()).toBe(true);
  });
  it('should render b-progress element', () => {
    expect(wrapper.find('b-progress').exists()).toBe(true);
  });
  it('should render b-progress-bar element', () => {
    expect(wrapper.find('b-progress-bar').exists()).toBe(true);
  });
  it('should render correctly', () => {
    expect(wrapper.element).toMatchSnapshot();
  });
});
