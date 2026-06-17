# OpenAPI codegen — typecheck performance and CI

Once a scoped Redfish SDK is committed under `src/client/`, typechecking the
generated types dominates cold CI build time. The DMTF schema produces deeply
nested unions and `as const` enums that are expensive for TypeScript to analyse,
even when generation is scoped to a handful of BMC operations.

## Scripts

| Script                 | Command                       | When                                  |
| ---------------------- | ----------------------------- | ------------------------------------- |
| `npm run typecheck`    | `vue-tsc --noEmit`            | Local dev (authoritative)             |
| `npm run typecheck:ci` | `golar typecheck`             | CI / clean checkout (~3× faster cold) |
| `npm run build`        | `vite build`                  | Local / Yocto release (unchanged)     |
| `npm run build:ci`     | `typecheck:ci` ∥ `vite build` | CI once `src/client/` is committed    |

`golar.config.ts` at the repo root mirrors the `tsconfig.json` include globs.
`tsconfig.json` omits deprecated `baseUrl` (required by golar / TS 7); `@/*`
paths use explicit `./src/*` prefixes instead.

## Why the split

- **`vue-tsc`** is the authoritative checker and matches editor tooling.
- **`golar`** (~0.1.x) parallelises checks via `@vue/language-core` and is
  suitable for **cold CI runs** where incremental cache is empty.
- **`golar` has no incremental rebuild** — do not replace local `vue-tsc` with
  `golar` for day-to-day development.

Benchmarks from the reference Redfish Vue integration (scoped SDK, macOS arm64,
June 2026):

| Tool                                   | Cold typecheck |
| -------------------------------------- | -------------- |
| `vue-tsc --noEmit` / `--build --force` | ~4 min         |
| `golar typecheck`                      | ~73 s          |

Re-benchmark on this repo once `src/client/` lands in Change 2+.

## Future: TypeScript 7.1 + Vue

The durable fix is native TypeScript (`tsgo` / TS 7 `tsc`) with Vue SFC support
via the TS 7.1 plugin API
([typescript-go#2824](https://github.com/microsoft/typescript-go/issues/2824),
[language-tools#5381](https://github.com/vuejs/language-tools/issues/5381)).
Until then, use `npm run build:ci` in Jenkins for cold builds.
