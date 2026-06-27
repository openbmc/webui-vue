# [Webui-vue] Offline Build + OSS license manifest and SBOM

Author: Jason Westover (Discord: jasonwestover)

Created: June 26, 2026

Revised: June 28, 2026

## Problem Description

### The long-standing offline-build problem

webui-vue is the **only** OpenBMC `meta-phosphor` recipe that requires a live
network during the firmware image build. The upstream recipe documents the gap
([`webui-vue_git.bb`](https://github.com/openbmc/openbmc/blob/master/meta-phosphor/recipes-phosphor/webui/webui-vue_git.bb)):

> This recipe requires online access to build, as it uses NPM for dependency
> management and resolution.

Patrick Williams added the following when wiring in `python3native` (5 Jan 2024,
[openbmc/openbmc@3fc1d725](https://github.com/openbmc/openbmc/commit/3fc1d7253cd91f776585b1866a8fdc1f7cdbb318)):

> Ideally this recipe would use npm.bbclass, but it doesn't. Since npm uses
> python3, we need to inherit this to get the Yocto version of python3 instead
> of the hosttools one.

In practice the recipe has never been **fully Yocto-fied**: it does not prefetch
npm dependencies at `do_fetch`, does not use `npm.bbclass` / shrinkwrap offline
compile, and instead sets `do_compile[network] = "1"` and runs online
`npm install` against registry.npmjs.org at **compile** time. Every other
phosphor component is fetched as source (or installs pre-staged files) and
builds offline once `SRC_URI` material is in `DL_DIR` or the recipe file
directory.

This has been a known pain point for years: air-gapped labs, mirror-only sites,
and reproducible farm builds cannot produce a firmware image containing the Web
UI without outbound npm access on the BitBake worker. There is no
prefetch-then-build-offline split today — npm runs only at compile, not at
fetch.

**Fix:** two strategies — **A. pre-built dist** (build in webui-vue, Yocto
installs static assets) and **B. pre-fetch npm** (offline Vite compile inside
BitBake). Details, sub-variants, and comparison are in
[Build strategies](#build-strategies-for-reviewers).

### OSS license and SBOM visibility (same recipe fix)

Separately, the shipped Vite bundle pulls in ~**80** production npm packages
(after [91791](https://gerrit.openbmc.org/c/openbmc/webui-vue/+/91791/)) and
tree-shakes them into `js/app.[hash].js`, but the recipe declares only
`LICENSE = "Apache-2.0"`. Image-level SBOM tooling (`create-spdx`) cannot see
inside the bundled npm graph. Fixing the recipe for offline build is the right
place to install per-dependency license metadata and ship `THIRD_PARTY_NOTICES`
in `${datadir}/www`.

Goals:

1. **Disconnected OpenBMC builds** — no live registry.npmjs.org during
   `bitbake webui-vue` once a strategy is implemented.
2. **Proper SBOM / license reporting** — compound recipe `LICENSE`, installed
   SPDX manifest (~80 production packages), `create-spdx` visibility.
3. **Browser-facing attribution** — `THIRD_PARTY_NOTICES` in the static Web UI.

Non-goals:

- SBOM entries for `devDependencies` (Vite, sass, eslint, etc.)
- Vulnerability scanning in the SBOM
- Repo-root CycloneDX files or git-hook-driven SBOM regeneration (rejected in
  earlier review — fix the Yocto recipe instead)

## Background

### Production tree vs full lockfile

| Scope                                                                                                       | Count                        | Used for                                                                                                             |
| ----------------------------------------------------------------------------------------------------------- | ---------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| **Production `dependencies` tree** (after [91791](https://gerrit.openbmc.org/c/openbmc/webui-vue/+/91791/)) | **~80 packages** (21 direct) | SBOM, compound `LICENSE`, `THIRD_PARTY_NOTICES` — OSS **bundled into the firmware SPA**                              |
| **Full `package-lock.json`**                                                                                | **~2,686 entries**           | **Pre-fetch build path only** — offline `npm ci --include=dev` needs Vite and other build tools in `devDependencies` |

Do not conflate these counts: a ~80-package SBOM does **not** imply a
~80-tarball pre-fetch.

**Why 91791 is a prerequisite:** today `@vue/vue3-jest` (a unit-test tool) is
mis-filed under `dependencies`, dragging Jest/Babel into the production tree and
inflating it to ~**470** packages. Moving it to `devDependencies` is what yields
the ~80-package production figure the SBOM and compound `LICENSE` are scoped to.
The full `package-lock.json` is `lockfileVersion: 3`.

### OpenBMC context

- Confirms the offline-build problem above: **no other** `meta-phosphor` recipe
  uses `do_compile[network]` for npm.
- **`npmsw://` / `npm://` fetchers are disabled today** on OpenBMC master
  ([YOCTO #16105](https://git.yoctoproject.org/cgit/cgit.cgi/poky/commit/?id=355cd226));
  a re-enable fix is
  [in review only](https://patchwork.yoctoproject.org/project/bitbake/patch/20260610-dev-tprrt-fix-npm-v1-1-9bf501d4ee0e@bootlin.com/)
  (Bootlin, June 2026) — **not merged into OpenBMC master**.
- **SBOM does not require `npmsw` or `npm.bbclass`.** Image SBOM comes from
  recipe `LICENSE`, installed license files, and Yocto `create-spdx` (distro
  default).
- **`npm.bbclass` (`inherit npm`)** is the Yocto-native offline npm **build**
  path. It pairs with shrinkwrap fetch (`npmsw://` when enabled) and enforces
  offline compile. Default `do_install` ships `node_modules` to the rootfs —
  **not** what webui-vue needs — but **`inherit npm` for strategy B** is still
  the intended upstream pattern, with **`do_compile` / `do_install` overrides**
  to run Vite and install `${S}/dist` to `${datadir}/www`. Not applicable to
  strategy **A** (pre-built).
- **No upstream precedent** for pre-built SPA dist bundles or npm prefetch in
  `meta-phosphor`. webui-vue would be the first either way.

References:
[Yocto SBOM](https://docs.yoctoproject.org/dev/dev-manual/sbom.html),
[Yocto npm tips](https://wiki.yoctoproject.org/wiki/TipsAndTricks/NPM),
[SPDX licenses](https://spdx.org/licenses/).

## Build strategies (for reviewers)

All paths share the same **SBOM generator** (lockfile → licenses `.inc` + SPDX
JSON + `THIRD_PARTY_NOTICES`).

```text
A. Pre-built dist                    B. Pre-fetch npm, build in Yocto
   ├── A.1 Check into webui-vue git      ├── B.1 Tarball .inc (OpenBMC today)
   ├── A.2 Release tags only               └── B.2 npmsw:// (after BitBake merge)
   └── A.3 CI build + host elsewhere
```

### Strategy comparison (A vs B)

|                               | **A. Pre-built dist**                                         | **B. Pre-fetch npm**                                                               |
| ----------------------------- | ------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| **Summary**                   | Build UI in webui-vue; recipe **installs** `dist/`            | Prefetch npm at **`do_fetch`**; offline **`npm ci` + Vite** in BitBake             |
| **Fit with OpenBMC**          | Like other recipes — git in, files out; **no npm on builder** | **New to OpenBMC** — no meta recipe prefetches npm today                           |
| **Yocto end state (B only)**  | —                                                             | **`npmsw://` + `inherit npm`** + Vite/`dist` overrides; **B.1** bridges until then |
| **OpenBMC builder runs npm?** | **No**                                                        | Yes (offline after fetch)                                                          |
| **Network at Yocto fetch**    | Git only ( + `yocto/` at `SRCREV`)                            | Git + **~2,686** registry tarballs                                                 |
| **Network at Yocto compile**  | None                                                          | None (after fetch)                                                                 |
| **Air-gap mirror target**     | Git @ `SRCREV`                                                | **`DL_DIR`** (~2,686 files)                                                        |
| **Recipe**                    | Drop `nodejs-native`, `do_compile[network]`                   | Keep `nodejs-native`; `PACKAGECONFIG[source]` optional                             |
| **SBOM scope**                | ~**80** production packages                                   | ~**80** (same generator)                                                           |
| **On OpenBMC master today**   | **Yes**                                                       | **Yes** (B.1); B.2 blocked (`npmsw` disabled)                                      |

**Site operator view:** **A** — npm never touches the firmware farm; same model
as other phosphor recipes, and the online requirement is **removed** entirely.
**B** — npm stays in the build chain; it does **not** remove the online
requirement, it only **defers** it from every compile to a one-time `do_fetch`
(which the operator must still run connected, then mirror **`DL_DIR`** to the
air-gapped farm). An offline farm still cannot build from a cold `DL_DIR`. B.1
and B.2 are the same operator experience.

**Status quo (reject):** `do_compile[network] = "1"` + online `npm install` —
fails Goal 1; no SBOM improvement.

---

## A. Pre-built dist

Vite runs **outside** BitBake (developer machine or Gerrit CI). The OpenBMC
recipe installs a committed bundle — no `nodejs-native`, no npm at compile.

### A.1 — Check into webui-vue git

Pre-built artifacts live in **webui-vue** at the same commit openbmc `SRCREV`
points to. The recipe uses **git-only** `SRC_URI`; autobump continues to bump
`SRCREV` — each bumped commit must already contain a matching `yocto/` tree.

**Layout:**

```text
webui-vue/
└── yocto/
    ├── webui-vue-dist.tar.gz           # dist/ + THIRD_PARTY_NOTICES
    ├── bundle.sha256                   # CI freshness gate
    ├── webui-vue-npm-licenses.inc      # compound LICENSE for recipe
    ├── webui-vue-npm-dependencies.spdx.json
    └── THIRD_PARTY_NOTICES.md          # source copy; also inside tarball
```

**Flow:**

```text
  Contributor / Gerrit CI (connected)     OpenBMC (offline)
  npm ci + npm run build                        |
  pack yocto/webui-vue-dist.tar.gz              v
  run generator → yocto/* (same CL)      git fetch @ SRCREV
                                         do_install from ${S}/yocto/
                                         (no do_compile[network])
```

**When to regenerate `yocto/`**

Regenerating on lockfile changes alone is **insufficient** — UI changes without
`package-lock.json` updates still change `dist/`. **A.2** (release tags) applies
the same rules at tag cut instead of on every master CL (see below).

| Change type                                                | Update dist tarball? | Update SBOM `.inc` / JSON?      |
| ---------------------------------------------------------- | -------------------- | ------------------------------- |
| `src/`, Vite config, env templates, `package.json` scripts | **Yes**              | Only if production tree changed |
| `package-lock.json` / `dependencies`                       | **Yes**              | **Yes**                         |
| Docs-only                                                  | No                   | No                              |

**Enforcement:** extend Gerrit CI to run `npm ci && npm run build`, repack the
tarball, and compare against `yocto/bundle.sha256`. The patchset **fails if
stale** — the contributor regenerates `yocto/` in the **same change** as
build-affecting source edits.

**Trade-offs:**

- **Pro:** simplest air-gap story; no artifact host; git-only recipe; autobump
  unchanged.
- **Con:** git churn on functional CLs (binary tarball). Mitigations: **Git
  LFS** for `webui-vue-dist.tar.gz`; separate commits in one topic for code vs
  `yocto/`; **A.2** or **A.3** if blobs on master are unacceptable.

### A.2 — Release tags only

Same artifact layout and git-only openbmc recipe as **A.1**, but **`yocto/` is
committed only on release tags**, not on every master merge. Master stays
source-only; tagged commits (or tag pointers) carry the dist tarball + SBOM
sidecars.

```text
  webui-vue master (no yocto/ churn)     tag vX.Y → yocto/* added
         |                                      |
         +--------------------------------------+
                                                v
  openbmc SRCREV → tag commit (or tag ref)  git fetch → ${S}/yocto/
```

**When to tag:** periodic releases or explicit maintainer cut (not lockfile-only
— any release tag must match a build-affecting snapshot, same rules as A.1).

**Trade-offs:**

- **Pro:** avoids binary churn on master; autobump can track tag commits or a
  release branch policy agreed in review.
- **Con:** webui-vue **does not use release tags today** — would need a release
  process; master-tip firmware builds need **A.1** or waiting for the next tag;
  tag/OpenBMC `SRCREV` coordination adds overhead.

### A.3 — CI build + host elsewhere

Artifacts live outside webui-vue git:

- Jenkins builds on merge → bot CL adds tarball + SBOM files to
  **`meta-phosphor/recipes-phosphor/webui/webui-vue/`** in openbmc (paired with
  autobump), **or**
- stable HTTP `SRC_URI` + site mirror policy.

Requires new automation. **No existing phosphor recipe** hosts application
bundles this way today.

---

## B. Pre-fetch npm, build in Yocto

For sites that require Vite compilation inside BitBake. Could be exposed as
`PACKAGECONFIG[source]`. Air-gap cost: ~2,686 npm tarballs in **`DL_DIR`** (vs a
single dist tarball under strategy **A**).

### Fetch artifact layout (B.1 and B.2)

| What                          | Where                                                                                                       |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------- |
| In git (recipe dir)           | `webui-vue-npm-packages.inc` (B.1) or `npm-shrinkwrap.json` (B.2); SBOM sidecars — **not** the npm tarballs |
| After `do_fetch` (persistent) | Each npm tarball in **`DL_DIR`** (`downloads/`)                                                             |
| Git checkout                  | **`${S}`** under **`${WORKDIR}`**                                                                           |
| After `npm ci --offline`      | **`${S}/node_modules/`**                                                                                    |
| After `npm run build`         | **`${S}/dist/`** → **`${datadir}/www`** on install                                                          |

Air-gap: connected `bitbake -c fetch webui-vue` (with `PACKAGECONFIG=source`),
then rsync **`DL_DIR`** to the offline farm.

### B.1 — Tarball `.inc` (OpenBMC master today)

Bridge until `npmsw://` is merged. Hand-rolled offline compile (does **not** use
`inherit npm` today):

1. **`do_fetch`:** git source + generated `webui-vue-npm-packages.inc` (~2,686
   `https://` tarball URLs + checksums from lockfile `integrity`).
2. **`do_compile`:** `npm ci --include=dev --offline` + `npm run build`.
3. **`do_install`:** copy `dist/` + license files.

Also requires generated `npm-shrinkwrap.json` in the recipe file bundle.

### Using `npm.bbclass` (strategy B only)

Not applicable to strategy **A**: use Yocto's npm integration instead of ad hoc
online `npm install` in `do_compile`.

Upstream
[`npm.bbclass`](https://github.com/openbmc/openbmc/blob/master/upstream-layers/openembedded-core/meta/classes-recipe/npm.bbclass)
expects:

- Dependencies prefetched into **`${S}`** (via `npmsw://` + shrinkwrap, or
  equivalent).
- **`inherit npm`** for offline **`do_configure` / `do_compile`** (npm cache,
  `offline=true`).
- Callers override install when the deliverable is not a Node package on the
  rootfs.

For webui-vue that would look roughly like:

```bitbake
SRC_URI = "git://... \
           npmsw://${THISDIR}/${PN}/npm-shrinkwrap.json \
           "
inherit npm
NPM_INSTALL_DEV = "1"

do_compile:append() {
    npm run build ${EXTRA_OENPM}
}
do_install() {
    install -d ${D}${datadir}/www
    cp -r ${S}/dist/. ${D}${datadir}/www
    # ... license / SBOM sidecars ...
}
```

**Blockers today:** `npmsw://` disabled on OpenBMC master; Vite/`EXTRA_OENPM`
vendor modes need validation. (The `npm.bbclass` `lockfileVersion ≥ 2`
requirement is already met — webui-vue is at `lockfileVersion: 3`.) **B.1**
duplicates the offline goal without `inherit npm` until those pieces land. This
doc does not prescribe an ordering for B.1 → B.2 → `inherit npm`.

### B.2 — `npmsw://` (future; blocked on upstream)

**Not usable on OpenBMC master today.** After OpenBMC rebases onto BitBake that
includes the **merged** Bootlin re-enable patch, B.1 can drop the large tarball
`.inc` in favor of shrinkwrap fetch:

```bitbake
npmsw://${THISDIR}/${PN}/npm-shrinkwrap.json
```

Same offline compile and same **`DL_DIR`** / **`${S}`** layout; smaller recipe
maintenance. After B.2, **`inherit npm`** (Patrick's direction) can replace
hand-rolled `npm ci` with the class offline path (still with Vite/`dist`
overrides above).

---

## Possible phasing

Work can be staged independently per strategy. One way to split it:

```text
Strategy A (e.g. A.1)              Strategy B
─────────────────────              ──────────
yocto/ + git-only openbmc recipe   PACKAGECONFIG[source] → B.1 tarball .inc
                                   → B.2 npmsw:// → inherit npm
```

| Stage      | Strategy A (example: A.1)                                                                                | Strategy B                                                                         |
| ---------- | -------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| **A-side** | `yocto/` in webui-vue; generator; CI freshness; git-only openbmc recipe; `THIRD_PARTY_NOTICES` in bundle | —                                                                                  |
| **B-side** | —                                                                                                        | `PACKAGECONFIG[source]` with B.1; later B.2 / `inherit npm` (after BitBake rebase) |

**Prerequisite (all strategies):** land
[91791](https://gerrit.openbmc.org/c/openbmc/webui-vue/+/91791/)
(`@vue/vue3-jest` → devDependencies) before final SBOM artifact generation.

---

## Proposed design (example: A.1)

The following sketches **A.1** only. **A.2** / **A.3** differ in where `yocto/`
artifacts live; **B** uses the sections above instead of a pre-built bundle.

### webui-vue

- `scripts/generate-yocto-npm-artifacts.mjs` — from `package-lock.json`:
  - production-tree SBOM: `webui-vue-npm-licenses.inc`,
    `webui-vue-npm-dependencies.spdx.json` (~80 packages)
  - `THIRD_PARTY_NOTICES` (Markdown)
  - (Phase 2 / B.1 only) full lockfile shrinkwrap + `webui-vue-npm-packages.inc`
- `npm run yocto:artifacts` (or equivalent) — build, pack
  `yocto/webui-vue-dist.tar.gz`, write `bundle.sha256`, run generator
- Add `"license": "Apache-2.0"` to `package.json`

### Gerrit CI — today vs proposed

**Today**
([`run-unit-test-docker.sh`](https://github.com/openbmc/openbmc-build-scripts/blob/master/run-unit-test-docker.sh)
→
[`unit-test.py`](https://github.com/openbmc/openbmc-build-scripts/blob/master/scripts/unit-test.py)):

1. [`format-code.sh`](../../format-code.sh) — `npm install` + `npm run lint`
2. `unit-test.py` exits early ("No valid build system") —
   [`run-ci`](../../run-ci) (`npm ci` + unit tests) is **never reached**
3. **No** `npm run build`, **no** artifact generation, **no** hosting

**Proposed CI changes (for A.1):**

1. Run unit tests (`npm ci && npm run test:unit`) — fix `run-ci` invocation
   (webui-vue CL and/or openbmc-build-scripts CL)
2. On build-affecting changes: `npm run build`, repack dist tarball, regenerate
   `yocto/*`, verify `bundle.sha256`
3. Fail if lockfile changes without updated SBOM sidecars

GitHub Actions on the GitHub mirror
([deploy-docs-to-gh-pages.yml](../../.github/workflows/deploy-docs-to-gh-pages.yml))
publishes documentation only — **not** part of Gerrit CI or Yocto fetch.

### openbmc recipe (A.1 example)

Git-only for the dist bundle — no `file://` tarball in the openbmc recipe
directory. The compound `LICENSE` is the one exception (see parse-time note
below):

```bitbake
SRC_URI = "git://github.com/openbmc/webui-vue.git;branch=master;protocol=https"

# LICENSE / LIC_FILES_CHKSUM are parse-time variables, evaluated *before*
# do_fetch checks out ${S} — they cannot `require` ${S}/yocto/*.inc. The
# compound LICENSE must be inlined here or shipped as a small .inc in the
# openbmc recipe directory, kept in sync by autobump. (See parse-time note.)

do_configure[noexec] = "1"
do_compile[noexec] = "1"

do_install () {
    install -d ${D}${datadir}/www
    # Tarball root contains dist/ and THIRD_PARTY_NOTICES; strip the leading
    # dist/ component so app assets + notices land directly under www/.
    tar -xf ${S}/yocto/webui-vue-dist.tar.gz -C ${D}${datadir}/www \
        --strip-components=1
    # Ship the per-dependency SPDX manifest in the rootfs (non-web path).
    # The image SBOM itself is still produced by create-spdx from recipe
    # LICENSE / LIC_FILES_CHKSUM; this file is the detailed sidecar.
    install -d ${D}${docdir}/${PN}
    install -m 0644 ${S}/yocto/webui-vue-npm-dependencies.spdx.json \
        ${D}${docdir}/${PN}/
}

FILES:${PN} += "${datadir}/www ${docdir}/${PN}"
RDEPENDS:${PN} += " bmcweb"
```

Remove `DEPENDS` on `nodejs-native` and `do_compile[network]` on this path.
Vendor `EXTRA_OENPM` applies to strategy **B** builds, not pre-built install.

**Parse-time license note:** because `LICENSE` / `LIC_FILES_CHKSUM` are read at
parse time, the compound `LICENSE` value cannot come from `${S}/yocto/` (which
only exists after `do_fetch`). It must either be inlined in the recipe or live
as a small `.inc` checked into the openbmc recipe directory and updated by
autobump alongside `SRCREV`. This is the one place A.1 is not strictly
"git-only"; it does **not** affect the dist tarball or SPDX sidecars, which are
still read from `${S}/yocto/` at `do_install`.

### SBOM outcome (all strategies)

1. Recipe `LICENSE` — compound SPDX (~6 npm IDs + Apache-2.0 for project source)
2. `${docdir}/webui-vue/npm-dependencies.spdx.json` (rootfs
   `/usr/share/doc/webui-vue/`) — ~80 production packages
3. `bitbake webui-vue -c create_recipe_sbom` / image SBOM via `create-spdx`

---

## Alternatives considered (summary)

| Approach                               | Verdict                                                                                                                                                   |
| -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Repo-root CycloneDX + git hooks        | **Rejected** — does not fix recipe; maintainer direction                                                                                                  |
| `npm.bbclass` / `inherit npm`          | **Strategy B** — Yocto-native offline npm (`npmsw://` + Vite/`dist` overrides); upstream `do_install` targets rootfs `node_modules`, not `${datadir}/www` |
| `nlf-native` at compile                | **Not used** — non-deterministic vs lockfile generator                                                                                                    |
| Vendored `node_modules` tarball in git | Large; poor reviewability                                                                                                                                 |
| Online `npm install` only (status quo) | **Reject** — fails Goal 1                                                                                                                                 |
| A.2 release tags on webui-vue          | Reduces master blob churn; no release-tag process in project today                                                                                        |
| A.3 external artifact host             | Requires new CI/host automation; no phosphor precedent                                                                                                    |

---

## Testing

### Strategy A.1 (pre-built)

1. `BB_NO_NETWORK=1 bitbake webui-vue` succeeds (git fetch only)
2. `${datadir}/www` contains `js/app.[hash].js` and `THIRD_PARTY_NOTICES`
3. `create_recipe_sbom` shows compound `LICENSE`
4. SPDX manifest has ~80 production entries, no devDependency packages
5. Gerrit CI rejects a patchset when build-affecting sources change but
   `yocto/bundle.sha256` is stale

### Strategy B.1 (pre-fetch, `PACKAGECONFIG=source`)

1. Connected `do_fetch` populates ~2,686 npm tarballs in `DL_DIR`
2. `BB_NO_NETWORK=1 bitbake webui-vue` with `PACKAGECONFIG=source` succeeds
3. For same `SRCREV`, `${datadir}/www` output matches an A.1 bundle built from
   that revision

---

## Implementation dependencies

1. **This design doc** (Gerrit 91790)
2. **[91791](https://gerrit.openbmc.org/c/openbmc/webui-vue/+/91791/)** —
   dependency hygiene
3. **Strategy-specific** — see A.1 example above and strategy **B** sections
