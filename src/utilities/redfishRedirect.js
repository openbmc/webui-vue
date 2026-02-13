/**
 * Returns true if path is the Redfish service root (/redfish/v1) or a
 * Redfish sub-resource (/redfish/v1/...).  Rejects null/undefined, non-
 * absolute paths, and paths with dot-segments that normalise outside the
 * /redfish/v1 tree (e.g. /redfish/v1/Systems/../../../../admin).
 * @param {string|null|undefined} path
 * @returns {boolean}
 */
export function isRedfishRedirectPath(path) {
  if (typeof path !== 'string' || !path.startsWith('/')) return false;
  try {
    const url = new URL(path, 'https://example.com');
    // Reject protocol-relative paths (//evil.example.com/…) that resolve to
    // a different origin even though they start with '/'.
    if (url.origin !== 'https://example.com') return false;
    return url.pathname === '/redfish/v1' || url.pathname.startsWith('/redfish/v1/');
  } catch {
    return false;
  }
}

/**
 * Returns the `next` redirect target by checking the Vue Router route query
 * first (hash-router style: `/#/login?next=…`) and falling back to the URL
 * search params (bmcweb style: `/login?next=…` outside the hash).
 * @param {import('vue-router').RouteLocationNormalized} route
 * @returns {string|null}
 */
export function getNextRedirectPath(route) {
  const fromQuery = route?.query?.next;
  if (typeof fromQuery === 'string') return fromQuery;
  return new URL(window.location.href).searchParams.get('next');
}

const BLOCKED_SPA = new Set(['login', 'change-password', 'page-not-found']);

/**
 * Navigates to a Redfish path via a full-page navigation, to a valid SPA
 * route via the Vue Router, or falls back to the SPA home route.
 * @param {string|null|undefined} path
 * @param {import('vue-router').Router} router
 */
export function redirectToRedfishOrHome(path, router) {
  if (isRedfishRedirectPath(path)) {
    window.location.assign(`${window.location.origin}${path}`);
    return;
  }
  if (path) {
    try {
      const resolved = router.resolve(path);
      if (resolved.matched.length > 0 && !BLOCKED_SPA.has(resolved.name)) {
        router.push(path);
        return;
      }
    } catch {
      // fall through to home
    }
  }
  router.push('/');
}
