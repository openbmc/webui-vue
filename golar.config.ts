import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { defineConfig } from 'golar/unstable';

import '@golar/vue';

const root = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  typecheck: {
    include: [
      path.join(root, 'openapi-ts.config.ts'),
      path.join(root, 'scripts/**/*.ts'),
      path.join(root, 'src/**/*.ts'),
      path.join(root, 'src/**/*.vue'),
      path.join(root, 'tests/unit/**/*.ts'),
    ],
  },
});
