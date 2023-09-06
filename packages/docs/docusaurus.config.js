// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require("prism-react-renderer/themes/github");
const darkCodeTheme = require("prism-react-renderer/themes/dracula");
require("dotenv").config();

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "Syft Next",
  tagline: "Universal event analytics for nextjs",
  favicon: "img/favicon.ico",

  // Set the production url of your site here
  url: `https://${process.env.VERCEL_URL}` || "https://docs.syftdata.com",
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: "/",

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: "SyftData", // Usually your GitHub org/user name.
  projectName: "Syft", // Usually your repo name.

  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  scripts: [
    {
      src: "/js/koala.js",
      async: false,
    },
  ],

  presets: [
    [
      "classic",
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve("./sidebars.js"),
          sidebarCollapsible: false,
          breadcrumbs: false,
          routeBasePath: "/",
          remarkPlugins: [
            [require("@docusaurus/remark-plugin-npm2yarn"), { sync: true }],
          ],
        },
        blog: false,
        theme: {
          customCss: require.resolve("./src/css/custom.css"),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      image: "img/docusaurus-social-card.jpg",
      navbar: {
        title: "Syft",
        logo: {
          alt: "Syft Logo",
          src: "img/logo.png",
        },
        items: [
          {
            href: "https://www.syftdata.com/blog",
            label: "Blog",
            position: "right",
          },
          {
            href: "https://github.com/syftdata/syft",
            position: "right",
            className: "header-github-link github-button",
            "aria-label": "GitHub",
          },
        ],
      },
      footer: {
        style: "dark",
        links: [
          {
            label: "Discord",
            href: "https://discordapp.com/invite/docusaurus",
          },
          {
            label: "Twitter",
            href: "https://twitter.com/syftdata",
          },
          {
            label: "GitHub",
            href: "https://github.com/syftdata/syft",
            className: "github-button",
            "aria-label": "GitHub",
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Syft Data, Inc.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
    }),
};

module.exports = config;
