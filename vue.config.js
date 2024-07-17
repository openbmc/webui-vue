const CompressionPlugin = require('compression-webpack-plugin');
const webpack = require('webpack');
const LimitChunkCountPlugin = webpack.optimize.LimitChunkCountPlugin;

module.exports = {
  devServer: {
    server: {
      type: 'https',
    },
    proxy: {
      '/': {
        target: process.env.BASE_URL,
        onProxyRes: (proxyRes) => {
          // This header is ignored in the browser so removing
          // it so we don't see warnings in the browser console
          delete proxyRes.headers['strict-transport-security'];
        },
      },
    },
    port: 8000,
  },
  productionSourceMap: false,
  chainWebpack: (config) => {
    config.resolve.alias.set('vue', '@vue/compat');
    config.module
      .rule('vue')
      .use('vue-loader')
      .tap((options) => {
        options['compilerOptions'] = { compatConfig: { MODE: 2 } };
        return options;
      });
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
        options[0].filename = 'index.[contenthash:8].html';
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
    if (process.env.NODE_ENV === 'development') {
      config.devtool = 'source-map';
    }
    const crypto = require('crypto');
    const crypto_orig_createHash = crypto.createHash;
    crypto.createHash = (algorithm) =>
      crypto_orig_createHash(algorithm == 'md4' ? 'sha256' : algorithm);

    const envName = process.env.VUE_APP_ENV_NAME;
    const hasCustomStore = process.env.CUSTOM_STORE === 'true' ? true : false;
    const hasCustomRouter = process.env.CUSTOM_ROUTER === 'true' ? true : false;
    const hasCustomAppNav =
      process.env.CUSTOM_APP_NAV === 'true' ? true : false;

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
  },
  pluginOptions: {
    i18n: {
      localeDir: 'locales',
      enableInSFC: true,
    },
  },
};
