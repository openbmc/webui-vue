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
              ["/guide/coding-standards/", "Overview"],
              ["/guide/coding-standards/accessibility", "Accessibility"],
              ["/guide/coding-standards/sass", "SASS"],
              ["/guide/coding-standards/javascript", "JavaScript"]
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
            "/guide/components/alert",
            "/guide/components/buttons/",
            "/guide/components/page",
            "/guide/components/status-icon/",
            "/guide/components/table/",
            "/guide/components/toast",
            "/guide/components/tooltip"
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