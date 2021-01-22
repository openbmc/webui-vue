import { mount, createLocalVue } from '@vue/test-utils';
import ProgressIndicator from '@/components/Global/ProgressIndicator';
import BootstrapVue from 'bootstrap-vue';

const localVue = createLocalVue();
localVue.use(BootstrapVue);

describe('ProgressIndicator.vue', () => {
  const wrapper = mount(ProgressIndicator, {
    localVue,
    propsData: {
      steps: [
        { label: 'Step 1' },
        { label: 'Step 2' },
        { label: 'Step 3' },
        { label: 'Step 4' },
      ],
      start: 0,
    },
    mocks: {
      $t: (key) => key,
    },
  });

  wrapper.vm.next();
  wrapper.vm.next();
  wrapper.vm.showError();

  it('should exist', () => {
    expect(wrapper.exists()).toBe(true);
  });

  it('should render 4 li elements', () => {
    expect(wrapper.findAll('li').length).toBe(4);
  });

  it('should render 2 completed steps', () => {
    expect(wrapper.findAll('.status-icon.success').length).toBe(2);
  });

  it('should render 1 error step', () => {
    expect(wrapper.findAll('.status-icon.danger').length).toBe(1);
  });

  it('should render correctly', () => {
    expect(wrapper.element).toMatchSnapshot();
  });
});
