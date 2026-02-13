import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  isRedfishRedirectPath,
  getNextRedirectPath,
  redirectToRedfishOrHome,
} from '@/utilities/redfishRedirect';

describe('isRedfishRedirectPath', () => {
  it('accepts the Redfish service root exactly', () => {
    expect(isRedfishRedirectPath('/redfish/v1')).toBe(true);
  });

  it('accepts Redfish sub-resources', () => {
    expect(isRedfishRedirectPath('/redfish/v1/')).toBe(true);
    expect(isRedfishRedirectPath('/redfish/v1/Systems')).toBe(true);
    expect(isRedfishRedirectPath('/redfish/v1/Systems/system')).toBe(true);
  });

  it('rejects null and undefined', () => {
    expect(isRedfishRedirectPath(null)).toBe(false);
    expect(isRedfishRedirectPath(undefined)).toBe(false);
    expect(isRedfishRedirectPath('')).toBe(false);
  });

  it('rejects WebUI SPA routes', () => {
    expect(isRedfishRedirectPath('/')).toBe(false);
    expect(isRedfishRedirectPath('/overview')).toBe(false);
  });

  it('rejects non-Redfish absolute paths like /host/...', () => {
    expect(isRedfishRedirectPath('/host/overview')).toBe(false);
    expect(isRedfishRedirectPath('/host/login')).toBe(false);
  });

  it('rejects paths that only share a prefix', () => {
    expect(isRedfishRedirectPath('/redfish/v1-fake')).toBe(false);
    expect(isRedfishRedirectPath('/redfish/v10')).toBe(false);
  });

  it('rejects absolute URLs that could redirect to another origin', () => {
    expect(isRedfishRedirectPath('https://evil.example.com/redfish/v1')).toBe(
      false,
    );
    expect(isRedfishRedirectPath('//evil.example.com/redfish/v1')).toBe(false);
  });

  it('rejects paths with dot-segments that escape the /redfish/v1 tree', () => {
    expect(
      isRedfishRedirectPath('/redfish/v1/Systems/../../../../admin'),
    ).toBe(false);
    expect(isRedfishRedirectPath('/redfish/v1/../admin')).toBe(false);
  });
});

describe('getNextRedirectPath', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('returns next from the Vue Router query (hash-router style)', () => {
    const route = { query: { next: '/redfish/v1/Systems' } };
    expect(getNextRedirectPath(route)).toBe('/redfish/v1/Systems');
  });

  it('returns next from window.location search params (bmcweb style)', () => {
    vi.stubGlobal('location', {
      href: 'https://bmc.example.com/login?next=/redfish/v1/Systems',
    });
    const route = { query: {} };
    expect(getNextRedirectPath(route)).toBe('/redfish/v1/Systems');
  });

  it('prefers the route query over the URL search params', () => {
    vi.stubGlobal('location', {
      href: 'https://bmc.example.com/login?next=/redfish/v1/Other',
    });
    const route = { query: { next: '/redfish/v1/Systems' } };
    expect(getNextRedirectPath(route)).toBe('/redfish/v1/Systems');
  });

  it('returns null when next is absent in both sources', () => {
    vi.stubGlobal('location', {
      href: 'https://bmc.example.com/#/login',
    });
    const route = { query: {} };
    expect(getNextRedirectPath(route)).toBeNull();
  });
});

describe('redirectToRedfishOrHome', () => {
  let assign;

  beforeEach(() => {
    assign = vi.fn();
    vi.stubGlobal('location', { origin: 'https://bmc.example.com', assign });
  });

  afterEach(() => vi.unstubAllGlobals());

  it('calls window.location.assign for a Redfish path', () => {
    const router = { push: vi.fn() };

    redirectToRedfishOrHome('/redfish/v1/Systems', router);

    expect(assign).toHaveBeenCalledWith(
      'https://bmc.example.com/redfish/v1/Systems',
    );
    expect(router.push).not.toHaveBeenCalled();
  });

  it('calls window.location.assign for the Redfish service root', () => {
    const router = { push: vi.fn() };

    redirectToRedfishOrHome('/redfish/v1', router);

    expect(assign).toHaveBeenCalledWith('https://bmc.example.com/redfish/v1');
  });

  it('calls router.push with a valid SPA route', () => {
    const router = {
      push: vi.fn(),
      resolve: vi.fn().mockReturnValue({ matched: [{}] }),
    };

    redirectToRedfishOrHome('/overview', router);

    expect(router.push).toHaveBeenCalledWith('/overview');
    expect(assign).not.toHaveBeenCalled();
  });

  it('falls back to "/" for a path that does not match any SPA route', () => {
    const router = {
      push: vi.fn(),
      resolve: vi.fn().mockReturnValue({ matched: [] }),
    };

    redirectToRedfishOrHome('/host/overview', router);

    expect(router.push).toHaveBeenCalledWith('/');
  });

  it('calls router.push("/") for a null next path', () => {
    const router = { push: vi.fn() };
    redirectToRedfishOrHome(null, router);
    expect(router.push).toHaveBeenCalledWith('/');
  });

  it('calls router.push("/") for an unsafe next= value', () => {
    const router = { push: vi.fn() };
    redirectToRedfishOrHome('https://evil.example.com/steal', router);
    expect(router.push).toHaveBeenCalledWith('/');
  });
});
