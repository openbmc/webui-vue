import { mount } from '@vue/test-utils';
import InputPasswordToggle from '@/components/Global/InputPasswordToggle';

describe('InputPasswordToggle.vue', () => {
  const wrapper = mount(InputPasswordToggle, {
    data() {
      return {
        isVisible: false,
      };
    },
    mocks: {
      $t: (key) => key,
    },
  });
  it('should exist', () => {
    expect(wrapper.exists()).toBe(true);
  });
  it('should not render isVisible class', () => {
    expect(wrapper.find('.isVisible').exists()).toBe(false);
  });
  it('should render isVisible class when button is clicked', async () => {
    await wrapper.find('button').trigger('click');
    expect(wrapper.find('.isVisible').exists()).toBe(true);
  });
  it('should render correctly', () => {
    expect(wrapper.element).toMatchSnapshot();
  });
});
