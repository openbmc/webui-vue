import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DMTF_REGISTRIES_URL = 'https://redfish.dmtf.org/registries/';

/**
 * Static files to download from DMTF Redfish Publications repository.
 * Each file can be overridden with an environment variable.
 */
const STATIC_DOWNLOADS = [
  {
    url:
      process.env.REDFISH_OPENAPI_URL ||
      'https://raw.githubusercontent.com/DMTF/Redfish-Publications/refs/heads/main/openapi/openapi.yaml',
    output: path.join(__dirname, '../../src/api/schema/openapi.yaml'),
    name: 'OpenAPI schema',
  },
];

/**
 * Find the latest Privilege Registry version from DMTF registries.
 * Parses the directory listing to find Redfish_X.X.X_PrivilegeRegistry.json files
 * and returns the URL of the latest version.
 */
async function findLatestPrivilegeRegistryUrl(): Promise<string> {
  const res = await fetch(DMTF_REGISTRIES_URL);
  if (!res.ok) {
    throw new Error(`Failed to fetch registry listing: ${res.status}`);
  }

  const html = await res.text();

  // Match all Redfish_X.X.X_PrivilegeRegistry.json files
  const pattern = /Redfish_(\d+)\.(\d+)\.(\d+)_PrivilegeRegistry\.json/g;
  const versions: { major: number; minor: number; patch: number; filename: string }[] = [];

  let match;
  while ((match = pattern.exec(html)) !== null) {
    versions.push({
      major: parseInt(match[1], 10),
      minor: parseInt(match[2], 10),
      patch: parseInt(match[3], 10),
      filename: match[0],
    });
  }

  if (versions.length === 0) {
    throw new Error('No Privilege Registry files found in DMTF registries');
  }

  // Sort by version (major, minor, patch) descending
  versions.sort((a, b) => {
    if (a.major !== b.major) return b.major - a.major;
    if (a.minor !== b.minor) return b.minor - a.minor;
    return b.patch - a.patch;
  });

  const latest = versions[0];
  return `${DMTF_REGISTRIES_URL}${latest.filename}`;
}

async function downloadFile(
  url: string,
  output: string,
  name: string,
): Promise<boolean> {
  try {
    // Ensure directory exists
    const dir = path.dirname(output);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    console.log(`Downloading ${name} from:`, url);
    const res = await fetch(url);
    if (!res.ok) {
      console.error(`Failed to download ${name}: ${res.status} ${res.statusText}`);
      return false;
    }
    const text = await res.text();
    fs.writeFileSync(output, text);
    console.log(`${name} downloaded successfully to`, output);
    return true;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`Error downloading ${name}:`, message);
    return false;
  }
}

async function main(): Promise<void> {
  let hasError = false;

  // Download static files
  for (const { url, output, name } of STATIC_DOWNLOADS) {
    const success = await downloadFile(url, output, name);
    if (!success) hasError = true;
  }

  // Download latest Privilege Registry (dynamic version discovery)
  const privilegeRegistryOutput = path.join(
    __dirname,
    '../../src/api/registries/PrivilegeRegistry.json',
  );

  try {
    const privilegeUrl =
      process.env.REDFISH_PRIVILEGE_REGISTRY_URL ||
      (await findLatestPrivilegeRegistryUrl());

    const success = await downloadFile(
      privilegeUrl,
      privilegeRegistryOutput,
      'Privilege Registry',
    );
    if (!success) hasError = true;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('Error finding latest Privilege Registry:', message);
    hasError = true;
  }

  if (hasError) {
    process.exit(1);
  }
}

void main();
