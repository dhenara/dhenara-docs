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
        'dhenara-agent/getting-started/installation',
        'dhenara-agent/getting-started/quick-start',
        'dhenara-agent/getting-started/core-concepts',
      ],
    },
    {
      type: 'category',
      label: 'Examples',
      collapsed: false,
      link: {
        type: 'doc',
        id: 'dhenara-agent/examples/index',
      },
      items: [
        'dhenara-agent/examples/simple-chatbot',
        'dhenara-agent/examples/single-shot-coder',
        'dhenara-agent/examples/auto-coder',
        'dhenara-agent/examples/image-agent',
      ],
    },
    {
      type: 'category',
      label: 'Architecture',
      collapsed: false,
      items: [
        'dhenara-agent/architecture/overview',
        'dhenara-agent/architecture/component-model',
        'dhenara-agent/architecture/execution-model',
      ],
    },
    {
      type: 'category',
      label: 'Components',
      collapsed: false,
      items: [
        'dhenara-agent/components/agents',
        'dhenara-agent/components/flows',
        'dhenara-agent/components/nodes',
        'dhenara-agent/components/custom-components',
      ],
    },
    {
      type: 'category',
      label: 'CLI',
      collapsed: false,
      link: {
        type: 'doc',
        id: 'dhenara-agent/cli/index',
      },
      items: ['dhenara-agent/cli/overview', 'dhenara-agent/cli/commands', 'dhenara-agent/cli/extending'],
    },

    {
      type: 'category',
      label: 'Features',
      collapsed: false,
      items: [
        'dhenara-agent/features/execution-context',
        'dhenara-agent/features/templating-system',
        'dhenara-agent/features/resource-management',
        'dhenara-agent/features/observability',
      ],
    },
    {
      type: 'category',
      label: 'Advanced Guides',
      collapsed: false,
      items: [
        'dhenara-agent/advanced-guides/run-system',
        'dhenara-agent/advanced-guides/event-system',
        'dhenara-agent/advanced-guides/input-handling',
        'dhenara-agent/advanced-guides/implementation-flow',
      ],
    },
    {
      type: 'category',
      label: 'API Reference',
      collapsed: false,
      items: [
        'dhenara-agent/api-reference/core-api',
        'dhenara-agent/api-reference/agent-api',
        'dhenara-agent/api-reference/flow-api',
        'dhenara-agent/api-reference/node-api',
      ],
    },
  ],
};

export default sidebars;
