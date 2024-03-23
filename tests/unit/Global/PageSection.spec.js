import { mount } from '@vue/test-utils';
import PageSection from '@/components/Global/PageSection';

describe('PageSection.vue', () => {
  const wrapper = mount(PageSection, {
    propsData: {
      sectionTitle: 'PageSection test title',
    },
    mocks: {
      $t: (key) => key,
    },
  });
  it('should exist', () => {
    expect(wrapper.exists()).toBe(true);
  });
  it('should render h2 element', () => {
    expect(wrapper.find('h2').exists()).toBe(true);
  });
  it('should render correctly', () => {
    expect(wrapper.element).toMatchSnapshot();
  });
});
