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
        },
      },
    },
  },
  devServer: {
    https: true,
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
  configureWebpack: (config) => {
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
        config.resolve.alias[
          './AppNavigationMixin$'
        ] = `@/env/components/AppNavigation/${envName}.js`;
      }
    }

    if (process.env.NODE_ENV === 'production') {
      config.plugins.push(
        new CompressionPlugin({
          deleteOriginalAssets: true,
        })
      );
    }
  },
  pluginOptions: {
    i18n: {
      localeDir: 'locales',
      enableInSFC: true,
    },
  },
};
