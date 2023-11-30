import { defineConfig } from 'vitepress';

// https://vitepress.dev/reference/site-config
export default defineConfig({
  ignoreDeadLinks: false,
  base: '/webui-vue/',
  title: 'OpenBMC Web UI Style Guide',
  description:
    'Guidance on code style and development for the OpenBMC browser-based UI',
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      {
        text: 'Guide',
        link: '/guide/',
      },
      {
        text: 'Customization',
        link: '/customization/',
      },
      {
        text: 'Github',
        link: 'https://github.com/openbmc/webui-vue',
      },
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Getting Started',
          link: '/guide/',
        },
        {
          text: 'Coding Standards',
          collapsed: true,
          items: [
            { text: 'JavaScript and SASS', link: '/guide/coding-standards/' },
            {
              text: 'Accessibility',
              link: '/guide/coding-standards/accessibility',
            },
          ],
        },
        {
          text: 'Guidelines',
          collapsed: true,
          items: [
            { text: 'Colors', link: '/guide/guidelines/colors' },
            {
              text: 'Internationalization',
              link: '/guide/guidelines/internationalization',
            },
            { text: 'Motion', link: '/guide/guidelines/motion' },
            { text: 'Typography', link: '/guide/guidelines/typography' },
          ],
        },
        { text: 'Unit Testing', link: '/guide/unit-testing/' },
        {
          text: 'Components',
          collapsed: true,
          items: [
            { text: 'Components', link: '/guide/components/' },
            { text: 'Alerts', link: '/guide/components/alerts/' },
            { text: 'Buttons', link: '/guide/components/buttons/' },
            { text: 'FormFile', link: '/guide/components/file-upload/' },
            { text: 'InfoTooltip', link: '/guide/components/info-tooltip/' },
            { text: 'Page Section', link: '/guide/components/page-section/' },
            { text: 'Page Title', link: '/guide/components/page-title/' },
            { text: 'Status Icon', link: '/guide/components/status-icon/' },
            { text: 'Table', link: '/guide/components/table/' },
            { text: 'Toasts', link: '/guide/components/toasts/' },
          ],
        },
        {
          text: 'Quick Start',
          collapsed: true,
          items: [
            { text: 'Forms', link: '/guide/quickstart/forms' },
            { text: 'page-anatomy', link: '/guide/quickstart/page-anatomy' },
            { text: 'Store Anatomy', link: '/guide/quickstart/store-anatomy' },
          ],
        },
      ],
      '/customization/': [
        {
          text: 'Presentation Layer Architecture',
          link: '/customization/',
        },
        {
          text: 'Theme customization',
          link: '/customization/theme/',
        },
        {
          text: 'Build Customization',
          link: '/customization/build/',
        },
      ],
    },
  },
});
