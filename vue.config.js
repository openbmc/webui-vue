const CompressionPlugin = require('compression-webpack-plugin');

module.exports = {
  devServer: {
    proxy: {
      '/': {
        target: process.env.BASE_URL,
        onProxyRes: proxyRes => {
          if (proxyRes.headers['set-cookie']) {
            // Need to remove 'Secure' flag on set-cookie value so browser
            // can create cookie for local development
            const cookies = proxyRes.headers['set-cookie'].map(cookie =>
              cookie.replace(/; secure/gi, '')
            );
            proxyRes.headers['set-cookie'] = cookies;
          }
        }
      }
    },
    port: 8000
  },
  productionSourceMap: false,
  configureWebpack: config => {
    if (process.env.NODE_ENV === 'production') {
      config.plugins.push(
        new CompressionPlugin({
          deleteOriginalAssets: true
        })
      );
    }
  },
  chainWebpack: config => {
    if (process.env.NODE_ENV === 'production') {
      config.plugins.delete('prefetch');
      config.plugins.delete('preload');
    }
  }
};
