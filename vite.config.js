import { fileURLToPath, URL } from 'node:url';
import { defineConfig, loadEnv  } from 'vite';
import vue from '@vitejs/plugin-vue';
import basicSsl from '@vitejs/plugin-basic-ssl';
// import VitePluginSass from 'vite-plugin-sass';

const CWD = process.cwd();
const DEV_ENV_CONFIG = loadEnv('developement', CWD);
const {VITE_BASE_URL} = loadEnv(DEV_ENV_CONFIG,CWD);
console.log('VITE_BASE_URL:', VITE_BASE_URL);
export default defineConfig({
  // other configurations...
  plugins: [
    vue(),
    basicSsl(),
  ],  
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `
        @use "sass:math";
        @import "./src/assets/styles/bmc/helpers/_variables.scss";
        @import "./src/assets/styles/bmc/helpers/_colors.scss";
        @import "./src/assets/styles/bootstrap/_helpers.scss";
        @import "./src/assets/styles/bootstrap/_index.scss";
        @import './src/assets/styles/_obmc-custom.scss';
        `,
      },
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))      
    }
  },
  optimizeDeps: {
    exclude: ['bootstrap-vue-next'],
  },
  server: {
    https: true, // Enable HTTPS
    port: 8000,   // TCP Port 8000 is commonly used for development environments of web server software.
    proxy: {
      // Proxy settings if you need to proxy API requests
      '/api': {
        target: VITE_BASE_URL,
        changeOrigin: true,
         // Bypass SSL certificate validation (for development only)
         secure: false,
         rewrite: (path) => path.replace(/^\/api/, ''),
        // Custom middleware to modify proxy response headers
        onProxyRes: (proxyRes) => {
          // Remove the 'strict-transport-security' header
          delete proxyRes.headers['strict-transport-security'];
        },
      },
    },
        // Custom middleware to add headers
        middlewares: [
          (req, res, next) => {
            res.setHeader('Connection', 'keep-alive');
            next();
          },
        ],
  },
});
