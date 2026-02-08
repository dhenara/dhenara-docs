import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Dhenara Documentation',
  tagline: 'Build AI applications with Dhenara AI (Agent DSL docs archived)',
  favicon: 'img/favicon.ico',

  // Set the production url of your site here
  url: 'https://docs.dhenara.com',
  // Set the /<baseUrl>/ pathname under which your site is served
  baseUrl: '/',

  // GitHub pages deployment config.
  organizationName: 'dhenara', // Your GitHub org/user name
  projectName: 'dhenara-docs', // Your repo name
  deploymentBranch: 'gh-pages', // The branch to deploy to
  trailingSlash: false,

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          routeBasePath: '/', // Serve the docs at the site's root
          sidebarPath: './sidebars.ts',
          // Remove editUrl if you don't want the "Edit this page" links
          // editUrl: 'https://github.com/dhenara/dhenara-docs/tree/main/',
        },
        blog: false, // Set to false to disable the blog plugin
        theme: {
          customCss: './src/css/custom.css',
        },
        sitemap: {
          changefreq: 'weekly',
          priority: 0.5,
          // Keep deprecated docs accessible, but don't promote them via the sitemap.
          ignorePatterns: ['/tags/**', '/private/**', '/dhenara-agent/**'],
          filename: 'sitemap.xml',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: 'img/dhenara-social-card.jpg',
    navbar: {
      title: 'dhenara',
      logo: {
        alt: 'Dhenara Logo',
        src: 'img/logo.png',
        height: 25,
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'dhenaraAiSidebar',
          position: 'left',
          label: 'Dhenara AI',
        },
        {
          type: 'docSidebar',
          sidebarId: 'dhenaraAgentSidebar',
          position: 'left',
          label: 'Agent DSL (Deprecated)',
        },
        //{
        //  type: 'dropdown',
        //  label: 'Packages',
        //  position: 'left',
        //  items: [
        //    {
        //      label: 'dhenara-ai',
        //      to: '/dhenara-ai',
        //    },
        //    {
        //      label: 'dhenara-agent',
        //      to: '/dhenara-agent',
        //    },
        //  ],
        //},
        {
          href: 'https://dhenara.com',
          label: 'dhenara.com',
          position: 'right',
        },
        {
          href: 'https://github.com/dhenara/dhenara-ai',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    //announcementBar: {
    //  id: 'github_star',
    //  content:
    //    '⭐ If you find Dhenara helpful, <b> please <a target="_blank" rel="noopener noreferrer" href="https://github.com/dhenara/dhenara">give us a star on GitHub</a>!</b>',
    //  backgroundColor: '#fafbfc',
    //  textColor: '#091E42',
    //  isCloseable: true, // Set to false if you want it to be persistent
    //},

    docs: {
      sidebar: {
        hideable: false,
        autoCollapseCategories: false,
      },
    },
    colorMode: {
      defaultMode: 'dark',
      disableSwitch: false,
      respectPrefersColorScheme: false,
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Dhenara AI',
              to: '/dhenara-ai/introduction',
            },
            {
              label: 'Agent DSL (Deprecated)',
              to: '/dhenara-agent/introduction',
            },
            //{
            //  label: 'Guides',
            //  to: '/guides/basic-usage',
            //},
            //{
            //  label: 'API Reference',
            //  to: '/api-reference/aimodelclient',
            //},
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'GitHub Discussions',
              href: 'https://github.com/dhenara/dhenara/discussions',
            },
            {
              label: 'Issues',
              href: 'https://github.com/dhenara/dhenara/issues',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/dhenara',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Dhenara, Inc.`,
    },
    prism: {
      theme: prismThemes.vsLight,
      darkTheme: prismThemes.vsDark, // palenight, vsDark, dracula,
      additionalLanguages: ['python'],
    },
    algolia: {
      // The application ID provided by Algolia
      appId: '67YW3S51WJ',

      // Public API key: it is safe to commit it
      apiKey: '1ccbf78367f0728cdd06faa8b84c8ba4',

      indexName: 'dhenara',

      // Optional: see doc section below
      contextualSearch: true,

      // Optional: Specify domains where the navigation should occur through window.location instead on history.push. Useful when our Algolia config crawls multiple documentation sites and we want to navigate with window.location.href to them.
      //externalUrlRegex: 'external\\.com|dhenara\\.com',

      // Optional: Replace parts of the item URLs from Algolia. Useful when using the same search index for multiple deployments using a different baseUrl. You can use regexp or string in the `from` param. For example: localhost:3000 vs myCompany.com/docs
      replaceSearchResultPathname: {
        from: '/docs/', // or as RegExp: /\/docs\//
        to: '/',
      },

      // Optional: Algolia search parameters
      searchParameters: {},
      // Optional: path for search page that enabled by default (`false` to disable it)
      searchPagePath: 'search',
      // Optional: whether the insights feature is enabled or not on Docsearch (`false` by default)
      insights: false,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
