import { mount } from '@vue/test-utils';
import PageContainer from '@/components/Global/PageContainer';

describe('PageContainer.vue', () => {
  const wrapper = mount(PageContainer, {
    mocks: {
      $t: (key) => key,
    },
  });
  it('should exist', () => {
    expect(wrapper.exists()).toBe(true);
  });
  it('should render main element', () => {
    expect(wrapper.find('main').exists()).toBe(true);
  });
  it('should render correctly', () => {
    expect(wrapper.element).toMatchSnapshot();
  });
});
