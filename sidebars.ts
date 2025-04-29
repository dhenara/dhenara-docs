import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  // Sidebar for dhenara-ai
  dhenaraAiSidebar: [
    'dhenara-ai/introduction',
    {
      type: 'category',
      label: 'Getting Started',
      collapsed: false,
      items: [
        'dhenara-ai/getting-started/installation',
        'dhenara-ai/getting-started/quick-start',
        'dhenara-ai/getting-started/key-concepts',
      ],
    },
    {
      type: 'category',
      label: 'Why Dhenara',
      collapsed: false,
      link: {
        type: 'doc',
        id: 'dhenara-ai/why-dhenara/why-dhenara',
      },
      items: ['dhenara-ai/why-dhenara/langchain-vs-dhenara'],
    },
    {
      type: 'category',
      label: 'Features',
      collapsed: false,
      link: {
        type: 'doc',
        id: 'dhenara-ai/features/features-overview',
      },
      items: [
        'dhenara-ai/features/multi-turn-conversations',
        'dhenara-ai/features/resource-configuration',
        'dhenara-ai/features/usasge-and-charge',
        'dhenara-ai/features/streaming-simplified',
        'dhenara-ai/features/type-safety',
        'dhenara-ai/features/reasoning',
        'dhenara-ai/features/test-mode-and-async',
        'dhenara-ai/features/models',
      ],
    },
    {
      type: 'category',
      label: 'Samples',
      collapsed: false,
      items: [
        {
          type: 'category',
          label: 'Text Generation',
          collapsed: false,
          items: [
            'dhenara-ai/samples/text-gen/text-gen',
            'dhenara-ai/samples/text-gen/text-gen-async',
            'dhenara-ai/samples/text-gen/streaming',
          ],
        },
        {
          type: 'category',
          label: 'Image Generation',
          collapsed: false,
          items: ['dhenara-ai/samples/image-gen/image-gen'],
        },
      ],
    },

    /*
    {
      type: 'category',
      label: 'Guides',
      items: [
        'guides/basic-usage',
        'guides/working-with-models',
        'guides/streaming-responses',
        'guides/file-integration',
        {
          type: 'category',
          label: 'Provider Guides',
          items: [
            'guides/provider-guides/openai',
            'guides/provider-guides/google-ai',
            'guides/provider-guides/anthropic',
            'guides/provider-guides/deepseek',
          ],
        },
      ],
    },
    {
      type: 'category',
      label: 'Foundation Models',
      items: [
        'foundation-models/overview',
        'foundation-models/text-generation',
        'foundation-models/image-generation',
        'foundation-models/custom-models',
      ],
    },
    {
      type: 'category',
      label: 'API Reference',
      items: [
        'api-reference/aimodelclient',
        'api-reference/types-system',
        'api-reference/providers',
        'api-reference/configuration',
      ],
    },
    {
      type: 'category',
      label: 'Advanced',
      items: [
        'advanced/customization',
        'advanced/error-handling',
        'advanced/performance-tips',
        'advanced/contributing',
      ],
    },
    */
  ],

  // Sidebar for dhenara-agent
  dhenaraAgentSidebar: [
    'dhenara-agent/introduction',
    {
      type: 'category',
      label: 'Getting Started',
      collapsed: false,
      items: [
        'dhenara-agent/introduction',
        //'dhenara-agent/getting-started/installation',
        //'dhenara-agent/getting-started/quick-start',
      ],
    },
  ],
};

export default sidebars;
