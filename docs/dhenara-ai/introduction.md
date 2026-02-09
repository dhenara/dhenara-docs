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

Dhenara-AI is a powerful, flexible, and truly open-source Python framework for interacting with AI models from various
providers. Similar to LangChain but with a focus on simplicity and performance, Dhenara provides a unified interface to
work with models from OpenAI, Google AI, Anthropic, and other providers.

## Why Dhenara?

- **Genuinely Open Source**: Built from the ground up as a community resource, not an afterthought or internal tool
- **Unified API**: Interact with different AI providers through a consistent interface
- **Type Safety**: Built with Pydantic for robust type checking and validation
- **Easy Regeneration across Providers**: With a unified Pydantic output and built-in prompt formatting, send output
  from a model to any other model easily
- **Streaming**: First-class support for streaming responses along with accumulated responses similar to non-streaming
  responses
- **Async Support**: Both synchronous and asynchronous interfaces for maximum flexibility
- **Centralized Resource Management**: Configure all AI models and API credentials in one place with a simple YAML
  configuration
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
- **Multiple Model Providers**: Support for OpenAI, Google AI, Anthropic, and DeepSeek
- **Multiple API Providers**: Support for Vertex AI, Amazon Bedrock, Microsoft Azure AI along with OpenAI, Google AI &
  Anthropic
- **Text and Image Generation**: Generate text or images through the same interface
- **Streaming Support**: Stream responses for better user experience
- **Accumulated Streaming Response**: Process stream responses in the same way you do with non-streaming
- **File Integration**: Easily incorporate files into your prompts
- **Cost Tracking**: Monitor token usage and associated costs
- **Extensible Design**: Add custom models, providers, or model configurations

## Example Usage

Here's a simple example of using Dhenara to interact with an AI model:

```python
import os

from dhenara.ai import AIModelClient
from dhenara.ai.types import AIModelAPI, AIModelAPIProviderEnum, AIModelCallConfig, AIModelEndpoint
from dhenara.ai.types.genai.foundation_models.anthropic.chat import ClaudeSonnet45

# Create an API
api = AIModelAPI(
    provider=AIModelAPIProviderEnum.ANTHROPIC,
  api_key=os.environ["ANTHROPIC_API_KEY"],
)

# Create an endpoint using a pre-configured model
model_endpoint = AIModelEndpoint(
    api=api,
    ai_model=ClaudeSonnet45,
)

# Create the client
client = AIModelClient(
    model_endpoint=model_endpoint,
  config=AIModelCallConfig(max_output_tokens=300),
    is_async=False,
)

# Generate a response
response = client.generate(prompt="Explain quantum computing in simple terms")

assert response.chat_response
print(response.chat_response.text())

```

## Next Steps

- Follow the [Installation](/dhenara-ai/getting-started/installation) guide to get started
- Check out the [Quick Start](/dhenara-ai/getting-started/quick-start) for more examples
- Learn about [Key Concepts](/dhenara-ai/getting-started/key-concepts) in Dhenara
