import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docsSidebar: [
    'introduction',
    {
      type: 'category',
      label: 'Getting Started',
      collapsed: false,
      items: [
        'getting-started/installation',
        'getting-started/quick-start',
        'getting-started/key-concepts',
      ],
    },
    {
      type: 'category',
      label: 'Why Dhenara',
      collapsed: false,
      link: {
        type: 'doc',
        id: 'why-dhenara/why-dhenara',
      },
      items: [
        'why-dhenara/langchain-vs-dhenara',
      ]
    },
    {
      type: 'category',
      label: 'Features',
      collapsed: false,
      link: {
        type: 'doc',
        id: 'features/features-overview',
      },
      items: [
        'features/multi-turn-conversations',
        'features/usasge-and-charge',
        'features/streaming-simplified',
        'features/type-safety',
        'features/reasoning',
        'features/test-mode-and-async',
        'features/models',
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
            'samples/text-gen/text-gen',
            'samples/text-gen/text-gen-async',
            'samples/text-gen/streaming',
          ],
        },
        {
          type: 'category',
          label: 'Image Generation',
          collapsed: false,
          items: [
            'samples/image-gen/image-gen',
          ],
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
};

export default sidebars;
