import { mount, createLocalVue } from '@vue/test-utils';
import InfoTooltip from '@/components/Global/InfoTooltip';
import { BootstrapVue } from 'bootstrap-vue';

process.env.BOOTSTRAP_VUE_NO_WARN = true;
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
  it('should render correctly', () => {
    expect(wrapper.element).toMatchSnapshot();
  });
});
