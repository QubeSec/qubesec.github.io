import type { Config } from '@docusaurus/types';
import type { Preset } from '@docusaurus/preset-classic';
import { themes as prismThemes } from 'prism-react-renderer';

const config: Config = {
  title: 'QubeSec',
  tagline: 'Quantum-Safe Security for Kubernetes - Post-Quantum Cryptography Operator',
  url: 'https://qubesec.github.io',
  baseUrl: '/',
  favicon: '/img/qubesec.png',
  organizationName: 'QubeSec',
  projectName: 'qubesec.github.io',
  onBrokenLinks: 'throw',
  trailingSlash: true,
  
  // SEO Configuration
  headTags: [
    {
      tagName: 'meta',
      attributes: {
        name: 'keywords',
        content: 'post-quantum cryptography, kubernetes, quantum-safe, kyber, dilithium, ML-KEM, ML-DSA, NIST PQC, quantum security, kubernetes operator, cryptography',
      },
    },
    {
      tagName: 'meta',
      attributes: {
        name: 'description',
        content: 'QubeSec brings NIST-standardized post-quantum cryptography to Kubernetes. Secure your applications against quantum computing threats with Kyber, Dilithium, and more.',
      },
    },
    {
      tagName: 'meta',
      attributes: {
        property: 'og:image',
        content: 'https://qubesec.github.io/img/qubesec.png',
      },
    },
  ],
  
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
          editUrl: 'https://github.com/QubeSec/qubesec.github.io/edit/main/',
        },
        blog: false,
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
        sitemap: {
          changefreq: 'weekly',
          priority: 0.5,
          ignorePatterns: ['/tags/**'],
          filename: 'sitemap.xml',
        },
      } as Preset.Options,
    ],
  ],
  themeConfig: {
    metadata: [
      {name: 'keywords', content: 'post-quantum, cryptography, kubernetes, quantum-safe, security'},
      {name: 'twitter:card', content: 'summary_large_image'},
      {property: 'og:type', content: 'website'},
      {property: 'og:site_name', content: 'QubeSec'},
    ],
    colorMode: {
      defaultMode: 'light',
      respectPrefersColorScheme: false,
    },
    navbar: {
      title: 'QubeSec',
      logo: {
        alt: 'QubeSec',
        src: '/img/qubesec.png',
      },
      items: [
        { to: '/quickstart', label: 'Quick Start', position: 'left' },
        { to: '/keyexchange', label: 'Key Exchange', position: 'left' },
        { to: '/signatures', label: 'Signatures', position: 'left' },
        { to: '/certificates', label: 'Certificates', position: 'left' },
        { to: '/architecture', label: 'Architecture', position: 'left' },
        { to: '/api-reference', label: 'API', position: 'left' },
        { 
          href: 'https://github.com/QubeSec/QubeSec', 
          label: 'GitHub', 
          position: 'right' 
        },
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
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'yaml', 'json', 'typescript', 'nginx', 'docker'],
    },
  },
  themes: [
    '@docusaurus/theme-mermaid',
    [
      '@cmfcmf/docusaurus-search-local',
      {
        indexBlog: false,
        indexPages: false,
      },
    ],
  ],
  markdown: {
    mermaid: true,
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },
};

export default config;
