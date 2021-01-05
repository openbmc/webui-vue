import { mount, createLocalVue } from '@vue/test-utils';
import Search from '@/components/Global/Search';
import BootstrapVue from 'bootstrap-vue';

const localVue = createLocalVue();
localVue.use(BootstrapVue);

describe('Search.vue', () => {
  const wrapper = mount(Search, {
    localVue,
    mocks: {
      $t: (key) => key,
    },
  });
  it('should exist', () => {
    expect(wrapper.exists()).toBe(true);
  });
  it('should emit change-search on triggering onChangeInput', () => {
    wrapper.find('input').trigger('input');
    expect(wrapper.emitted('change-search')).toHaveLength(1);
  });
  it('should emit clear-search on triggering onClearSearch', async () => {
    await wrapper.setData({ filter: 'true' });
    wrapper.find('button').trigger('click');
    expect(wrapper.emitted('clear-search')).toHaveLength(1);
  });
  it('should render correctly', () => {
    expect(wrapper.element).toMatchSnapshot();
  });
});
