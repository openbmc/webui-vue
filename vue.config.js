const CompressionPlugin = require('compression-webpack-plugin');

module.exports = {
  css: {
    loaderOptions: {
      sass: {
        prependData: () => {
          const envName = process.env.VUE_APP_ENV_NAME;
          const hasCustomStyles =
            process.env.CUSTOM_STYLES === 'true' ? true : false;
          if (hasCustomStyles && envName !== undefined) {
            // If there is an env name defined, import Sass
            // overrides.
            // It is important that these imports stay in this
            // order to make sure enviroment overrides
            // take precedence over the default BMC styles
            return `
              @import "@/assets/styles/bmc/helpers";
              @import "@/env/assets/styles/_${envName}";
              @import "@/assets/styles/bootstrap/_helpers";
            `;
          } else {
            // Include helper imports so single file components
            // do not need to include helper imports

            // BMC Helpers must be imported before Bootstrap helpers to
            // take advantage of Bootstrap's use of the Sass !default
            // statement. Moving this helper after results in Bootstrap
            // variables taking precedence over BMC's
            return `
              @import "@/assets/styles/bmc/helpers";
              @import "@/assets/styles/bootstrap/_helpers";
            `;
          }
        }
      }
    }
  },
  devServer: {
    https: true,
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
    const hasCustomStore = process.env.CUSTOM_STORE === 'true' ? true : false;
    const hasCustomRouter = process.env.CUSTOM_ROUTER === 'true' ? true : false;

    if (process.env.NODE_ENV === 'production') {
      config.plugins.push(
        new CompressionPlugin({
          deleteOriginalAssets: true
        })
      );
    }

    if (envName !== undefined) {
      if (hasCustomStore) {
        // If env has custom store, resolve store module in src/main.js
        config.resolve.alias['./store$'] = `./env/store/${envName}.js`;
      }
      if (hasCustomRouter) {
        // If env has custom router, resolve router module in src/main.js
        config.resolve.alias['./router$'] = `./env/router/${envName}.js`;
      }
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
