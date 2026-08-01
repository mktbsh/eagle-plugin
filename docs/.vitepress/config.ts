import { defineConfig } from "vitepress";

const repository = "https://github.com/mktbsh/eagle-plugin";

export default defineConfig({
  lang: "ja-JP",
  title: "Eagle Plugin",
  description: "TypeScript tooling for Eagle plugin development",
  base: process.env.DOCS_BASE ?? "/",
  cleanUrls: true,
  lastUpdated: false,
  themeConfig: {
    nav: [
      { text: "Guide", link: "/guide/" },
      { text: "Packages", link: "/packages/" },
      { text: "Architecture", link: "/architecture/" },
      { text: "Roadmap", link: "/roadmap" },
    ],
    sidebar: {
      "/guide/": [
        {
          text: "Start here",
          items: [
            { text: "Overview", link: "/guide/" },
            { text: "Getting started", link: "/guide/getting-started" },
            { text: "Development loop", link: "/guide/development" },
            { text: "Release preparation", link: "/guide/release" },
          ],
        },
      ],
      "/packages/": [
        {
          text: "Packages",
          items: [
            { text: "Overview", link: "/packages/" },
            {
              text: "create-eagle-plugin",
              link: "/packages/create-eagle-plugin",
            },
            { text: "eagle-plugin", link: "/packages/eagle-plugin" },
            { text: "eagle-plugin-dts", link: "/packages/eagle-plugin-dts" },
            {
              text: "eagle-plugin-manifest",
              link: "/packages/eagle-plugin-manifest",
            },
          ],
        },
      ],
      "/architecture/": [
        {
          text: "Architecture",
          items: [
            { text: "Overview", link: "/architecture/" },
            {
              text: "Framework specification",
              link: "/specs/0001-eagle-plugin-framework",
            },
          ],
        },
      ],
      "/specs/": [
        {
          text: "Specifications",
          items: [
            { text: "Framework", link: "/specs/0001-eagle-plugin-framework" },
          ],
        },
      ],
      "/adr/": [
        {
          text: "Architecture decisions",
          collapsed: true,
          items: [
            {
              text: "Manifest trust boundary",
              link: "/adr/0001-generate-manifest-from-typed-config",
            },
            {
              text: "Entrypoint inference",
              link: "/adr/0002-infer-entrypoints-from-file-layout",
            },
            {
              text: "One command surface",
              link: "/adr/0003-use-one-eagle-command-surface",
            },
            {
              text: "Local development bridge",
              link: "/adr/0004-use-a-local-bridge-for-development",
            },
            {
              text: "Preflight and review",
              link: "/adr/0005-separate-preflight-from-review-approval",
            },
            {
              text: "Strict manifest schema",
              link: "/adr/0006-derive-manifest-artifacts-from-a-strict-schema",
            },
            {
              text: "Release directory contract",
              link: "/adr/0007-use-a-strict-framework-release-directory-contract",
            },
          ],
        },
      ],
    },
    outline: [2, 3],
    search: { provider: "local" },
    socialLinks: [{ icon: "github", link: repository }],
    editLink: {
      pattern: `${repository}/edit/main/docs/:path`,
      text: "Edit this page on GitHub",
    },
    footer: {
      message: "Released under the MIT License.",
      copyright: "Copyright © 2026 mktbsh",
    },
  },
});
