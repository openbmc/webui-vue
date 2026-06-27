# OSS license manifest and SBOM for webui-vue

Author: Jason Westover (Discord: jasonwestover)

Created: June 26, 2026

## Problem Description

webui-vue is built with Vite into a small set of static JavaScript and CSS
assets that are bundled into the BMC firmware image. Every production npm
dependency (and its transitive tree) is statically linked into the shipped
`js/app.[hash].js` bundle. Today nothing records which open source software
(OSS) ends up in that bundle: the dependency list changes often and the licenses
are not consistently scrutinized. Image-level build tooling that maps files to
Yocto recipes sees webui-vue as a single recipe with a single license and cannot
look inside the bundle, so the bundled npm OSS is invisible.

The goal is to generate, and automate to keep continuously up to date, a
machine-readable OSS manifest for webui-vue's production dependencies, including
a CycloneDX Software Bill of Materials (SBOM) suitable for a
firmware-image-level SBOM process, and to surface license changes during code
review. Non-goals:

- scanning `devDependencies` (they are not shipped)
- vulnerability scanning (an SBOM must not contain vulnerability data)
- re-deriving data the build already knows

## Background and References

OpenBMC firmware is assembled with the Yocto/BitBake build system. A given
recipe's source and license are described by the recipe metadata (`SRC_URI`,
`LICENSE`, etc.). For webui-vue, that metadata describes the project as a whole
(Apache-2.0) but not the npm packages compiled into the bundle.

- CycloneDX SBOM standard (JSON): <https://cyclonedx.org/>
- Package URL (purl) spec: <https://github.com/package-url/purl-spec>
- SPDX license list: <https://spdx.org/licenses/>
- BSI TR-03183 (Technical Guideline, SBOM data fields), Jan 2026.
- EU Cyber Resilience Act (Regulation 2024/2847):
  <https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A02024R2847-20241120>
- npm "package-lock.json" lockfile (v3) format and the `dev` flag used by
  `npm ci --omit=dev`.

Related work:

- Image-level SBOM/license tooling typically maps built rootfs files to their
  Yocto recipes and reports a per-recipe license. Such tooling treats webui-vue
  as one recipe and cannot enumerate the npm packages bundled into its JS; that
  gap is what this proposal fills.
- A firmware-image SBOM commonly aggregates per-firmware SBOMs as contained
  components (CycloneDX assembly/containment). The webui-vue SBOM is designed to
  nest as one such component. Per CycloneDX/BSI guidance an SBOM carries
  components and licenses only; vulnerability data lives in separate VDR/VEX
  documents.

## Requirements

The manifest must cover the full transitive set of production dependencies
(everything that ships) and exclude `devDependencies`. Direct dependencies
(those declared in `package.json`) must be distinguishable from transitive ones.
Each component must carry the fields required to feed a BSI TR-03183 conformant
SBOM: name (and npm scope/group), version, Package URL (purl), and the SPDX
license. The data set is small (~470 packages today) and is produced at
developer commit time and in CI, so generation must be fast (seconds) and
deterministic.

The primary deliverable is a CycloneDX 1.6 JSON SBOM (`bom.json`) that a
firmware-image-level SBOM process can ingest directly and nest as a contained
component. Supporting human- and tool-readable artifacts (JSON, Markdown, CSV)
are derived from the same model. The SBOM must not contain vulnerability data.

Generation must run fully offline. The OpenBMC Yocto build and CI only run
`npm ci` followed by build/test; no network access to the npm registry can be
assumed, and the toolchain Node version is fixed by the build. The solution must
therefore avoid network calls and avoid adding heavyweight dependencies (which
would themselves require OSS review). The committed artifacts must stay
diff-stable so they do not churn on every run.

Finally, license changes must be visible during review. When a change alters the
dependency set, the manifest must regenerate, be staged into the same commit,
and a summary of added/removed/changed licenses must be appended to the commit
message (which, under the project's Gerrit workflow, becomes the review
description).

## Proposed Design

A single zero-dependency Node script, `scripts/gen-oss-licenses.mjs`, reads the
committed `package-lock.json`, keeps the production closure (every node not
flagged `"dev": true`, matching `npm ci --omit=dev`), marks direct dependencies
from `package.json`, and reads per-package metadata (license, repository) from
the installed `node_modules`. It derives a Package URL per component, splits npm
scopes into group/name, builds the dependency graph from the lockfile edges, and
emits four artifacts at the repository root from one in-memory model:

- `bom.json` - CycloneDX 1.6 JSON SBOM (primary deliverable). Components carry
  `name`/`group`, `version`, `purl`, and `licenses` with
  `acknowledgement: "concluded"`; `metadata.component` describes webui-vue and
  `metadata.supplier`/`authors` identify the project. `serialNumber` and
  `metadata.timestamp` are intentionally omitted so the committed file is
  diff-stable; they are injected at release/upload time. It contains no
  vulnerability data.
- `oss-licenses.json` - sorted, stable source of truth used for diffing.
- `THIRD_PARTY_LICENSES.md` - human-readable manifest.
- `oss-licenses.csv` - a flat per-package table (Name, Type, SRC_URI, Version,
  License) for easy ingestion by image-level SBOM tooling.

A `--check` mode regenerates in memory and exits non-zero if any committed
artifact is out of date or if any license is unresolved (`UNKNOWN`); licenses
outside a small allowlist are surfaced as warnings for OSS review.

Two git hooks (managed by `simple-git-hooks`, already used by the project) wire
this into the workflow without touching Gerrit's `commit-msg` (Change-Id) hook:

- `pre-commit` (`scripts/oss-precommit.mjs`): if `package.json` or
  `package-lock.json` are staged, regenerate the manifest and `git add` the four
  artifacts, then run the existing `lint-staged`. Other commits are a fast
  no-op.
- `prepare-commit-msg` (`scripts/oss-commit-msg.mjs`): diff the staged
  `oss-licenses.json` against `HEAD` and append an idempotent summary of added
  (`+`), removed (`-`), and changed (`~`) packages to the commit body.

Two npm scripts expose the tooling: `oss:licenses` (generate) and `oss:check`
(verify, for CI).

Data flow:

```text
  package-lock.json       package.json          node_modules/<pkg>
  (drop "dev":true)        (dependencies =       (license, repo,
        |                   direct marker)        LICENSE text)
        |                        |                       |
        +------------+-----------+-----------+-----------+
                     |                       |
                     v                       v
            +------------------------------------------------+
            |          scripts/gen-oss-licenses.mjs          |
            |   production model + purl + dependency graph   |
            +------------------------------------------------+
                     |
      +--------------+----------+-------------------+---------------+
      |              |          |                   |               |
      v              v          v                   v               |
  bom.json     oss-licenses  THIRD_PARTY_     oss-licenses.csv      |
 (CycloneDX      .json       LICENSES.md      (flat per-package     |
  1.6, BSI;    (source of    (human            table)               |
  no vulns)     truth)        readable)                             |
      |              |                                              |
      v              | git diff (staged vs HEAD)                    |
  firmware-          v                                              |
  image SBOM   +---------------------------+                        |
  (contained   | scripts/oss-commit-msg.mjs|                        |
   component)  | (prepare-commit-msg)      |                        |
              +---------------------------+                         |
                     |                                              |
                     v                                              |
           commit message body                                      |
           (+/-/~ license delta)                                    |
                                                                    |
  pre-commit: when package.json / package-lock.json staged,         |
  regenerate + git add the four artifacts  <------------------------+
```

## Alternatives Considered

- `license-report` (and its `-recursive` / `-check` / `license-downloader`
  siblings): a mature tool that reads `node_modules` and emits json/csv/md/html
  and can gate license types. Rejected as the core because it produces no
  CycloneDX/BSI output (the primary deliverable would still be hand-built), it
  defaults to contacting the npm registry (unacceptable for a pre-commit hook
  and the offline Yocto/CI build), the base tool covers only direct
  dependencies, and it adds ~11 transitive dependencies that themselves require
  OSS review.
- `@cyclonedx/cyclonedx-npm`: emits CycloneDX directly from the npm tree and is
  the natural choice if the zero-dependency constraint is dropped. Not adopted
  now because it pulls a toolchain that requires its own OSS review and a newer
  Node than the build toolchain pins; kept as the documented fallback if the
  CycloneDX/BSI surface outgrows a small script.
- Generate only at release time (no commit-time tracking): rejected because the
  dependency list changes frequently and the point is to make license changes
  reviewable per change, not discover them late at release.

## Impacts

API impact: None. No runtime/HTTP/Redfish interfaces change; the artifacts are
build-time files.

Security impact: Positive. The manifest makes the shipped OSS and its licenses
explicit and reviewable, and feeds the firmware SBOM used for vulnerability
tracking (in separate VDR/VEX documents, not the SBOM). The generator reads only
local files, performs no network access, and writes no secrets.

Documentation impact: This design document, the generated
`THIRD_PARTY_LICENSES.md`, and short `README`/contributor notes on the
`oss:licenses` / `oss:check` scripts and the hook behavior.

Performance impact: Negligible. The `pre-commit` step is a no-op unless
`package.json`/`package-lock.json` are staged; a full regeneration over ~470
packages takes about two seconds and runs offline.

Developer impact: Developers who change dependencies will see the four artifacts
auto-staged and a license-delta summary appended to their commit message.
`npm ci` must have been run so `node_modules` matches the lockfile (already
required to build). The hooks honor `SKIP_SIMPLE_GIT_HOOKS=1`.

Upgradability impact: The artifacts are regenerated deterministically from the
lockfile whenever dependencies change; there is no stored state to migrate. CI
runs `oss:check` to catch drift.

### Organizational

- Does this proposal require a new repository? No.
- Who will be the initial maintainer(s) of this repository? The existing
  webui-vue maintainers.
- Which repositories are expected to be modified to execute this design? Only
  `openbmc/webui-vue`.
- Make a list, and add listed repository maintainers to the gerrit review:
  webui-vue maintainers (see `OWNERS`).

## Testing

`npm run oss:check` runs in CI and fails the build on manifest drift or any
unresolved (`UNKNOWN`) license, keeping the committed artifacts authoritative.
Locally, generation is verified by running `npm run oss:licenses` and confirming
`oss:check` then passes, and by a test commit that touches `package.json` to
confirm the `pre-commit` regeneration/staging and the `prepare-commit-msg`
license-delta summary both fire (and are idempotent on amend). The CycloneDX
`bom.json` is validated for well-formed JSON and the required 1.6 fields
(components with name/version/purl/licenses and a dependency graph).
