import { mount, createLocalVue } from '@vue/test-utils';
import Alert from '@/components/Global/Alert';

const localVue = createLocalVue();

describe('Alert.vue', () => {
  const wrapper = mount(Alert, {
    localVue,
    propsData: {
      show: 'Test a value to show alert',
      variant: 'Test a type of alert',
      small: 'Test a size of alert',
    },
    mocks: {
      $t: (key) => key,
    },
  });
  it('should exist', () => {
    expect(wrapper.exists()).toBe(true);
  });
  it('should render b-alert element', () => {
    expect(wrapper.find('b-alert').exists()).toBe(true);
  });
  it('should render status-icon element', () => {
    expect(wrapper.find('status-icon').exists()).toBe(true);
  });
  it('should render correctly', () => {
    expect(wrapper.element).toMatchSnapshot();
  });
});
