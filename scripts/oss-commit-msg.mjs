#!/usr/bin/env node
/**
 * prepare-commit-msg hook: appends a summary of OSS license additions / removals
 * / changes to the commit message whenever the staged oss-licenses.json differs
 * from HEAD. This surfaces dependency-license changes in the commit (and in
 * Gerrit review) so they get scrutinized.
 *
 * Runs before Gerrit's commit-msg hook (Change-Id), so the two do not conflict.
 * Best-effort: any failure exits 0 so it never blocks a commit.
 *
 * Invoked as: node scripts/oss-commit-msg.mjs <commit-msg-file> [source] [sha]
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const MARKER = 'OSS license changes:';
const NOVNC = '@novnc/novnc';
const MANIFEST = 'oss-licenses.json';

function gitShow(ref) {
  try {
    return execFileSync('git', ['show', ref], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
  } catch {
    return null;
  }
}

function parse(json) {
  if (!json) return null;
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function byPurl(list) {
  const m = new Map();
  for (const e of list || []) m.set(e.purl, e);
  return m;
}

function groupByName(entries) {
  const m = new Map();
  for (const e of entries) {
    if (!m.has(e.name)) m.set(e.name, []);
    m.get(e.name).push(e);
  }
  return m;
}

function novncNote(entries) {
  if (entries.some((e) => e.name === NOVNC && e.license === 'MPL-2.0')) {
    return `  NOTE: ${NOVNC} ships under MPL-2.0 (copyleft; review required)`;
  }
  return null;
}

function summarize(oldList, newList) {
  // First-time introduction: don't dump the entire tree into the message.
  if (oldList === null) {
    const lines = [`${MARKER}`, `  manifest added (${newList.length} production packages)`];
    const note = novncNote(newList);
    if (note) lines.push(note);
    return lines;
  }

  const oldByPurl = byPurl(oldList);
  const newByPurl = byPurl(newList);

  const added = newList.filter((e) => !oldByPurl.has(e.purl));
  const removed = oldList.filter((e) => !newByPurl.has(e.purl));
  const licenseChanged = newList.filter((e) => {
    const old = oldByPurl.get(e.purl);
    return old && old.license !== e.license;
  });

  if (added.length === 0 && removed.length === 0 && licenseChanged.length === 0) return null;

  const addedByName = groupByName(added);
  const removedByName = groupByName(removed);
  const names = [...new Set([...addedByName.keys(), ...removedByName.keys()])].sort();

  const lines = [MARKER];
  for (const name of names) {
    const a = (addedByName.get(name) || []).sort((x, y) => (x.version < y.version ? -1 : 1));
    const r = (removedByName.get(name) || []).sort((x, y) => (x.version < y.version ? -1 : 1));
    const pairs = Math.min(a.length, r.length);
    for (let i = 0; i < pairs; i++) {
      lines.push(`  ~ ${name} ${r[i].version} (${r[i].license}) -> ${a[i].version} (${a[i].license})`);
    }
    for (let i = pairs; i < a.length; i++) lines.push(`  + ${name}@${a[i].version} (${a[i].license})`);
    for (let i = pairs; i < r.length; i++) lines.push(`  - ${name}@${r[i].version} (${r[i].license})`);
  }

  for (const e of licenseChanged.sort((a, b) => a.name.localeCompare(b.name))) {
    const old = oldByPurl.get(e.purl);
    lines.push(`  ~ ${e.name}@${e.version} (${old.license} -> ${e.license})`);
  }

  const note = novncNote([...added, ...removed, ...licenseChanged]);
  if (note) lines.push(note);

  return lines;
}

function main() {
  const msgFile = process.argv[2];
  const source = process.argv[3];
  if (!msgFile) return;
  // Skip merges/squashes where an editor template is not the point.
  if (source === 'merge' || source === 'squash') return;

  const current = readFileSync(msgFile, 'utf8');
  if (current.includes(MARKER)) return; // idempotent

  const newList = parse(gitShow(`:${MANIFEST}`)) || parse(readFileSync(MANIFEST, 'utf8'));
  if (!newList) return; // manifest not staged / not present -> nothing to do
  const oldList = parse(gitShow(`HEAD:${MANIFEST}`));

  const summary = summarize(oldList, newList);
  if (!summary) return;

  // Insert after the subject/body but before any trailing comment block git adds.
  const commentIdx = current.search(/^#/m);
  const block = `\n${summary.join('\n')}\n`;
  const updated =
    commentIdx === -1
      ? `${current.replace(/\s*$/, '')}\n${block}`
      : `${current.slice(0, commentIdx)}${block}\n${current.slice(commentIdx)}`;

  writeFileSync(msgFile, updated);
}

try {
  main();
} catch {
  // never block a commit
}
process.exit(0);
