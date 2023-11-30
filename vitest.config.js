import { fileURLToPath } from 'node:url'
import { mergeConfig, defineConfig } from 'vite'
import { configDefaults } from 'vitest/config'
import viteConfig from './vite.config'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      exclude: [...configDefaults.exclude, 'e2e/*'],
      root: fileURLToPath(new URL('./', import.meta.url)),
      transformMode: {
        web: [/\.[jt]sx$/]
      }
    },
    css: {
      postcss: null,
      preprocessorOptions: {
          scss: {
            additionalData: `
        @import "./src/assets/styles/bmc/helpers/_variables.scss";
        @import "./src/assets/styles/bmc/helpers/_colors.scss";
        @import "./src/assets/styles/bootstrap/_helpers.scss";
        @import "./src/assets/styles/bootstrap/_index.scss";
        @import './src/assets/styles/_obmc-custom.scss';
            `
          },
      },
  },
  })
)
