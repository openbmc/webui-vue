const CompressionPlugin = require('compression-webpack-plugin');
const webpack = require('webpack');
const LimitChunkCountPlugin = webpack.optimize.LimitChunkCountPlugin;

module.exports = {
  css: {
    loaderOptions: {
      sass: {
        additionalData: (() => {
          const envName = process.env.VUE_APP_ENV_NAME;
          const hasCustomStyles = process.env.CUSTOM_STYLES === 'true';
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
        })(), // immediately invoked function expression (IIFE)
      },
      scss: {
        additionalData: (() => {
          const envName = process.env.VUE_APP_ENV_NAME;
          const hasCustomStyles = process.env.CUSTOM_STYLES === 'true';
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
        })(),
      },
    },
  },
  devServer: {
    // Set DEV_HTTPS=false to run with HTTP
    // ref https://webpack.js.org/configuration/dev-server/#devserverserver
    server:
      process.env.DEV_HTTPS === 'false' ? { type: 'http' } : { type: 'https' },
    hot: false,
    liveReload: false,
    compress: false, // Disable compression to preserve HTML formatting from BMC
    historyApiFallback: {
      // Don't serve index.html for API routes - let the proxy handle them
      rewrites: [
        {
          from: /^\/redfish/,
          to: (context) => context.parsedUrl.pathname,
        },
        {
          from: /^\/login/,
          to: (context) => context.parsedUrl.pathname,
        },
        {
          from: /^\/kvm/,
          to: (context) => context.parsedUrl.pathname,
        },
        {
          from: /^\/console/,
          to: (context) => context.parsedUrl.pathname,
        },
        {
          from: /^\/vm/,
          to: (context) => context.parsedUrl.pathname,
        },
        {
          from: /^\/styles\/redfish\.css/,
          to: (context) => context.parsedUrl.pathname,
        },
        {
          from: /^\/images\/DMTF_Redfish_logo_2017\.svg/,
          to: (context) => context.parsedUrl.pathname,
        },
      ],
    },
    client: {
      webSocketURL: {
        pathname: '/ws_hmr',
      },
    },
    webSocketServer: {
      options: {
        path: '/ws_hmr',
      },
    },
    proxy: {
      '/redfish': {
        target: process.env.BASE_URL,
        ws: false,
        changeOrigin: true,
        secure: false,
        onProxyReq: (proxyReq, req) => {
          // Inject X-Auth-Token header from cookie for non-cookie auth backends
          const cookies = req.headers.cookie;
          if (cookies) {
            const match = cookies.match(/X-Auth-Token=([^;]+)/);
            if (match) {
              proxyReq.setHeader('X-Auth-Token', match[1]);
            }
          }

          // Detect if this is a browser navigation vs an API call from axios
          // Axios sends X-Requested-With: XMLHttpRequest header
          const isApiCall =
            req.headers['x-requested-with'] === 'XMLHttpRequest';

          if (!isApiCall) {
            // Send browser-like headers so BMC returns formatted HTML
            // (only for direct browser navigation, not axios API calls)
            proxyReq.setHeader(
              'Accept',
              'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            );
            // Don't request compressed responses to preserve HTML formatting
            proxyReq.removeHeader('accept-encoding');
          }

          // Fix referer to match BMC host so it doesn't detect proxy
          if (req.headers.referer && process.env.BASE_URL) {
            try {
              const refererUrl = new URL(req.headers.referer);
              const bmcUrl = new URL(process.env.BASE_URL);
              // Replace the dev server origin with the BMC origin
              refererUrl.protocol = bmcUrl.protocol;
              refererUrl.hostname = bmcUrl.hostname;
              refererUrl.port = bmcUrl.port;
              proxyReq.setHeader('Referer', refererUrl.toString());
            } catch (e) {
              // If URL parsing fails, leave referer unchanged
            }
          }

          // Remove x-forwarded headers so BMC doesn't detect proxy
          proxyReq.removeHeader('x-forwarded-host');
          proxyReq.removeHeader('x-forwarded-proto');
          proxyReq.removeHeader('x-forwarded-port');
          proxyReq.removeHeader('x-forwarded-for');
        },
        onProxyRes: (proxyRes) => {
          delete proxyRes.headers['strict-transport-security'];
          // Remove compression headers to prevent minification of HTML
          delete proxyRes.headers['content-encoding'];
        },
      },
      '/login': {
        target: process.env.BASE_URL,
        ws: false,
        changeOrigin: true,
        secure: false,
        onProxyRes: (proxyRes) => {
          delete proxyRes.headers['strict-transport-security'];
        },
      },
      // Explicit websocket backends used by the app in development
      '/kvm': {
        target: process.env.BASE_URL,
        ws: true,
        changeOrigin: true,
        secure: false,
        onProxyRes: (proxyRes) => {
          delete proxyRes.headers['strict-transport-security'];
        },
      },
      '/console': {
        target: process.env.BASE_URL,
        ws: true,
        changeOrigin: true,
        secure: false,
        onProxyRes: (proxyRes) => {
          delete proxyRes.headers['strict-transport-security'];
        },
      },
      '/vm': {
        target: process.env.BASE_URL,
        ws: true,
        changeOrigin: true,
        secure: false,
        onProxyRes: (proxyRes) => {
          delete proxyRes.headers['strict-transport-security'];
        },
      },
      '/styles/redfish.css': {
        target: process.env.BASE_URL,
        ws: false,
        changeOrigin: true,
        secure: false,
        onProxyReq: (proxyReq, req) => {
          // Inject X-Auth-Token header from cookie for non-cookie auth backends
          const cookies = req.headers.cookie;
          if (cookies) {
            const match = cookies.match(/X-Auth-Token=([^;]+)/);
            if (match) {
              proxyReq.setHeader('X-Auth-Token', match[1]);
            }
          }
        },
        onProxyRes: (proxyRes) => {
          delete proxyRes.headers['strict-transport-security'];
        },
      },
      '/images/DMTF_Redfish_logo_2017.svg': {
        target: process.env.BASE_URL,
        ws: false,
        changeOrigin: true,
        secure: false,
        onProxyReq: (proxyReq, req) => {
          // Inject X-Auth-Token header from cookie for non-cookie auth backends
          const cookies = req.headers.cookie;
          if (cookies) {
            const match = cookies.match(/X-Auth-Token=([^;]+)/);
            if (match) {
              proxyReq.setHeader('X-Auth-Token', match[1]);
            }
          }
        },
        onProxyRes: (proxyRes) => {
          delete proxyRes.headers['strict-transport-security'];
        },
      },
    },
    port: 8000,
  },
  productionSourceMap: false,
  chainWebpack: (config) => {
    config.module
      .rule('vue')
      .use('vue-svg-inline-loader')
      .loader('vue-svg-inline-loader');
    config.module
      .rule('ico')
      .test(/\.ico$/)
      .use('file-loader')
      .loader('file-loader')
      .options({
        name: '[name].[contenthash:8].[ext]',
      });
    config.plugins.delete('preload');
    if (process.env.NODE_ENV === 'production') {
      config.plugin('html').tap((options) => {
        options[0].filename = 'index.[hash:8].html';
        return options;
      });
    }
  },
  configureWebpack: (config) => {
    config.plugins.push(
      new LimitChunkCountPlugin({
        maxChunks: 1,
      }),
    );
    config.optimization.splitChunks = {
      cacheGroups: {
        default: false,
      },
    };
    const crypto = require('crypto');
    const crypto_orig_createHash = crypto.createHash;
    crypto.createHash = (algorithm) =>
      crypto_orig_createHash(algorithm == 'md4' ? 'sha256' : algorithm);

    const envName = process.env.VUE_APP_ENV_NAME;
    const hasCustomStore = process.env.CUSTOM_STORE === 'true';
    const hasCustomRouter = process.env.CUSTOM_ROUTER === 'true';
    const hasCustomAppNav = process.env.CUSTOM_APP_NAV === 'true';

    if (envName !== undefined) {
      if (hasCustomStore) {
        // If env has custom store, resolve all store modules. Currently found
        // in src/router/index.js src/store/api.js and src/main.js
        config.resolve.alias['./store$'] = `@/env/store/${envName}.js`;
        config.resolve.alias['../store$'] = `@/env/store/${envName}.js`;
      }
      if (hasCustomRouter) {
        // If env has custom router, resolve routes in src/router/index.js
        config.resolve.alias['./routes$'] = `@/env/router/${envName}.js`;
      }
      if (hasCustomAppNav) {
        // If env has custom AppNavigation, resolve AppNavigationMixin module in src/components/AppNavigation/AppNavigation.vue
        config.resolve.alias['./AppNavigationMixin$'] =
          `@/env/components/AppNavigation/${envName}.js`;
      }
    }

    if (process.env.NODE_ENV === 'production') {
      config.plugins.push(
        new CompressionPlugin({
          deleteOriginalAssets: true,
        }),
      );
    }

    config.performance = {
      hints: 'warning',
      maxEntrypointSize: 512000,
      maxAssetSize: 512000,
    };

    config.optimization.runtimeChunk = false;

    // Define Vue 3 compile-time feature flags
    // These flags must be explicitly defined to avoid Vue warnings and optimize bundle size
    config.plugins.push(
      new webpack.DefinePlugin({
        // Enable Options API support (required - this codebase uses Options API extensively)
        // Setting to true includes Options API in the bundle (~3kb gzipped)
        // Cannot be disabled until full migration to Composition API
        __VUE_OPTIONS_API__: JSON.stringify(true),

        // Disable Vue Devtools in production builds for security and performance
        // Devtools automatically enabled in development mode regardless of this flag
        __VUE_PROD_DEVTOOLS__: JSON.stringify(false),

        // Disable detailed hydration mismatch warnings in production
        // This is a SPA (not SSR), so hydration warnings don't apply
        // Reduces bundle size and eliminates unnecessary runtime checks
        __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: JSON.stringify(false),

        // Expose session storage toggle to client code
        'process.env.STORE_SESSION': JSON.stringify(
          process.env.STORE_SESSION || '',
        ),
        'process.env.VUE_APP_STORE_SESSION': JSON.stringify(
          process.env.VUE_APP_STORE_SESSION || '',
        ),
      }),
    );
  },
  pluginOptions: {
    i18n: {
      localeDir: 'locales',
      enableInSFC: true,
    },
  },
};
