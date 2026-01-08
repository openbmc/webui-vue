import { defineConfig } from 'orval';
import { operationName } from './src/api/operation-name/operationName';

const apiDir = 'src/api/';
const target = 'src/api/schema/openapi.processed.json';

export default defineConfig({
  redfish: {
    output: {
      mode: 'single',
      headers: true,
      workspace: apiDir,
      target: 'endpoints/redfish.gen.ts',
      schemas: 'model',
      client: 'vue-query',
      httpClient: 'axios',
      mock: false,
      prettier: false,
      override: {
        mutator: {
          name: 'apiInstance',
          path: 'mutator/axios-instance.ts',
        },
        operationName: operationName,
        query: {
          useQuery: true,
          useInfinite: true,
          useInfiniteQueryParam: 'limit',
        },
      },
      allParamsOptional: true,
      urlEncodeParameters: true,
    },
    input: {
      target: target,
      validation: false,
      // Note: Preprocessing is done by scripts/api/preprocess-schema.ts
      // instead of using Orval's transformer (which causes stack overflow on large schemas)
    },
  },
});
