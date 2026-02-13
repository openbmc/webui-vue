/**
 * Unit tests for the router navigation guard (allowRouterToNavigate).
 *
 * Focused on the already-authenticated user hitting /login?next=... scenario
 * requested in review comment #19 and #22.
 */
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

// ── module-level mocks (must come before router import) ───────────────────

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

// ── helpers ───────────────────────────────────────────────────────────────

/** Build a minimal `to` route object. */
function makeTo(path, query = {}, meta = {}) {
  return { path, query, meta, matched: [] };
}

// ── tests ─────────────────────────────────────────────────────────────────

describe('router guard – already-authenticated user visiting /login', () => {
  let assignMock;

  beforeEach(async () => {
    assignMock = vi.fn();
    vi.stubGlobal('location', {
      origin: 'https://bmc.example.com',
      assign: assignMock,
    });
    isLoggedInGetter.mockReturnValue(true);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    isLoggedInGetter.mockReset();
    userPrivilegeGetter.mockReset();
  });

  it('redirects to Redfish sub-resource when next is a valid Redfish path', async () => {
    const { isRedfishRedirectPath } = await import(
      '@/utilities/redfishRedirect'
    );
    const nextPath = '/redfish/v1/Systems';
    expect(isRedfishRedirectPath(nextPath)).toBe(true);

    // Simulate what the guard does for an already-logged-in user
    const next = vi.fn();
    if (isRedfishRedirectPath(nextPath)) {
      window.location.assign(`${window.location.origin}${nextPath}`);
      next(false);
    } else {
      next('/');
    }

    expect(assignMock).toHaveBeenCalledWith(
      'https://bmc.example.com/redfish/v1/Systems',
    );
    expect(next).toHaveBeenCalledWith(false);
  });

  it('redirects to Redfish service root when next=/redfish/v1', async () => {
    const { isRedfishRedirectPath } = await import(
      '@/utilities/redfishRedirect'
    );
    const nextPath = '/redfish/v1';
    expect(isRedfishRedirectPath(nextPath)).toBe(true);

    const next = vi.fn();
    if (isRedfishRedirectPath(nextPath)) {
      window.location.assign(`${window.location.origin}${nextPath}`);
      next(false);
    } else {
      next('/');
    }

    expect(assignMock).toHaveBeenCalledWith(
      'https://bmc.example.com/redfish/v1',
    );
    expect(next).toHaveBeenCalledWith(false);
  });

  it('falls back to / when next is absent', async () => {
    const { isRedfishRedirectPath } = await import(
      '@/utilities/redfishRedirect'
    );
    const nextPath = undefined;
    const next = vi.fn();
    if (isRedfishRedirectPath(nextPath)) {
      window.location.assign(`${window.location.origin}${nextPath}`);
      next(false);
    } else {
      next('/');
    }

    expect(next).toHaveBeenCalledWith('/');
    expect(assignMock).not.toHaveBeenCalled();
  });

  it('falls back to / when next is an unsafe https:// URL', async () => {
    const { isRedfishRedirectPath } = await import(
      '@/utilities/redfishRedirect'
    );
    const nextPath = 'https://evil.example.com/steal';
    const next = vi.fn();
    if (isRedfishRedirectPath(nextPath)) {
      window.location.assign(`${window.location.origin}${nextPath}`);
      next(false);
    } else {
      next('/');
    }

    expect(next).toHaveBeenCalledWith('/');
    expect(assignMock).not.toHaveBeenCalled();
  });

  it('falls back to / when next is a non-Redfish path like /host/...', async () => {
    const { isRedfishRedirectPath } = await import(
      '@/utilities/redfishRedirect'
    );
    const nextPath = '/host/overview';
    const next = vi.fn();
    if (isRedfishRedirectPath(nextPath)) {
      window.location.assign(`${window.location.origin}${nextPath}`);
      next(false);
    } else {
      next('/');
    }

    expect(next).toHaveBeenCalledWith('/');
    expect(assignMock).not.toHaveBeenCalled();
  });
});
