import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const url =
  process.env.REDFISH_OPENAPI_URL ||
  'https://raw.githubusercontent.com/DMTF/Redfish-Publications/refs/heads/main/openapi/openapi.yaml';
const outputPath = path.join(__dirname, '../../src/api/schema/openapi.yaml');

const dir = path.dirname(outputPath);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

async function main(): Promise<void> {
  try {
    console.log('Downloading OpenAPI schema from:', url);
    const res = await fetch(url);
    if (!res.ok) {
      console.error(`Failed to download schema: ${res.status} ${res.statusText}`);
      process.exit(1);
    }
    const text = await res.text();
    fs.writeFileSync(outputPath, text);
    console.log('OpenAPI schema downloaded successfully at', outputPath);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('Error downloading schema:', message);
    process.exit(1);
  }
}

void main();
