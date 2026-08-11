# Vite Build Tooling Review Skill — webui-vue

**Vite 6.4.1** with `@vitejs/plugin-vue`, `vite-svg-loader`,
`vite-plugin-compression`, `@vitejs/plugin-basic-ssl`. Config: `vite.config.js`.
Node `>=18.18.0`.

## Repo-specific config to understand

- **Path alias** `@ → src` (must match `tsconfig.json` `paths`). Keep both in
  sync.
- **Directory index resolution**: a custom `resolveDirectoryIndex` plugin
  resolves `import '@/components/Foo'` to `Foo/index.js` (Webpack-style). New
  folder-modules should keep an `index.js` barrel to match existing imports.
- **Environment customization** via `.env` flags: `VITE_ENV_NAME`,
  `CUSTOM_STYLES`, `CUSTOM_STORE`, `CUSTOM_ROUTER`, `CUSTOM_APP_NAV`. These swap
  in files under `src/env/`. Changes here affect downstream/brand builds —
  review carefully.
- **SCSS injection**: `scssAdditionalData` prepends helper imports to every SCSS
  file. Don't duplicate those imports in components.
- Dev server uses basic SSL; `BASE_URL` from `.env.development.local` proxies to
  the BMC.

## Review points

- New env flags / aliases documented and mirrored in `tsconfig.json` where
  relevant.
- No secrets in committed `.env*` files (only `.env.development.local`, which is
  local).
- Build-affecting changes (plugins, chunking, compression) justified; watch
  bundle size.
- Don't break the `index.js` barrel convention relied on by the directory-index
  plugin.
- Avoid importing dev-only tooling into runtime code.

## Review checklist

- [ ] `@` alias usage consistent; `tsconfig` paths kept in sync.
- [ ] Folder-modules keep an `index.js` barrel (directory-index plugin).
- [ ] No SCSS helper imports duplicated (already injected globally).
- [ ] No secrets committed in `.env*`.
- [ ] `src/env/**` / custom-flag changes reviewed for brand-build impact.
- [ ] Bundle-size / plugin changes justified.
