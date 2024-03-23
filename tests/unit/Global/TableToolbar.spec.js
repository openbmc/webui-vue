import { mount } from '@vue/test-utils';
import TableToolbar from '@/components/Global/TableToolbar';

describe('TableToolbar.vue', () => {
  const wrapper = mount(TableToolbar, {
    propsData: {
      selectedItemsCount: 0,
    },
    mocks: {
      $t: (key) => key,
    },
  });
  it('should exist', () => {
    expect(wrapper.exists()).toBe(true);
  });
  it('should render class toolbar-container when selectedItemsCount is greater than 0', async () => {
    await wrapper.setProps({ selectedItemsCount: 12 });
    expect(wrapper.find('.toolbar-container').exists()).toBe(true);
  });
  it('should render correctly', () => {
    expect(wrapper.element).toMatchSnapshot();
  });
});
