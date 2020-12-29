import { mount, createLocalVue } from '@vue/test-utils';
import LoadingBar from '@/components/Global/LoadingBar';
import BootstrapVue from 'bootstrap-vue';

const localVue = createLocalVue();
localVue.use(BootstrapVue);

describe('LoadingBar.vue', () => {
  const wrapper = mount(LoadingBar, {
    localVue,
    data() {
      return {
        loadingIndicatorValue: 0,
        isLoadingComplete: false,
      };
    },
    mocks: {
      $t: (key) => key,
    },
  });
  it('should exist', () => {
    expect(wrapper.exists()).toBe(true);
  });
  it('should show loading bar element', async () => {
    await wrapper.setData({
      isLoadingComplete: false,
      loadingIndicatorValue: 100,
    });
    expect(wrapper.vm.isLoadingComplete).toBe(false);
    expect(wrapper.find('.progress').exists()).toBe(true);
  });
  it('should hide loading bar element', async () => {
    await wrapper.setData({
      isLoadingComplete: true,
      loadingIndicatorValue: 0,
    });
    expect(wrapper.vm.isLoadingComplete).toBe(true);
    expect(wrapper.find('.progress').exists()).toBe(false);
  });
  it('should render correctly', () => {
    expect(wrapper.element).toMatchSnapshot();
  });
});
