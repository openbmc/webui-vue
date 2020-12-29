import { mount, createLocalVue } from '@vue/test-utils';
import TableCellCount from '@/components/Global/TableCellCount';

const localVue = createLocalVue();

describe('TableCellCount.vue', () => {
  const wrapper = mount(TableCellCount, {
    localVue,
    propsData: {
      filteredItemsCount: 5,
      totalNumberOfCells: 100,
    },
    mocks: {
      $t: (key) => key,
    },
  });
  it('should exist', () => {
    expect(wrapper.exists()).toBe(true);
  });
  it('should render filtered and totalnumber of items', () => {
    expect(wrapper.text()).toContain('global.table.selectedItems');
  });
  it('should render only totalnumber of items', async () => {
    await wrapper.setProps({ filteredItemsCount: 5, totalNumberOfCells: 5 });
    expect(wrapper.text()).toContain('global.table.items');
  });
  it('should render correctly', () => {
    expect(wrapper.element).toMatchSnapshot();
  });
});
