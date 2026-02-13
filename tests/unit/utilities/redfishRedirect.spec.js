import { describe, it, expect } from 'vitest';
import {
  isRedfishRedirectPath,
  redirectToRedfishOrHome,
} from '@/utilities/redfishRedirect';
import { vi } from 'vitest';

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
});

describe('redirectToRedfishOrHome', () => {
  it('calls window.location.assign for a Redfish path', () => {
    const assign = vi.fn();
    vi.stubGlobal('location', {
      origin: 'https://bmc.example.com',
      assign,
    });
    const router = { push: vi.fn() };

    redirectToRedfishOrHome('/redfish/v1/Systems', router);

    expect(assign).toHaveBeenCalledWith(
      'https://bmc.example.com/redfish/v1/Systems',
    );
    expect(router.push).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });

  it('calls window.location.assign for the Redfish service root', () => {
    const assign = vi.fn();
    vi.stubGlobal('location', {
      origin: 'https://bmc.example.com',
      assign,
    });
    const router = { push: vi.fn() };

    redirectToRedfishOrHome('/redfish/v1', router);

    expect(assign).toHaveBeenCalledWith('https://bmc.example.com/redfish/v1');
    vi.unstubAllGlobals();
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
