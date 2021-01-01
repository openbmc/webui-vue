import { mount, createLocalVue } from '@vue/test-utils';
import Alert from '@/components/Global/Alert';

const localVue = createLocalVue();

describe('Alert.vue', () => {
  const wrapper = mount(Alert, {
    localVue,
    propsData: {
      show: true,
      variant: 'Test a type of alert',
      small: false,
    },
  });
  it('should exist', () => {
    expect(wrapper.exists()).toBe(true);
  });
  it('should show alert', async () => {
    await wrapper.setProps({ show: true });
    expect(wrapper.find('.alert').exists()).toBe(true);
  });
  it('should hide alert', async () => {
    await wrapper.setProps({ show: false });
    expect(wrapper.find('.alert').exists()).toBe(false);
  });
  it('should render correctly', () => {
    expect(wrapper.element).toMatchSnapshot();
  });
});
