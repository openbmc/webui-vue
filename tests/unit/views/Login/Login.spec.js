/**
 * Tests for Login.vue redirect behaviour.
 *
 * Strategy: mock the `redirectToRedfishOrHome` utility so tests are not
 * sensitive to Vuelidate/DOM internals.  We verify that `login()` resolves
 * the next-path correctly and passes it to the shared helper (or calls
 * $router.push('/change-password') for the password-change flow).
 */
import { flushPromises } from '@vue/test-utils';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

// Mock the shared redirect helper BEFORE importing Login.vue so the
// component picks up the mock at module evaluation time.
const redirectToRedfishOrHomeMock = vi.fn();
vi.mock('@/utilities/redfishRedirect', () => ({
  redirectToRedfishOrHome: redirectToRedfishOrHomeMock,
  isRedfishRedirectPath: (path) =>
    path === '/redfish/v1' || (path?.startsWith('/redfish/v1/') ?? false),
}));

// Mock Vuelidate so form-validation never blocks login() in unit tests.
const mockField = () => ({
  $invalid: false,
  $error: false,
  $dirty: false,
  $touch: vi.fn(),
  required: { $invalid: false },
});
vi.mock('@vuelidate/core', () => ({
  useVuelidate: () => ({
    $touch: vi.fn(),
    $reset: vi.fn(),
    $invalid: false,
    userInfo: {
      username: mockField(),
      password: mockField(),
    },
  }),
}));

// Dynamic import so the mock is in place first.
const { default: Login } = await import('@/views/Login/Login.vue');
const { mount } = await import('@vue/test-utils');
const { createStore } = await import('vuex');

// ── helpers ──────────────────────────────────────────────────────────────────

function makeStore({ loginResolveValue = false } = {}) {
  return createStore({
    modules: {
      authentication: {
        namespaced: true,
        getters: { authError: () => false },
        actions: {
          login: vi.fn().mockResolvedValue(loginResolveValue),
        },
      },
      global: {
        namespaced: true,
        getters: { languagePreference: () => 'en-US' },
        mutations: {
          setUsername: vi.fn(),
          setLanguagePreference: vi.fn(),
        },
      },
    },
  });
}

function makeRouter() {
  return { push: vi.fn() };
}

function mountLogin({ store, router, routeQuery = {} } = {}) {
  return mount(Login, {
    global: {
      plugins: [store ?? makeStore()],
      mocks: {
        $t: (k) => k,
        $router: router ?? makeRouter(),
        $route: { query: routeQuery },
      },
      stubs: {
        Alert: true,
        InputPasswordToggle: true,
        'b-form': {
          template:
            '<form @submit.prevent="$emit(\'submit\')"><slot /></form>',
        },
        'b-form-group': { template: '<div><slot /></div>' },
        'b-form-select': { template: '<select />' },
        'b-form-input': { template: '<input />' },
        'b-form-invalid-feedback': { template: '<div><slot /></div>' },
        'b-button': {
          template: '<button type="submit"><slot /></button>',
        },
      },
    },
  });
}

/** Trigger the login() method bypassing Vuelidate form validation. */
async function triggerLogin(wrapper, { username = 'admin', password = 'pw' } = {}) {
  wrapper.vm.userInfo.username = username;
  wrapper.vm.userInfo.password = password;
  await wrapper.vm.login();
  await flushPromises();
}

// ── tests ────────────────────────────────────────────────────────────────────

describe('Login.vue – post-login redirect', () => {
  beforeEach(() => {
    redirectToRedfishOrHomeMock.mockClear();
    vi.stubGlobal('location', {
      origin: 'https://bmc.example.com',
      href: 'https://bmc.example.com/',
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('calls redirectToRedfishOrHome with null when no next param is present', async () => {
    const router = makeRouter();
    const wrapper = mountLogin({ router });
    await triggerLogin(wrapper);

    expect(redirectToRedfishOrHomeMock).toHaveBeenCalledWith(null, router);
  });

  it('passes hash-router query.next to redirectToRedfishOrHome', async () => {
    const router = makeRouter();
    const wrapper = mountLogin({
      router,
      routeQuery: { next: '/redfish/v1/Systems' },
    });
    await triggerLogin(wrapper);

    expect(redirectToRedfishOrHomeMock).toHaveBeenCalledWith(
      '/redfish/v1/Systems',
      router,
    );
  });

  it('passes Redfish service root path to redirectToRedfishOrHome', async () => {
    const router = makeRouter();
    const wrapper = mountLogin({
      router,
      routeQuery: { next: '/redfish/v1' },
    });
    await triggerLogin(wrapper);

    expect(redirectToRedfishOrHomeMock).toHaveBeenCalledWith(
      '/redfish/v1',
      router,
    );
  });

  it('falls back to URL search params when route query is empty (bmcweb-style)', async () => {
    vi.stubGlobal('location', {
      origin: 'https://bmc.example.com',
      href: 'https://bmc.example.com/login?next=/redfish/v1/Systems',
    });
    const router = makeRouter();
    const wrapper = mountLogin({ router, routeQuery: {} });
    await triggerLogin(wrapper);

    expect(redirectToRedfishOrHomeMock).toHaveBeenCalledWith(
      '/redfish/v1/Systems',
      router,
    );
  });

  it('passes unsafe next= value through to redirectToRedfishOrHome (safety is in the utility)', async () => {
    const router = makeRouter();
    const wrapper = mountLogin({
      router,
      routeQuery: { next: 'https://evil.example.com/steal' },
    });
    await triggerLogin(wrapper);

    expect(redirectToRedfishOrHomeMock).toHaveBeenCalledWith(
      'https://evil.example.com/steal',
      router,
    );
  });

  it('redirects to /change-password when PasswordChangeRequired is true', async () => {
    const store = makeStore({ loginResolveValue: true });
    const router = makeRouter();
    const wrapper = mountLogin({ store, router });
    await triggerLogin(wrapper);

    expect(router.push).toHaveBeenCalledWith('/change-password');
    expect(redirectToRedfishOrHomeMock).not.toHaveBeenCalled();
  });
});
