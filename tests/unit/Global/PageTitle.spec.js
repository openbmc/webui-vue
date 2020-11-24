import { mount, createLocalVue } from '@vue/test-utils';
import PageTitle from '@/components/Global/PageTitle';

const localVue = createLocalVue();

describe('PageTitle.vue', () => {
  const wrapper = mount(PageTitle, {
    localVue,
    propsData: {
      description: 'A page title test description',
    },
    mocks: {
      $t: (key) => key,
      $route: {
        meta: {
          title: 'Page Title',
        },
      },
    },
  });
  it('should exist', () => {
    expect(wrapper.exists()).toBe(true);
  });
  it('should render h1 element', () => {
    expect(wrapper.find('h1').exists()).toBe(true);
  });
  it('should render p element', () => {
    expect(wrapper.find('p').exists()).toBe(true);
  });
  it('should render correctly', () => {
    expect(wrapper.element).toMatchSnapshot();
  });
});
