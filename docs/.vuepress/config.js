const path = require('path');

module.exports = {
    base: "/webui-vue/",
    title: "OpenBMC Web UI Style Guide",
    description:
      "Guidance on code style and development for the OpenBMC browser-based UI",
    smoothScroll: true,
    themeConfig: {
      nav: [
        {
          text: "Guide",
          link: "/guide/"
        },
        {
          text: "Themes",
          link: "/themes/"
        },
        {
          text: "Github",
          link: "https://github.com/openbmc/webui-vue"
        }
      ],
      sidebarDepth: 1,
      sidebar: {
        "/guide/": [
          "",
          {
            title: "Coding Standards",
            children: [
              ["/guide/coding-standards/", "JavaScript and SASS"],
              ["/guide/coding-standards/accessibility", "Accessibility"],
            ]
          },
          {
            title: "Guidelines",
            children: [
              "/guide/guidelines/colors",
              "/guide/guidelines/motion",
              "/guide/guidelines/typography"
            ]
          },
          "/guide/unit-testing/",
          {
            title: "Components",
            children: [
            "/guide/components/",
            "/guide/components/alerts/",
            "/guide/components/buttons/",
            "/guide/components/file-upload/",
            "/guide/components/info-tooltip/",
            "/guide/components/page-section/",
            "/guide/components/page-title/",
            "/guide/components/status-icon/",
            "/guide/components/table/",
            "/guide/components/toasts/"
          ]
          },
          {
            title: "Quick Start",
            children: [
            "/guide/quickstart/page-anatomy",
            "/guide/quickstart/store-anatomy"
          ]
          }
        ],
        "/themes/": ["", "customize", "env"]
      },
    }
  };