import { mount, createLocalVue } from '@vue/test-utils';
import InfoTooltip from '@/components/Global/InfoTooltip';
import BootstrapVue from 'bootstrap-vue';

const localVue = createLocalVue();
localVue.use(BootstrapVue);

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
    expect(wrapper.attributes('title')).toBe('A tooltip test title');
  });
  it('should render icon-tooltip svg icon', () => {
    expect(wrapper.find('svg').exists()).toBe(true);
  });
  it('should render correctly', () => {
    expect(wrapper.element).toMatchSnapshot();
  });
});
