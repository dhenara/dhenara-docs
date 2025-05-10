---
title: Why Dhenara
---

# Why Dhenara

## A Foundation for Production AI Applications

Dhenara is a Python framework designed to simplify AI integration in production applications. Unlike other frameworks
that prioritize experimentation, Dhenara focuses on clean, maintainable, and robust AI implementations suitable for
production environments.

## Core Design Principles

Dhenara was built with these principles in mind:

- **Simplicity over complexity**: Direct patterns that are easy to understand and maintain
- **Type safety throughout**: Catch errors early with strong typing and validation
- **Unified provider interface**: The same code works across OpenAI, Anthropic, Google, and more
- **Production-readiness**: Built-in features for monitoring, cost tracking, and testing

## Why Choose Dhenara?

Dhenara addresses common challenges developers face when building AI-powered applications:

- **Tired of boilerplate code?** Dhenara reduces implementation complexity with a clean, intuitive API
- **Struggling with provider-specific implementations?** Our unified interface makes switching between AI providers
  seamless
- **Need reliable production systems?** Built-in cost tracking, testing modes, and comprehensive error handling
- **Want both flexibility and control?** Keep direct access to conversation state while benefiting from helper utilities

## Perfect For

- **Production web applications** integrating multiple AI providers
- **Enterprise solutions** requiring robust error handling and cost monitoring
- **Complex conversation flows** that need explicit state management
- **Cross-provider applications** that need to work with multiple AI vendors

## Getting Started

Dhenara is designed to be easy to learn and implement in your projects:

```python
from dhenara.ai import AIModelClient, AIModelCallConfig
from dhenara.ai.types import ConversationNode

# Create a client with your model endpoint
client = AIModelClient(my_endpoint)

# Generate a response
response = client.generate(
    prompt={"role": "user", "content": "Hello, how can you help me?"}
)

# Store in conversation history
conversation = [
    ConversationNode(
        user_query="Hello, how can you help me?",
        response=response.chat_response,
        timestamp=datetime.now().isoformat()
    )
]
```

## Learn More

- [Compare Dhenara vs. LangChain](./langchain-vs-dhenara.md) to see how Dhenara differs from other frameworks
- Explore our [Features](../features/features-overview.md) section for detailed capabilities
- Jump into our [Quick Start](../getting-started/quick-start.md) guide to begin using Dhenara today
