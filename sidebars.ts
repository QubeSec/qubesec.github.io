import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docs: [
    {
      type: 'doc',
      id: 'index',
      label: 'Introduction',
    },
    {
      type: 'category',
      label: 'Core Guides',
      collapsed: false,
      items: [
        'qrng',
        'certificates',
        'keyexchange',
        'signatures',
      ],
    },
    {
      type: 'category',
      label: 'Deep Dives',
      collapsed: false,
      items: [
        'architecture',
        'quickstart',
        'api-reference',
      ],
    },
  ],
};

export default sidebars;
