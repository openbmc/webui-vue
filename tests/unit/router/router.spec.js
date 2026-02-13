/**
 * Unit tests for the router navigation guard (allowRouterToNavigate).
 *
 * Imports the real exported guard and exercises it directly so that the
 * tests stay in sync with implementation changes automatically.
 */
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

// vi.mock calls must come before the router import

const isLoggedInGetter = vi.fn(() => false);
const userPrivilegeGetter = vi.fn(() => '');

vi.mock('@/store', () => ({
  default: {
    getters: new Proxy(
      {},
      {
        get(_, key) {
          if (key === 'authentication/isLoggedIn') return isLoggedInGetter();
          if (key === 'global/userPrivilege') return userPrivilegeGetter();
          return undefined;
        },
      },
    ),
    dispatch: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock('@/router/routes', () => ({ default: [] }));

// Mock redfishRedirect so the guard tests focus purely on guard logic.
// The redirect utilities are tested independently in redfishRedirect.spec.js.
const { mockRedirectToRedfishOrHome, mockGetNextRedirectPath } = vi.hoisted(
  () => ({
    mockRedirectToRedfishOrHome: vi.fn(),
    mockGetNextRedirectPath: vi.fn(),
  }),
);

vi.mock('@/utilities/redfishRedirect', () => ({
  getNextRedirectPath: mockGetNextRedirectPath,
  redirectToRedfishOrHome: mockRedirectToRedfishOrHome,
}));

import { allowRouterToNavigate } from '@/router';

function makeTo(path, query = {}, meta = {}) {
  return { path, query, meta, matched: [] };
}

describe('router guard – already-authenticated user visiting /login', () => {
  beforeEach(() => {
    isLoggedInGetter.mockReturnValue(true);
  });

  afterEach(() => {
    vi.clearAllMocks();
    isLoggedInGetter.mockReset();
    userPrivilegeGetter.mockReset();
  });

  it('calls next(false) then redirectToRedfishOrHome for a Redfish next path', () => {
    mockGetNextRedirectPath.mockReturnValue('/redfish/v1/Systems');

    const next = vi.fn();
    const callOrder = [];
    next.mockImplementation(() => callOrder.push('next'));
    mockRedirectToRedfishOrHome.mockImplementation(() =>
      callOrder.push('redirect'),
    );

    allowRouterToNavigate(makeTo('/login', { next: '/redfish/v1/Systems' }), next, '');

    expect(callOrder).toEqual(['next', 'redirect']);
    expect(next).toHaveBeenCalledWith(false);
    expect(mockRedirectToRedfishOrHome).toHaveBeenCalledWith(
      '/redfish/v1/Systems',
      expect.anything(),
    );
  });

  it('calls next(false) then redirectToRedfishOrHome for the Redfish service root', () => {
    mockGetNextRedirectPath.mockReturnValue('/redfish/v1');

    const next = vi.fn();
    allowRouterToNavigate(makeTo('/login', { next: '/redfish/v1' }), next, '');

    expect(next).toHaveBeenCalledWith(false);
    expect(mockRedirectToRedfishOrHome).toHaveBeenCalledWith(
      '/redfish/v1',
      expect.anything(),
    );
  });

  it('delegates bmcweb-style ?next= (outside hash) via getNextRedirectPath', () => {
    mockGetNextRedirectPath.mockReturnValue('/redfish/v1/Systems');

    const next = vi.fn();
    allowRouterToNavigate(makeTo('/login', {}), next, '');

    expect(mockGetNextRedirectPath).toHaveBeenCalledWith(
      expect.objectContaining({ path: '/login' }),
    );
    expect(next).toHaveBeenCalledWith(false);
    expect(mockRedirectToRedfishOrHome).toHaveBeenCalledWith(
      '/redfish/v1/Systems',
      expect.anything(),
    );
  });

  it('calls next(false) then redirectToRedfishOrHome when next is absent', () => {
    mockGetNextRedirectPath.mockReturnValue(null);

    const next = vi.fn();
    allowRouterToNavigate(makeTo('/login'), next, '');

    expect(next).toHaveBeenCalledWith(false);
    expect(mockRedirectToRedfishOrHome).toHaveBeenCalledWith(
      null,
      expect.anything(),
    );
  });

  it('calls next(false) then redirectToRedfishOrHome for an unsafe external URL', () => {
    mockGetNextRedirectPath.mockReturnValue('https://evil.example.com/steal');

    const next = vi.fn();
    allowRouterToNavigate(
      makeTo('/login', { next: 'https://evil.example.com/steal' }),
      next,
      '',
    );

    expect(next).toHaveBeenCalledWith(false);
    expect(mockRedirectToRedfishOrHome).toHaveBeenCalledWith(
      'https://evil.example.com/steal',
      expect.anything(),
    );
  });
});

describe('router guard – unauthenticated user visiting a protected route', () => {
  afterEach(() => {
    vi.clearAllMocks();
    isLoggedInGetter.mockReset();
    userPrivilegeGetter.mockReset();
  });

  it('redirects to /login when the route requires auth', () => {
    isLoggedInGetter.mockReturnValue(false);

    const next = vi.fn();
    const to = {
      path: '/overview',
      query: {},
      meta: { requiresAuth: true },
      matched: [{ meta: { requiresAuth: true } }],
    };

    allowRouterToNavigate(to, next, '');

    expect(next).toHaveBeenCalledWith('/login');
  });
});
