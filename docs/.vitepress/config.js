export default {
  base: '/webui-vue/',
  title: 'OpenBMC Web UI Style Guide',
  description:
    'Guidance on code style and development for the OpenBMC browser-based UI',
  themeConfig: {
    // VuePress sidebarDepth: 1 showed h2 links. The outline is that list.
    outline: 2,
    nav: [
      { text: 'Guide', link: '/guide/' },
      { text: 'Customization', link: '/customization/' },
      { text: 'Github', link: 'https://github.com/openbmc/webui-vue' },
    ],
    sidebar: {
      '/guide/': [
        { text: 'Getting Started', link: '/guide/' },
        {
          text: 'Coding Standards',
          items: [
            {
              text: 'Linting and formatting',
              link: '/guide/coding-standards/',
            },
            {
              text: 'Accessibility',
              link: '/guide/coding-standards/accessibility',
            },
          ],
        },
        {
          text: 'Guidelines',
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
          items: [
            { text: 'Overview', link: '/guide/components/' },
            { text: 'Alerts', link: '/guide/components/alerts/' },
            { text: 'Buttons', link: '/guide/components/buttons/' },
            { text: 'FormFile', link: '/guide/components/file-upload/' },
            { text: 'InfoTooltip', link: '/guide/components/info-tooltip/' },
            { text: 'Page section', link: '/guide/components/page-section/' },
            { text: 'Page title', link: '/guide/components/page-title/' },
            { text: 'StatusIcon', link: '/guide/components/status-icon/' },
            { text: 'Table', link: '/guide/components/table/' },
            { text: 'Toasts', link: '/guide/components/toasts/' },
          ],
        },
        {
          text: 'Quick Start',
          items: [
            { text: 'Forms', link: '/guide/quickstart/forms' },
            { text: 'Page Anatomy', link: '/guide/quickstart/page-anatomy' },
            { text: 'Store Anatomy', link: '/guide/quickstart/store-anatomy' },
          ],
        },
      ],
      '/customization/': [
        { text: 'Presentation Layer Architecture', link: '/customization/' },
        { text: 'Theme customization', link: '/customization/theme' },
        { text: 'Build Customization', link: '/customization/build' },
      ],
    },
  },
};
