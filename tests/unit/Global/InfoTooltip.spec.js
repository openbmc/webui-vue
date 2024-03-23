import { mount } from '@vue/test-utils';
import InfoTooltip from '@/components/Global/InfoTooltip';

process.env.BOOTSTRAP_VUE_NO_WARN = true;

describe('InfoTooltip.vue', () => {
  const wrapper = mount(InfoTooltip, {
    propsData: {
      title: 'A tooltip test title',
    },
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
