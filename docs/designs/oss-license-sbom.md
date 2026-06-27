# [Webui-vue] Offline build + OSS license/SBOM via Yocto-native recipes

Author: Jason Westover (Discord: jasonwestover)

Created: June 26, 2026

Revised: July 7, 2026

## Problem

Two problems, one root cause — the `webui-vue` recipe is not Yocto-native:

1. **Offline build.** `webui-vue` is the only `meta-phosphor` recipe that needs
   a live network at build time. It sets `do_compile[network] = "1"` and runs an
   online `npm install` against registry.npmjs.org at compile. Air-gapped labs,
   mirror-only sites, and reproducible farms cannot build a firmware image
   containing the Web UI.
2. **SBOM / license visibility.** The recipe declares only
   `LICENSE = "Apache-2.0"`, yet the shipped SPA bundles ~80 production npm
   packages. Image-level SBOM (`create-spdx`) cannot see inside that npm graph,
   so the firmware SBOM under-reports what it actually ships.

## Decision

**How should `bitbake webui-vue` build offline and report per-dependency
licenses, using Yocto's intended mechanisms?**

**Recommendation: teach `autobump` to generate per-component Yocto recipes from
`package-lock.json`.** This is the "do what Yocto intends" path and matches
Patrick's "fix the recipe" direction.

Two coordinated changes:

1. **`autobump` generates the `webui-vue` dependency recipes.** As a
   `webui-vue`-specific special case (no other recipe's build changes), it walks
   the **production** tree of `package-lock.json` and generates/updates one
   ordinary Yocto recipe per shipped npm package under `meta-phosphor` — each
   with its own `SRC_URI` + `SRCREV` (or registry tarball + checksum) and
   `LICENSE`.
2. **The `webui-vue` recipe is rewritten to consume them.** It drops
   `do_compile[network]` and the online `npm install`, adds `DEPENDS` on the
   generated component recipes, and — since Yocto has already fetched and
   unpacked each dependency — assembles them into a `node_modules` tree at build
   time before running `npm run build` (Vite) fully offline.

There is **no separate pre-fetch step** in `webui-vue`: each component recipe
does its own normal `do_fetch`, so every dependency is already in `DL_DIR` / the
recipe sysroot by compile time. The main piece to prototype is _how_
`node_modules` is assembled from the DEPENDS — e.g. seeding an offline npm cache
and running `npm ci --offline`, versus staging the dependency tree directly.

Consequences:

- **Offline build works** — every component fetches like any other recipe, so
  air-gap is just normal `DL_DIR` mirroring. No `do_compile[network]`, no online
  `npm install`, no `nodejs-native` at compile.
- **SBOM comes for free** — each generated recipe carries its own `LICENSE`, so
  `create-spdx` produces a correct per-dependency image SBOM with no extra
  tooling.
- **webui-vue stays a plain npm project** — `devtool modify` keeps working, and
  contributors do not need specialized Web UI build knowledge. The "magic" lives
  in `autobump` + `meta-phosphor`, not in `webui-vue` git.
- **Overridable** — downstream can replace any single component in a meta layer.

The recipe approach is more upfront work but lands both goals through standard
Yocto plumbing.

## Scope of work

- **`openbmc-build-scripts` (`autobump`):** lockfile → recipe generator;
  special-case `webui-vue`, production/non-dev packages only.
- **`meta-phosphor`:** the generated component recipes + a slimmed `webui-vue`
  recipe that builds Vite offline against the Yocto-fetched dependencies.
- **`webui-vue`:** lockfile hygiene only —
  [91791](https://gerrit.openbmc.org/c/openbmc/webui-vue/+/91791/) moves
  `@vue/vue3-jest` to `devDependencies` so the production tree is ~80 packages
  (not ~470). Abandon the repo-root CycloneDX + git-hook effort
  ([91792](https://gerrit.openbmc.org/c/openbmc/webui-vue/+/91792/)).

## Alternatives considered

| Approach                                                                                                     | Verdict                                                                                                                                                                                                 |
| ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Per-component recipes via `autobump`** (recommended)                                                       | Yocto-native; offline build + SBOM for free; `devtool modify` preserved                                                                                                                                 |
| Pre-built `dist/` committed to `webui-vue` git                                                               | **Rejected** — binaries in git; asks everyone to trust one build; hard to distribute; needs specialized build knowledge; breaks `devtool modify`                                                        |
| Ad-hoc npm pre-fetch (`npmsw://` / shrinkwrap, or `npm --ignore-scripts` / `npm-pack-all`) then offline Vite | **Deferred** — `npmsw` / `npm.bbclass` disabled on OpenBMC master; still requires an online pre-fetch step; bespoke machinery. Per-component recipes get the same offline result through standard fetch |
| Repo-root CycloneDX + git-hook regeneration (91792)                                                          | **Abandoned** — wrong layer; SBOM belongs in the meta/autobump path                                                                                                                                     |
| Status quo: `do_compile[network] = "1"` + online `npm install`                                               | **Reject** — fails offline goal; no SBOM                                                                                                                                                                |
| Downstream-only `bbappend` that generates an npm SBOM and merges it into the image SBOM                      | **Fallback** — satisfies an SBOM-only need, but does not fix the offline build and is not the upstream fix                                                                                              |

## Notes / open items

- `npm.bbclass` did not exist when the original recipe was written, does not
  play nicely with `-native`, and is disabled for `allarch`. Making it work may
  need an upstream `npm-allarch`-style class — but the per-component-recipe
  approach sidesteps that entirely.
- The `npm` / `npmsw` fetchers are disabled on OpenBMC master
  ([YOCTO #16105](https://git.yoctoproject.org/cgit/cgit.cgi/poky/commit/?id=355cd226));
  a Bootlin re-enable patch is
  [in review](https://patchwork.yoctoproject.org/project/bitbake/patch/20260610-dev-tprrt-fix-npm-v1-1-9bf501d4ee0e@bootlin.com/),
  not merged.
- SBOM is the secondary goal; offline build is primary. If only the SBOM
  matters, a `bbappend` fallback may be sufficient on its own.
- Get Gerrit CI passing first (fix the `run-ci` invocation so unit tests run) so
  review can focus on the design rather than typos.

## References

- [`webui-vue_git.bb`](https://github.com/openbmc/openbmc/blob/master/meta-phosphor/recipes-phosphor/webui/webui-vue_git.bb)
  (documents the online-build gap)
- [91791](https://gerrit.openbmc.org/c/openbmc/webui-vue/+/91791/) — dependency
  hygiene; [91792](https://gerrit.openbmc.org/c/openbmc/webui-vue/+/91792/) —
  abandoned CycloneDX/git-hook approach
- [Yocto SBOM](https://docs.yoctoproject.org/dev/dev-manual/sbom.html),
  [Yocto npm tips](https://wiki.yoctoproject.org/wiki/TipsAndTricks/NPM),
  [SPDX licenses](https://spdx.org/licenses/)
