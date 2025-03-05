---
id: introduction
title: Introduction
slug: / # To enable `docs-only-mode`
sidebar_position: 1
---


# Introduction to Dhenara

Dhenara-AI is a powerful, flexible Python framework for interacting with AI models from various providers. Similar to LangChain but with a focus on simplicity and performance, Dhenara provides a unified interface to work with models from OpenAI, Google AI, Anthropic, and other providers.

## Why Dhenara?

- **Unified API**: Interact with different AI providers through a consistent interface
- **Type Safety**: Built with Pydantic for robust type checking and validation
- **Async Support**: Both synchronous and asynchronous interfaces for maximum flexibility
- **Streaming**: First-class support for streaming responses
- **Resource Management**: Automatic handling of connections, retries, and timeouts
- **Foundation Models**: Pre-configured models with sensible defaults

## Key Features

- **Multiple Model Providers**: Support for OpenAI, Google AI, Anthropic, and DeepSeek
- **Text and Image Generation**: Generate text or images through the same interface
- **Streaming Support**: Stream responses for better user experience
- **File Integration**: Easily incorporate files into your prompts
- **Cost Tracking**: Monitor token usage and associated costs
- **Extensible Design**: Add custom providers or model configurations

## Example Usage

Here's a simple example of using Dhenara to interact with an AI model:

```python
from dhenara.ai import AIModelClient, AIModelCallConfig
from dhenara.ai.types.genai.ai_model import AIModelEndpoint
from dhenara.ai.types.external_api import AIModelAPIProviderEnum, AIModelProviderEnum
from dhenara.ai.types.genai.foundation_models import OPENAI_CHAT_MODELS

# Create an API configuration
api = AIModelAPI(
    provider=AIModelAPIProviderEnum.OPEN_AI,
    api_key="your-api-key"
)

# Create an endpoint using a pre-configured model
model_endpoint = AIModelEndpoint(
    api=api,
    ai_model=OPENAI_CHAT_MODELS[0]  # Using GPT-4o
)

# Configure the call
config = AIModelCallConfig(
    streaming=True,
    max_output_tokens=1000
)

# Create a prompt
prompt = {
    "role": "user",
    "content": "Explain quantum computing in simple terms"
}

# Generate a response
async with AIModelClient(model_endpoint, config) as client:
    response = await client.generate(prompt=prompt)

    # If streaming
    if response.async_stream_generator:
        async for chunk, _ in response.async_stream_generator:
            if chunk:
                print(chunk.data.choice_deltas[0].content_deltas[0].get_text_delta(), end="")
    # If not streaming
    elif response.chat_response:
        print(response.chat_response.choices[0].contents[0].get_text())
```

## Next Steps

- Follow the [Installation](./getting-started/installation) guide to get started
- Check out the [Quick Start](./getting-started/quick-start) for more examples
- Learn about [Key Concepts](./getting-started/key-concepts) in Dhenara
