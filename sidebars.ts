import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  // Sidebar for dhenara-ai
  dhenaraAiSidebar: [
    //{ type: 'html', value: '<div class="nav-section-title">Dhenara AI</div>', className: 'sidebar-section-title' },
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
        'dhenara-ai/features/usage-and-charge',
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
    //{
    //  type: 'html',
    //  value: '<div class="nav-section-title">Dhenara Agent DSL</div>',
    //  className: 'sidebar-section-title',
    //},
    // 1) Intro
    'dhenara-agent/introduction',

    // 2) Getting Started
    {
      type: 'category',
      label: 'Getting Started',
      collapsed: false,
      items: ['dhenara-agent/getting-started/installation', 'dhenara-agent/getting-started/quick-start'],
    },

    // 3) Concepts
    {
      type: 'category',
      label: 'Concepts',
      collapsed: false,
      items: [
        'dhenara-agent/concepts/core-concepts',
        {
          type: 'category',
          label: 'Components',
          collapsed: false,
          items: [
            'dhenara-agent/concepts/components/nodes',
            'dhenara-agent/concepts/components/flows',
            'dhenara-agent/concepts/components/agents',
            'dhenara-agent/concepts/components/custom-components',
          ],
        },
        'dhenara-agent/concepts/templating-system',
        'dhenara-agent/concepts/execution-context',
        'dhenara-agent/concepts/observability',
        'dhenara-agent/concepts/run-system',
        'dhenara-agent/concepts/event-system',
        'dhenara-agent/concepts/input-handling',
      ],
    },
    // 4) Guides( Tutorials & Examples merged)
    {
      type: 'category',
      label: 'Guides',
      collapsed: false,
      collapsible: true,
      link: {
        type: 'doc',
        id: 'dhenara-agent/guides/tutorials/index',
      },
      items: [
        {
          type: 'category',
          label: 'Tutorials',
          collapsed: true,
          collapsible: true,
          link: {
            type: 'doc',
            id: 'dhenara-agent/guides/tutorials/index',
          },
          items: [
            // Tutorials
            {
              type: 'category',
              label: 'Single Shot Command-Line Coding Assistant',
              link: {
                type: 'doc',
                id: 'dhenara-agent/guides/tutorials/command-line-coder/index',
              },
              collapsed: true,
              collapsible: true,
              items: [
                'dhenara-agent/guides/tutorials/single-shot-coder/part-1',
                'dhenara-agent/guides/tutorials/single-shot-coder/part-2',
              ],
            },
            {
              type: 'category',
              label: 'Enhanced Command-Line Coding Assistant',
              link: {
                type: 'doc',
                id: 'dhenara-agent/guides/tutorials/command-line-coder/index',
              },
              collapsed: true,
              collapsible: true,
              items: [
                'dhenara-agent/guides/tutorials/command-line-coder/part-1',
                'dhenara-agent/guides/tutorials/command-line-coder/part-2',
                'dhenara-agent/guides/tutorials/command-line-coder/part-3',
                'dhenara-agent/guides/tutorials/command-line-coder/part-4',
              ],
            },
          ],
        },
        // Examples
        {
          type: 'category',
          label: 'Examples',
          collapsed: true,
          collapsible: true,
          link: {
            type: 'doc',
            id: 'dhenara-agent/guides/examples/index',
          },
          items: [
            'dhenara-agent/guides/examples/simple-chatbot',
            'dhenara-agent/guides/examples/auto-coder',
            'dhenara-agent/guides/examples/single-shot-coder',
            'dhenara-agent/guides/examples/image-agent',
          ],
        },
      ],
    },

    // 5) Core Architecture
    {
      type: 'category',
      label: 'Architecture',
      collapsed: false,
      collapsible: true,
      items: [
        'dhenara-agent/architecture/overview',
        'dhenara-agent/architecture/component-model',
        'dhenara-agent/architecture/execution-model',
      ],
    },

    // 6) CLI
    {
      type: 'category',
      label: 'Command-Line Interface',
      collapsed: false,
      link: {
        type: 'doc',
        id: 'dhenara-agent/cli/index',
      },
      items: ['dhenara-agent/cli/overview', 'dhenara-agent/cli/commands', 'dhenara-agent/cli/extending'],
    },

    // 7) API Reference
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
