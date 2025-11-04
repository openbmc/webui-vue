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
    https: true,
    hot: false,
    liveReload: false,
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
      '/': {
        target: process.env.BASE_URL,
        ws: false, // do NOT proxy WebSockets on catch-all; HMR uses /ws_hmr
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
    },
    port: 8000,
  },
  productionSourceMap: false,
  chainWebpack: (config) => {
    // Remove vue-compat alias and configuration
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
