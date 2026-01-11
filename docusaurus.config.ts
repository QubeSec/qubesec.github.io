import type { Config } from '@docusaurus/types';
import type { Preset } from '@docusaurus/preset-classic';
import { themes as prismThemes } from 'prism-react-renderer';

const config: Config = {
  title: 'QubeSec',
  tagline: 'Quantum-Safe Security for Kubernetes - Post-Quantum Cryptography Operator',
  url: 'https://qubesec.github.io',
  baseUrl: '/',
  // favicon intentionally omitted; using external logo only
  organizationName: 'QubeSec',
  projectName: 'qubesec.github.io',
  onBrokenLinks: 'throw',
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },
  trailingSlash: true,
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },
  presets: [
    [
      'classic',
      {
        docs: {
          routeBasePath: '/',
          sidebarPath: require.resolve('./sidebars.ts'),
          showLastUpdateAuthor: false,
          showLastUpdateTime: false,
        },
        blog: false,
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      } as Preset.Options,
    ],
  ],
  themeConfig: {
    colorMode: {
      defaultMode: 'light',
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'QubeSec',
      logo: {
        alt: 'QubeSec',
        src: 'https://raw.githubusercontent.com/QubeSec/QubeSec/refs/heads/main/assets/qubesec.png',
      },
      items: [
        { to: '/', label: 'Docs', position: 'left' },
        { href: 'https://github.com/QubeSec/QubeSec', label: 'GitHub', position: 'right' },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            { label: 'Quick Start', to: '/quickstart' },
            { label: 'Architecture', to: '/architecture' },
            { label: 'API Reference', to: '/api-reference' },
          ],
        },
        {
          title: 'Community',
          items: [
            { label: 'GitHub', href: 'https://github.com/QubeSec/QubeSec' },
          ],
        },
      ],
      copyright: `QubeSec © ${new Date().getFullYear()} — Quantum-safe future`,
    },
    prism: {
      theme: prismThemes.dracula,
      darkTheme: prismThemes.dracula,
    },
  },
};

export default config;
