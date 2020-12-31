import { mount, createLocalVue } from '@vue/test-utils';
import StatusIcon from '@/components/Global/StatusIcon';

const localVue = createLocalVue();

describe('StatusIcon.vue', () => {
  const wrapper = mount(StatusIcon, {
    localVue,
    propsData: {
      status: 'info',
    },
  });
  it('should exist', () => {
    expect(wrapper.exists()).toBe(true);
  });
  it('should render icon-info element', () => {
    expect(wrapper.find('.info').exists()).toBe(true);
  });
  it('should render icon-success element', () => {
    const wrapper = mount(StatusIcon, {
      localVue,
      propsData: {
        status: 'success',
      },
    });
    expect(wrapper.find('.success').exists()).toBe(true);
  });
  it('should render icon-warning element', () => {
    const wrapper = mount(StatusIcon, {
      localVue,
      propsData: {
        status: 'warning',
      },
    });
    expect(wrapper.find('.warning').exists()).toBe(true);
  });
  it('should render icon-danger element', () => {
    const wrapper = mount(StatusIcon, {
      localVue,
      propsData: {
        status: 'danger',
      },
    });
    expect(wrapper.find('.danger').exists()).toBe(true);
  });
  it('should render icon-secondary element', () => {
    const wrapper = mount(StatusIcon, {
      localVue,
      propsData: {
        status: 'sec',
      },
    });
    expect(wrapper.find('.status-icon').exists()).toBe(true);
  });
  it('should render correctly', () => {
    expect(wrapper.element).toMatchSnapshot();
  });
});
