import { mount, createLocalVue } from '@vue/test-utils';
import InfoTooltip from '@/components/Global/InfoTooltip';

const localVue = createLocalVue();

describe('InfoTooltip.vue', () => {
  const wrapper = mount(InfoTooltip, {
    localVue,
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
  it('should render title attribute for button', () => {
    expect(wrapper.attributes('title')).toBe('title');
  });
  it('should render icon-tooltip element', () => {
    expect(wrapper.find('icon-tooltip').exists()).toBe(true);
  });
  it('should render correctly', () => {
    expect(wrapper.element).toMatchSnapshot();
  });
});
