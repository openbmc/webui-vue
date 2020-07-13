const CompressionPlugin = require('compression-webpack-plugin');

module.exports = {
  lintOnSave: false,
  devServer: {
    https: true,
    overlay: {
      warnings: true,
      errors: true
    },
    proxy: {
      '/': {
        target: process.env.BASE_URL,
        onProxyRes: proxyRes => {
          // This header is ignored in the browser so removing
          // it so we don't see warnings in the browser console
          delete proxyRes.headers['strict-transport-security'];
        }
      }
    },
    port: 8000
  },
  productionSourceMap: false,
  configureWebpack: config => {
    const envName = process.env.VUE_APP_ENV_NAME;

    if (process.env.NODE_ENV === 'production') {
      config.plugins.push(
        new CompressionPlugin({
          deleteOriginalAssets: true
        })
      );
    }
    if (envName !== undefined) {
      // Resolve store and router modules in src/main.js
      // depending on environment (VUE_APP_ENV_NAME) variable
      config.resolve.alias['./store$'] = `./env/store/${envName}.js`;
      config.resolve.alias['./router$'] = `./env/router/${envName}.js`;
    }
  },
  chainWebpack: config => {
    if (process.env.NODE_ENV === 'production') {
      config.plugins.delete('prefetch');
      config.plugins.delete('preload');
    }
  },
  pluginOptions: {
    i18n: {
      localeDir: 'locales',
      enableInSFC: true
    }
  }
};
