const lightCodeTheme = require("prism-react-renderer/themes/github");
const darkCodeTheme = require("prism-react-renderer/themes/vsDark");

/** @type {import('@docusaurus/types').DocusaurusConfig} */
module.exports = {
  title: "React Worldmap",
  tagline:
    "A pure react component to draw a map of world countries. Simple. Free.",
  url: "https://yanivam.github.io",
  baseUrl: "/react-svg-worldmap/",
  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",
  themeConfig: {
    navbar: {
      title: "React Worldmap",
      items: [
        {
          type: "doc",
          docId: "introduction",
          position: "left",
          label: "Docs",
        },
        {
          type: "dropdown",
          label: "Examples",
          items: [
            { to: "/examples/sizing", label: "Sizing" },
            { to: "/examples/custom-style", label: "Custom styles" },
            { to: "/examples/localization", label: "Localization" },
            { to: "/examples/onclick", label: "Onclick action" },
            { to: "/examples/links", label: "Binding links" },
            { to: "/examples/text-labels", label: "Text labels" },
            { to: "/examples/rich-interaction", label: "Rich interactions" },
          ],
        },
        {
          href: "https://github.com/yanivam/react-svg-worldmap",
          label: "GitHub",
          position: "right",
        },
      ],
    },
    footer: {
      style: "dark",
      copyright: `Copyright © ${new Date().getFullYear()} Yams. Built with Docusaurus.`,
    },
    prism: {
      theme: lightCodeTheme,
      darkTheme: darkCodeTheme,
    },
  },
  presets: [
    [
      "@docusaurus/preset-classic",
      {
        docs: {
          path: "../docs",
          editUrl:
            "https://github.com/yanivam/react-svg-worldmap/edit/main/docs/",
          routeBasePath: "/",
          remarkPlugins: [
            [require("@docusaurus/remark-plugin-npm2yarn"), { sync: true }],
          ],
        },
        blog: false,
        theme: {
          customCss: require.resolve("./src/css/custom.css"),
        },
      },
    ],
  ],
};
