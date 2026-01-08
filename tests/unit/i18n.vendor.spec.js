// How to run this test in isolation:
//   npm run test:unit -- i18n.vendor.spec.js
// This verifies vendor overlays (e.g., nvidia shared folder) and vendor-root fallback
// without requiring component mounts or full app boot.

import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';

describe('i18n vendor overlays', () => {
  const ORIGINAL_ENV = { ...import.meta.env };

  beforeEach(() => {
    vi.resetModules();
    // Ensure default locale is deterministic for the test
    window.localStorage.setItem('storedLanguage', 'en-US');
  });

  afterEach(() => {
    // Restore env (Vitest doesn't mutate import.meta.env the same way as Jest/process.env)
    vi.unstubAllEnvs();
  });

  test('falls back to vendor root overlays when env has hyphenated suffix', async () => {
    // Simulate running in nvidia-gb but having overlays only in src/env/locales/nvidia
    vi.stubEnv('VITE_ENV_NAME', 'nvidia-gb');

    const { createI18nInstance } = await import('@/i18n');
    const vendorEn = await import('@/env/locales/nvidia/en-US.json');
    const stubLoader = () => ({ 'en-US': vendorEn.default || vendorEn });
    const i18nInstance = createI18nInstance('nvidia-gb', 'en-US', stubLoader);

    // System HGX dump is NVIDIA-specific and defined in src/env/locales/nvidia/en-US.json
    const translated = i18nInstance.global.t(
      'pageDumps.dumpTypes.systemHgxDump',
    );
    expect(translated).toBe('System [HGX] dump (disruptive)');
  });

  test('base locales do not contain vendor-only keys', async () => {
    vi.stubEnv('VITE_ENV_NAME', '');

    const { createI18nInstance } = await import('@/i18n');
    const i18nInstance = createI18nInstance(undefined, 'en-US');
    // Suppress the expected "Not found" warning since we're intentionally testing missing keys
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const translated = i18nInstance.global.t(
      'pageDumps.dumpTypes.systemHgxDump',
    );
    warnSpy.mockRestore();
    // When no env overlays are loaded, accessing vendor-only keys should return the key path
    expect(translated).toBe('pageDumps.dumpTypes.systemHgxDump');
  });
});
