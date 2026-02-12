/// <reference types="vitest" />
import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import basicSsl from '@vitejs/plugin-basic-ssl';
import svgLoader from 'vite-svg-loader';
import viteCompression from 'vite-plugin-compression';
import { fileURLToPath, URL } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

// Plugin to resolve directory imports to index.js (like Webpack does)
function resolveDirectoryIndex() {
  return {
    name: 'resolve-directory-index',
    resolveId(source, importer) {
      if (!importer || source.startsWith('\0')) return null;

      // Resolve the full path
      let resolved;
      if (source.startsWith('@/')) {
        resolved = path.resolve(__dirname, 'src', source.slice(2));
      } else if (source.startsWith('./') || source.startsWith('../')) {
        resolved = path.resolve(path.dirname(importer), source);
      } else {
        return null;
      }

      // Check if it's a directory with an index.js
      try {
        const stats = fs.statSync(resolved);
        if (stats.isDirectory()) {
          const indexPath = path.join(resolved, 'index.js');
          if (fs.existsSync(indexPath)) {
            return indexPath;
          }
        }
      } catch {
        // Path doesn't exist, let Vite handle it
      }

      return null;
    },
  };
}

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');

  const envName = env.VITE_ENV_NAME;
  const hasCustomStyles = env.CUSTOM_STYLES === 'true';
  const hasCustomStore = env.CUSTOM_STORE === 'true';
  const hasCustomRouter = env.CUSTOM_ROUTER === 'true';
  const hasCustomAppNav = env.CUSTOM_APP_NAV === 'true';

  // Build SCSS additionalData for prepending imports
  const scssAdditionalData = (() => {
    if (hasCustomStyles && envName !== undefined) {
      return `
        @import "@/assets/styles/bmc/helpers";
        @import "@/env/assets/styles/_${envName}";
        @import "@/assets/styles/bootstrap/_helpers";
      `;
    } else {
      return `
        @import "@/assets/styles/bmc/helpers";
        @import "@/assets/styles/bootstrap/_helpers";
      `;
    }
  })();

  // Build custom aliases for environment-specific overrides
  const customAliases = {};
  if (envName !== undefined) {
    if (hasCustomStore) {
      // If env has custom store, resolve all store modules
      customAliases['./store'] = path.resolve(
        __dirname,
        `src/env/store/${envName}.js`,
      );
      customAliases['../store'] = path.resolve(
        __dirname,
        `src/env/store/${envName}.js`,
      );
    }
    if (hasCustomRouter) {
      // If env has custom router, resolve routes
      customAliases['./routes'] = path.resolve(
        __dirname,
        `src/env/router/${envName}.js`,
      );
    }
    if (hasCustomAppNav) {
      // If env has custom AppNavigation
      customAliases['./AppNavigationMixin'] = path.resolve(
        __dirname,
        `src/env/components/AppNavigation/${envName}.js`,
      );
    }
  }

  // Helper to inject auth token from cookie
  const injectAuthToken = (proxyReq, req) => {
    const cookies = req.headers.cookie;
    if (cookies) {
      const match = cookies.match(/X-Auth-Token=([^;]+)/);
      if (match) {
        proxyReq.setHeader('X-Auth-Token', match[1]);
      }
    }
  };

  // Helper to remove HSTS header
  const removeHsts = (proxyRes) => {
    delete proxyRes.headers['strict-transport-security'];
  };

  // Check if HTTPS should be enabled (default: true)
  const useHttps = env.DEV_HTTPS !== 'false';

  return {
    plugins: [
      resolveDirectoryIndex(),
      vue(),
      svgLoader({
        defaultImport: 'component',
      }),
      // Enable HTTPS with auto-generated self-signed certificate
      ...(useHttps ? [basicSsl()] : []),
      // Compression for production builds
      ...(mode === 'production'
        ? [
            viteCompression({
              deleteOriginFile: true,
              algorithm: 'gzip',
            }),
          ]
        : []),
    ],

    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        ...customAliases,
      },
      // Allow importing without extensions (like Vue CLI did)
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue'],
    },

    css: {
      preprocessorOptions: {
        scss: {
          additionalData: scssAdditionalData,
          // Silence Sass deprecation warnings from Bootstrap and other dependencies.
          // Bootstrap is working on a long-term fix for Dart Sass compatibility.
          // See: https://getbootstrap.com/docs/5.3/customize/sass/#importing
          silenceDeprecations: ['import'],
          quietDeps: true,
        },
        sass: {
          additionalData: scssAdditionalData,
          silenceDeprecations: ['import'],
          quietDeps: true,
        },
      },
    },

    define: {
      // Vue 3 compile-time feature flags
      __VUE_OPTIONS_API__: true,
      __VUE_PROD_DEVTOOLS__: false,
      __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false,
      // Expose session storage toggle to client code
      'import.meta.env.VITE_STORE_SESSION': JSON.stringify(
        env.VITE_STORE_SESSION || env.STORE_SESSION || '',
      ),
    },

    server: {
      port: 8000,
      // HTTPS is enabled via basicSsl plugin above
      // Disable HMR WebSocket to avoid conflicts with app websockets
      hmr: {
        path: '/ws_hmr',
      },
      proxy: {
        '/redfish': {
          target: env.BASE_URL,
          changeOrigin: true,
          secure: false,
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq, req) => {
              injectAuthToken(proxyReq, req);

              // Detect if this is a browser navigation vs an API call
              const isApiCall =
                req.headers['x-requested-with'] === 'XMLHttpRequest';

              if (!isApiCall) {
                proxyReq.setHeader(
                  'Accept',
                  'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                );
                proxyReq.removeHeader('accept-encoding');
              }

              // Fix referer to match BMC host
              if (req.headers.referer && env.BASE_URL) {
                try {
                  const refererUrl = new URL(req.headers.referer);
                  const bmcUrl = new URL(env.BASE_URL);
                  refererUrl.protocol = bmcUrl.protocol;
                  refererUrl.hostname = bmcUrl.hostname;
                  refererUrl.port = bmcUrl.port;
                  proxyReq.setHeader('Referer', refererUrl.toString());
                } catch (e) {
                  // If URL parsing fails, leave referer unchanged
                }
              }

              // Remove x-forwarded headers
              proxyReq.removeHeader('x-forwarded-host');
              proxyReq.removeHeader('x-forwarded-proto');
              proxyReq.removeHeader('x-forwarded-port');
              proxyReq.removeHeader('x-forwarded-for');
            });
            proxy.on('proxyRes', (proxyRes) => {
              removeHsts(proxyRes);
              delete proxyRes.headers['content-encoding'];
            });
          },
        },
        '/login': {
          target: env.BASE_URL,
          changeOrigin: true,
          secure: false,
          configure: (proxy) => {
            proxy.on('proxyRes', removeHsts);
          },
        },
        '/kvm': {
          target: env.BASE_URL,
          changeOrigin: true,
          secure: false,
          ws: true,
          configure: (proxy) => {
            proxy.on('proxyRes', removeHsts);
            proxy.on('proxyReqWs', (proxyReq, req) => {
              const cookies = req.headers.cookie;
              if (cookies) {
                const match = cookies.match(/X-Auth-Token=([^;]+)/);
                if (match) {
                  proxyReq.setHeader('X-Auth-Token', match[1]);
                }
              }
            });
            proxy.on('error', (err) => {
              console.error('[vite] /kvm proxy error:', err.message);
            });
          },
        },
        '/console': {
          target: env.BASE_URL,
          changeOrigin: true,
          secure: false,
          ws: true,
          configure: (proxy) => {
            proxy.on('proxyRes', removeHsts);
            proxy.on('proxyReqWs', (proxyReq, req) => {
              // Forward the auth token from cookies for WebSocket connections
              const cookies = req.headers.cookie;
              if (cookies) {
                const match = cookies.match(/X-Auth-Token=([^;]+)/);
                if (match) {
                  proxyReq.setHeader('X-Auth-Token', match[1]);
                }
              }
            });
            proxy.on('error', (err) => {
              console.error('[vite] /console proxy error:', err.message);
            });
          },
        },
        '/vm': {
          target: env.BASE_URL,
          changeOrigin: true,
          secure: false,
          ws: true,
          configure: (proxy) => {
            proxy.on('proxyRes', removeHsts);
            proxy.on('proxyReqWs', (proxyReq, req) => {
              const cookies = req.headers.cookie;
              if (cookies) {
                const match = cookies.match(/X-Auth-Token=([^;]+)/);
                if (match) {
                  proxyReq.setHeader('X-Auth-Token', match[1]);
                }
              }
            });
            proxy.on('error', (err) => {
              console.error('[vite] /vm proxy error:', err.message);
            });
          },
        },
        '/styles/redfish.css': {
          target: env.BASE_URL,
          changeOrigin: true,
          secure: false,
          configure: (proxy) => {
            proxy.on('proxyReq', injectAuthToken);
            proxy.on('proxyRes', removeHsts);
          },
        },
        '/images/DMTF_Redfish_logo_2017.svg': {
          target: env.BASE_URL,
          changeOrigin: true,
          secure: false,
          configure: (proxy) => {
            proxy.on('proxyReq', injectAuthToken);
            proxy.on('proxyRes', removeHsts);
          },
        },
      },
    },

    build: {
      // Generate hashed filenames
      rollupOptions: {
        output: {
          // Single chunk output (like LimitChunkCountPlugin with maxChunks: 1)
          manualChunks: undefined,
          entryFileNames: 'js/app.[hash].js',
          chunkFileNames: 'js/[name].[hash].js',
          assetFileNames: (assetInfo) => {
            if (assetInfo.name?.endsWith('.css')) {
              return 'css/app.[hash][extname]';
            }
            return 'assets/[name].[hash][extname]';
          },
        },
      },
      // Disable source maps in production
      sourcemap: false,
      // Performance hints
      chunkSizeWarningLimit: 512,
    },

    // Handle .ico files
    assetsInclude: ['**/*.ico'],

    // Vitest configuration
    test: {
      globals: true,
      environment: 'happy-dom',
      setupFiles: ['./tests/vitest.setup.js'],
      include: ['tests/unit/**/*.spec.js'],
      css: false,
      snapshotSerializers: ['vue3-snapshot-serializer'],
      server: {
        deps: {
          inline: ['@carbon/icons-vue'],
        },
      },
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html'],
      },
    },
  };
});
