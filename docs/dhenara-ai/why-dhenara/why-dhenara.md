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
import os

from dhenara.ai import AIModelClient
from dhenara.ai.types import AIModelAPI, AIModelAPIProviderEnum, AIModelCallConfig, AIModelEndpoint
from dhenara.ai.types.genai.foundation_models.anthropic.chat import ClaudeSonnet45

api = AIModelAPI(
    provider=AIModelAPIProviderEnum.ANTHROPIC,
    api_key=os.environ["ANTHROPIC_API_KEY"],
)
endpoint = AIModelEndpoint(api=api, ai_model=ClaudeSonnet45)

client = AIModelClient(
    model_endpoint=endpoint,
    config=AIModelCallConfig(max_output_tokens=200),
    is_async=False,
)

# Generate a response
response = client.generate(prompt="Hello! What can you help me with?")

assert response.chat_response
print(response.chat_response.text())

# For multi-turn chat: append the assistant message back into history
history = []
assistant_message = response.chat_response.to_message_item()
if assistant_message:
    history.append(assistant_message)
```

## Learn More

- [Compare Dhenara vs. LangChain](./langchain-vs-dhenara.md) to see how Dhenara differs from other frameworks
- Explore our [Features](../features/features-overview.md) section for detailed capabilities
- Jump into our [Quick Start](../getting-started/quick-start.md) guide to begin using Dhenara today
