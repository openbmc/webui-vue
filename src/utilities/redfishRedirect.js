/**
 * Returns true if path is the Redfish service root (/redfish/v1) or a
 * Redfish sub-resource (/redfish/v1/...).  Rejects null/undefined and any
 * path that could escape to a different origin.
 * @param {string|null|undefined} path
 * @returns {boolean}
 */
export function isRedfishRedirectPath(path) {
  if (!path) return false;
  return path === '/redfish/v1' || path.startsWith('/redfish/v1/');
}

/**
 * Navigates to a Redfish path via a full-page navigation, or falls back to
 * the SPA home route when path is not a safe Redfish path.
 * @param {string|null|undefined} path
 * @param {import('vue-router').Router} router
 */
export function redirectToRedfishOrHome(path, router) {
  if (isRedfishRedirectPath(path)) {
    window.location.assign(`${window.location.origin}${path}`);
  } else {
    router.push('/');
  }
}
