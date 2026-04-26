---
id: introduction
title: Introduction
# INFO:
# - To make this as the landing page, without a `homepage` use
#   slug: / # To enable `docs-only-mode`
#
sidebar_position: 1
---

# Introduction

Dhenara AI is an open source Python package for calling multiple LLM providers through one typed interface. It keeps
the integration surface small: provider credentials, model selection, prompt and message formatting, streaming, tool
use, reasoning, and structured output all flow through the same core client types.

## Why Dhenara?

- **Genuinely Open Source**: Built from the ground up as a community resource, not an afterthought or internal tool
- **Unified API**: Interact with different AI providers through a consistent interface
- **Type Safety**: Built with Pydantic for robust type checking and validation
- **Easy Regeneration across Providers**: With a unified Pydantic output and built-in prompt formatting, send output
  from a model to any other model easily
- **Streaming**: First-class support for streaming responses along with accumulated responses similar to non-streaming
  responses
- **Async Support**: Both synchronous and asynchronous interfaces for maximum flexibility
- **Centralized Resource Management**: Keep provider credentials, APIs, and model endpoints in one place with
  `ResourceConfig`
- **Credential Security**: Keep sensitive API keys and credentials separate from application code
- **Dynamic Model Selection**: Switch between models and providers at runtime without reconfiguration
- **Provider Abstraction**: Interact with foundation models regardless of which provider is serving them
- **Foundation Models**: Pre-configured models with sensible defaults
- **Test Mode**: Bring up your app with dummy responses for streaming and non-streaming generation
- **Cost/Usage Data**: Derived cost and usage data along with responses, with optional charge for each model endpoint
  for commercial deployment
- **Community-Oriented Design**: An architecture separating API credentials, models, and configurations for flexible
  deployment and scaling

## Key Features

- **Open Source and Extensible**: Transparently designed codebase that encourages community contributions and extensions
- **Multiple Model Families**: Work with OpenAI, Google, Anthropic, and other packaged model definitions through one
  response shape
- **Multiple API Providers**: Support for direct OpenAI, Google Gemini Developer API, Anthropic, Google Vertex AI,
  Amazon Bedrock, and Microsoft OpenAI-compatible endpoints
- **Text and Image Generation**: Generate text or images through the same interface
- **Streaming Support**: Stream responses for better user experience
- **Accumulated Streaming Response**: Process stream responses in the same way you do with non-streaming
- **File Integration**: Easily incorporate files into your prompts
- **Cost Tracking**: Monitor token usage and associated costs
- **Extensible Design**: Add custom models, providers, or model configurations

## Example Usage

Here's a simple example using the public `ResourceConfig` credential flow:

```python
from dhenara.ai import AIModelClient
from dhenara.ai.types import AIModelAPIProviderEnum, AIModelCallConfig, ResourceConfig

resource_config = ResourceConfig()
resource_config.load_from_file(credentials_file=None, init_endpoints=True)

endpoint = resource_config.get_model_endpoint(
    model_name="claude-haiku-4-5",
    api_provider=AIModelAPIProviderEnum.ANTHROPIC,
)
if endpoint is None:
    raise RuntimeError("No Anthropic endpoint configured for claude-haiku-4-5")

client = AIModelClient(
    model_endpoint=endpoint,
    config=AIModelCallConfig(max_output_tokens=300),
    is_async=False,
)

response = client.generate(
    prompt="Explain quantum computing in simple terms.",
    instructions=["Keep the answer under 120 words."],
)

assert response.chat_response
print(response.chat_response.text())
```

When `credentials_file=None`, `ResourceConfig.load_from_file(...)` resolves
`$DAI_SECRET_CONFIG_DIR/dai_credentials.yaml` and falls back to `/run/secrets/dai/dai_credentials.yaml` if the
environment variable is unset.

## Next Steps

- Follow the [Installation](/dhenara-ai/getting-started/installation) guide to get started
- Check out the [Quick Start](/dhenara-ai/getting-started/quick-start) for more examples
- Learn about [Key Concepts](/dhenara-ai/getting-started/key-concepts) in Dhenara
