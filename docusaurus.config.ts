import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Dhenara',
  tagline: 'A flexible framework for interacting with AI models',
  favicon: 'img/favicon.png',

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
          // Update this to your repo path
          //editUrl: "https://github.com/dhenara/dhenara/tree/main/docs/",
        },
        blog: false, // Set to false to disable the blog plugin
        theme: {
          customCss: './src/css/custom.css',
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
        //{
        //  type: 'docSidebar',
        //  sidebarId: 'docsSidebar',
        //  position: 'left',
        //  label: 'Documentation',
        //},
        {
          href: 'https://dhenara.com',
          label: 'dhenara.com',
          position: 'right',
        },
        {
          href: 'https://github.com/dhenara/dhenara',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    announcementBar: {
      id: 'github_star',
      content: '⭐ If you find Dhenara helpful, <b> please <a target="_blank" rel="noopener noreferrer" href="https://github.com/dhenara/dhenara">give us a star on GitHub</a>!</b>',
      backgroundColor: '#fafbfc',
      textColor: '#091E42',
      isCloseable: true, // Set to false if you want it to be persistent
    },

    docs: {
      sidebar: {
        hideable: false,
        autoCollapseCategories: false,
      }
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
          title: 'Documentation',
          items: [
            {
              label: 'Getting Started',
              to: '/getting-started/installation'  // Remove the `/docs/` prefix as its configured as the root path
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
              href: 'https://github.com/dhenara/dhenara',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Dhenara Inc.`,
    },
    prism: {
      theme: prismThemes.vsLight,
      darkTheme: prismThemes.vsDark , // palenight, vsDark, dracula,
      additionalLanguages: ['python'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
