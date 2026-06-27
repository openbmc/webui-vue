#!/usr/bin/env node
/**
 * Generates the OSS / third-party license manifest for webui-vue's *production*
 * (shipped) npm dependency tree and emits four artifacts at the repo root:
 *
 *   - bom.json                 CycloneDX 1.6 SBOM (BSI TR-03183 oriented) -- the
 *                              primary deliverable, ingestible by a
 *                              firmware-image-level SBOM process.
 *   - oss-licenses.json        Machine-readable source of truth (used for diffing
 *                              by scripts/oss-commit-msg.mjs).
 *   - THIRD_PARTY_LICENSES.md  Human-readable manifest.
 *   - oss-licenses.csv         Flat per-package table (Name, Type, SRC_URI,
 *                              Version, License) for image-level SBOM ingestion.
 *
 * The production set is derived from package-lock.json by excluding nodes that
 * npm flags as dev-only ("dev": true) -- i.e. exactly what `npm ci --omit=dev`
 * keeps. Everything is read from the committed lockfile + the installed
 * node_modules, so the script runs fully offline (no registry access), which is
 * required for the pre-commit hook and the Node-locked Yocto/CI environment.
 *
 * Usage:
 *   node scripts/gen-oss-licenses.mjs            # write the four artifacts
 *   node scripts/gen-oss-licenses.mjs --check    # verify committed artifacts are
 *                                                # up to date and licenses resolved
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CYCLONEDX_SPEC_VERSION = '1.6';

// SPDX identifiers considered pre-approved for the firmware bundle. Anything
// outside this list is surfaced for license review (warning), and an
// unresolved ("UNKNOWN") license fails --check.
const SPDX_ALLOWLIST = new Set([
  'MIT',
  'ISC',
  'Apache-2.0',
  'BSD-2-Clause',
  'BSD-3-Clause',
  '0BSD',
  'CC0-1.0',
  'CC-BY-3.0',
  'CC-BY-4.0',
  'Unlicense',
  'Python-2.0',
  'Zlib',
]);

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function tryReadJson(path) {
  try {
    return readJson(path);
  } catch {
    return null;
  }
}

/**
 * Resolve a dependency name from a given lockfile node path, following Node's
 * nearest-ancestor node_modules resolution (nested then progressively shallower).
 */
function resolveDepKey(packages, fromKey, depName) {
  const base = fromKey === '' ? '' : `${fromKey}/`;
  let prefix = `${base}node_modules/${depName}`;
  if (packages[prefix]) return prefix;

  // Walk up the node_modules chain of the importer.
  let segments = fromKey.split('/node_modules/');
  while (segments.length > 0) {
    segments.pop();
    const ancestor = segments.join('/node_modules/');
    const candidate = `${ancestor ? `${ancestor}/` : ''}node_modules/${depName}`;
    if (packages[candidate]) return candidate;
    if (ancestor === '') break;
  }
  return packages[`node_modules/${depName}`] ? `node_modules/${depName}` : null;
}

function nameFromKey(key) {
  const idx = key.lastIndexOf('node_modules/');
  return idx === -1 ? key : key.slice(idx + 'node_modules/'.length);
}

function splitScope(name) {
  if (name.startsWith('@')) {
    const slash = name.indexOf('/');
    if (slash !== -1) {
      return { group: name.slice(0, slash), short: name.slice(slash + 1) };
    }
  }
  return { group: undefined, short: name };
}

function makePurl(name, version) {
  const { group, short } = splitScope(name);
  const ns = group ? `${encodeURIComponent(group)}/` : '';
  return `pkg:npm/${ns}${encodeURIComponent(short)}@${version}`;
}

function normalizeRepoUrl(repository, homepage) {
  let url = '';
  if (typeof repository === 'string') url = repository;
  else if (repository && typeof repository === 'object') url = repository.url || '';
  url = url
    .replace(/^git\+/, '')
    .replace(/^git:\/\//, 'https://')
    .replace(/^ssh:\/\/git@/, 'https://')
    .replace(/^git@([^:]+):/, 'https://$1/')
    .replace(/\.git$/, '');
  if (url.startsWith('github:')) {
    url = `https://github.com/${url.slice('github:'.length)}`;
  } else if (/^[\w.-]+\/[\w.-]+$/.test(url)) {
    url = `https://github.com/${url}`;
  }
  if (!url && homepage) url = homepage;
  return url;
}

/** Classify a license string into a CycloneDX license-choice shape. */
function licenseChoice(license) {
  if (!license || license === 'UNKNOWN') {
    return { license: { name: 'UNKNOWN' } };
  }
  const isExpression = /\s(AND|OR|WITH)\s|^\(|\)$/.test(license);
  if (isExpression) {
    return { expression: license, acknowledgement: 'concluded' };
  }
  if (/^[A-Za-z0-9.+-]+$/.test(license)) {
    return { license: { id: license, acknowledgement: 'concluded' } };
  }
  return { license: { name: license, acknowledgement: 'concluded' } };
}

function filenameFromResolved(resolved) {
  if (!resolved) return '';
  try {
    return decodeURIComponent(resolved.split('/').pop() || '');
  } catch {
    return resolved.split('/').pop() || '';
  }
}

/**
 * Build the in-memory production dependency model from package-lock.json +
 * node_modules metadata.
 */
function buildModel() {
  const rootPkg = readJson(join(ROOT, 'package.json'));
  const lock = readJson(join(ROOT, 'package-lock.json'));
  const packages = lock.packages || {};
  const directNames = new Set(Object.keys(rootPkg.dependencies || {}));

  const perKey = [];
  for (const [key, node] of Object.entries(packages)) {
    if (key === '') continue; // root project
    if (node.dev === true) continue; // dev-only -> not shipped
    if (node.extraneous === true) continue;

    const name = node.name || nameFromKey(key);
    const version = node.version || '';
    const { group, short } = splitScope(name);

    // Prefer the lockfile license; fall back to the installed package.json.
    let license = typeof node.license === 'string' ? node.license : '';
    const installed = tryReadJson(join(ROOT, key, 'package.json'));
    if (!license && installed) {
      if (typeof installed.license === 'string') license = installed.license;
      else if (installed.license && installed.license.type) license = installed.license.type;
      else if (Array.isArray(installed.licenses)) {
        license = installed.licenses.map((l) => l.type || l).filter(Boolean).join(' OR ');
      }
    }
    if (!license) license = 'UNKNOWN';

    const repository = normalizeRepoUrl(installed?.repository, installed?.homepage);

    perKey.push({
      key,
      name,
      group,
      short,
      version,
      license,
      purl: makePurl(name, version),
      direct: directNames.has(name),
      repository,
      filename: filenameFromResolved(node.resolved),
      deps: node.dependencies ? Object.keys(node.dependencies) : [],
    });
  }

  const keyToPurl = new Map(perKey.map((c) => [c.key, c.purl]));

  // A package can be installed at multiple node_modules paths (multiple lockfile
  // keys) but is one logical component. Collapse to unique components by purl
  // (CycloneDX bom-ref must be unique) and union their resolved dependency edges.
  const byPurl = new Map();
  const edges = new Map();
  for (const c of perKey) {
    if (!byPurl.has(c.purl)) byPurl.set(c.purl, c);
    if (!edges.has(c.purl)) edges.set(c.purl, new Set());
    const dependsOn = edges.get(c.purl);
    for (const depName of c.deps) {
      const depKey = resolveDepKey(packages, c.key, depName);
      const depPurl = depKey && keyToPurl.get(depKey);
      if (depPurl && depPurl !== c.purl) dependsOn.add(depPurl);
    }
  }

  // Stable ordering: by name then version.
  const components = [...byPurl.values()].sort((a, b) =>
    a.name === b.name ? cmp(a.version, b.version) : cmp(a.name, b.name),
  );

  // CycloneDX dependency graph (refs are purls).
  const rootRef = `pkg:npm/webui-vue@${rootPkg.version}`;
  const dependencies = components.map((c) => ({
    ref: c.purl,
    dependsOn: [...edges.get(c.purl)].sort(cmp),
  }));
  // Root component depends on the direct production dependencies.
  const directPurls = [...new Set(components.filter((c) => c.direct).map((c) => c.purl))].sort(cmp);
  dependencies.unshift({ ref: rootRef, dependsOn: directPurls });
  dependencies.sort((a, b) => cmp(a.ref, b.ref));

  return { rootPkg, rootRef, components, dependencies };
}

function cmp(a, b) {
  return a < b ? -1 : a > b ? 1 : 0;
}

function buildBom({ rootPkg, rootRef, components, dependencies }) {
  // Note: serialNumber and metadata.timestamp are intentionally omitted so the
  // committed bom.json stays diff-stable; they are injected at release/upload
  // time when the SBOM is published or merged into the firmware-image SBOM.
  return {
    bomFormat: 'CycloneDX',
    specVersion: CYCLONEDX_SPEC_VERSION,
    version: 1,
    metadata: {
      component: {
        'bom-ref': rootRef,
        type: 'application',
        name: rootPkg.name,
        version: rootPkg.version,
        description: rootPkg.description,
        purl: rootRef,
      },
      supplier: { name: 'OpenBMC', url: ['https://www.openbmc.org'] },
      authors: [{ name: 'OpenBMC' }],
      properties: [
        { name: 'bsi:sbom:completeness', value: 'complete' },
        {
          name: 'oss:scope',
          value: 'production npm dependencies (devDependencies excluded)',
        },
      ],
    },
    components: components.map((c) => {
      const properties = [
        { name: 'oss:dependencyType', value: c.direct ? 'direct' : 'transitive' },
      ];
      if (c.filename) properties.push({ name: 'bsi:component:filename', value: c.filename });
      const comp = {
        'bom-ref': c.purl,
        type: 'library',
        name: c.short,
        version: c.version,
        purl: c.purl,
        licenses: [licenseChoice(c.license)],
        properties,
      };
      if (c.group) comp.group = c.group;
      if (c.repository) {
        comp.externalReferences = [{ type: 'vcs', url: c.repository }];
      }
      return comp;
    }),
    dependencies,
  };
}

function buildLicensesJson({ components }) {
  return components.map((c) => ({
    name: c.name,
    version: c.version,
    license: c.license,
    type: c.direct ? 'direct' : 'transitive',
    purl: c.purl,
    repository: c.repository,
  }));
}

function buildCsv({ components }) {
  const esc = (v) => {
    const s = String(v ?? '');
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = ['Name,Type,SRC_URI,Version,License'];
  for (const c of components) {
    lines.push(
      [c.name, c.direct ? 'direct' : 'transitive', c.repository, c.version, c.license]
        .map(esc)
        .join(','),
    );
  }
  return `${lines.join('\n')}\n`;
}

function buildMarkdown({ rootPkg, components }) {
  const direct = components.filter((c) => c.direct);
  const counts = new Map();
  for (const c of components) counts.set(c.license, (counts.get(c.license) || 0) + 1);

  const row = (c) =>
    `| ${c.name} | ${c.version} | ${c.license} | ${c.repository ? `<${c.repository}>` : ''} |`;
  const header = '| Name | Version | License | Repository |\n| --- | --- | --- | --- |';

  const licenseSummary = [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || cmp(a[0], b[0]))
    .map(([lic, n]) => `- ${lic}: ${n}`)
    .join('\n');

  return [
    '# Third-Party OSS Licenses',
    '',
    `Production npm dependencies bundled in **${rootPkg.name}** v${rootPkg.version}.`,
    'Generated by `scripts/gen-oss-licenses.mjs` (`npm run oss:licenses`); do not edit by hand.',
    'Excludes `devDependencies`. The authoritative SBOM is `bom.json` (CycloneDX 1.6).',
    '',
    '## Summary',
    '',
    `- Total production packages: ${components.length}`,
    `- Direct dependencies: ${direct.length}`,
    `- Transitive dependencies: ${components.length - direct.length}`,
    '',
    '### Licenses',
    '',
    licenseSummary,
    '',
    '## Direct dependencies',
    '',
    header,
    ...direct.map(row),
    '',
    '## Full transitive production dependencies',
    '',
    header,
    ...components.map(row),
    '',
  ].join('\n');
}

function artifacts() {
  const model = buildModel();
  return {
    model,
    files: {
      'bom.json': `${JSON.stringify(buildBom(model), null, 2)}\n`,
      'oss-licenses.json': `${JSON.stringify(buildLicensesJson(model), null, 2)}\n`,
      'THIRD_PARTY_LICENSES.md': buildMarkdown(model),
      'oss-licenses.csv': buildCsv(model),
    },
  };
}

function write() {
  const { model, files } = artifacts();
  for (const [name, content] of Object.entries(files)) {
    writeFileSync(join(ROOT, name), content);
  }
  reportLicenseConcerns(model, false);
  console.log(
    `[oss-licenses] wrote ${Object.keys(files).join(', ')} ` +
      `(${model.components.length} production packages)`,
  );
}

function reportLicenseConcerns(model, fail) {
  const unknown = model.components.filter((c) => c.license === 'UNKNOWN');
  const flagged = model.components.filter(
    (c) => c.license !== 'UNKNOWN' && !isAllowlisted(c.license),
  );
  for (const c of flagged) {
    console.warn(`[oss-licenses] license needs review: ${c.name}@${c.version} -> ${c.license}`);
  }
  if (unknown.length) {
    const list = unknown.map((c) => `${c.name}@${c.version}`).join(', ');
    const msg = `[oss-licenses] ${unknown.length} package(s) with UNKNOWN license: ${list}`;
    if (fail) {
      console.error(msg);
      return false;
    }
    console.warn(msg);
  }
  return true;
}

function isAllowlisted(license) {
  // Accept simple ids and any expression composed solely of allowlisted ids.
  const tokens = license.split(/\s+(?:AND|OR|WITH)\s+|[()]/).map((t) => t.trim()).filter(Boolean);
  return tokens.length > 0 && tokens.every((t) => SPDX_ALLOWLIST.has(t));
}

function check() {
  const { model, files } = artifacts();
  let ok = true;

  for (const [name, content] of Object.entries(files)) {
    const path = join(ROOT, name);
    if (!existsSync(path)) {
      console.error(`[oss-licenses] missing ${name}; run \`npm run oss:licenses\` and commit it.`);
      ok = false;
      continue;
    }
    if (readFileSync(path, 'utf8') !== content) {
      console.error(
        `[oss-licenses] ${name} is out of date; run \`npm run oss:licenses\` and commit the result.`,
      );
      ok = false;
    }
  }

  if (!reportLicenseConcerns(model, true)) ok = false;

  if (!ok) {
    process.exit(1);
  }
  console.log('[oss-licenses] manifest is up to date and all licenses resolved.');
}

const mode = process.argv.includes('--check') ? 'check' : 'write';
if (mode === 'check') check();
else write();
