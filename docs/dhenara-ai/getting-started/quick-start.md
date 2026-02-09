---
title: Quick Start
---

# Quick Start with Dhenara

This guide will help you get up and running with Dhenara quickly. We'll create a simple application that interacts with an AI model to generate text.

## Setup

First, make sure you have Dhenara installed:

```bash
pip install dhenara-ai
```

You'll need API credentials for at least one of the supported AI providers. For this example, we'll use Anthropic.

## Basic Text Generation

```python
from dhenara.ai import AIModelClient
from dhenara.ai.types import AIModelAPI, AIModelAPIProviderEnum, AIModelCallConfig, AIModelEndpoint
from dhenara.ai.types.genai.foundation_models.anthropic.chat import ClaudeSonnet45

# 1. Create an API
# This can be used to create multiple model endpoints for the same API provider
api = AIModelAPI(
    provider=AIModelAPIProviderEnum.ANTHROPIC,
    api_key="your_api_key",  # TODO: replace
)

# 2. Select or create an AI model
# You can either use the foundation models as it is, or create your own models
model = ClaudeSonnet45

# Create the model endpoint
model_endpoint = AIModelEndpoint(api=api, ai_model=model)

# Create the client
client = AIModelClient(
    model_endpoint=model_endpoint,
    config=AIModelCallConfig(
        max_output_tokens=1024,
        reasoning=False,
        streaming=False,
    ),
    is_async=False,  # Sync mode/ async mode
)


response = client.generate(
    prompt="What are three ways to improve productivity?",
    context=[],  # Optional history/context. Will show this on another example
    instructions=[
        "Be specific and actionable.",  # Optional instructions
    ],
)

print(response.chat_response.text())

if response.chat_response.usage:
    print("Tokens:", response.chat_response.usage)
if response.chat_response.usage_charge:
    print("Cost:", response.chat_response.usage_charge)
```

## Enable reasoning (optional)

If your chosen model supports reasoning/thinking, set `reasoning=True`.

```python
client = AIModelClient(
    model_endpoint=model_endpoint,
    config=AIModelCallConfig(
        reasoning=True,
        reasoning_effort="medium",  # optional; normalized across providers
        max_reasoning_tokens=2000,   # optional; ignored by some providers
        max_output_tokens=1024,
    ),
    is_async=False,
)

response = client.generate(prompt="Explain the tradeoffs between TCP and UDP")

print("Answer:\n", response.chat_response.text())
print("Reasoning (if exposed by provider):\n", response.chat_response.reasoning())
```

## Async usage

```python
import asyncio

async def main():
    async_client = AIModelClient(model_endpoint=model_endpoint, is_async=True)
    async with async_client as c:
        response = await c.generate_async(prompt="Give me 3 meal prep ideas")
        print(response.chat_response.text())

asyncio.run(main())
```

## Next Steps
- Explore [Multi-turn conversations](../features/multi-turn-conversations)
- Learn about [Features](../features/features-overview)
- Look at a [streaming sample](../samples/text-gen/streaming)

{/*
<!--
- Explore [basic usage guides](../guides/basic-usage) for more detailed examples
- Learn about [available foundation models](../foundation-models/overview)
- Check the [provider-specific guides](../guides/provider-guides/openai) for provider-specific features
-->
 */}
