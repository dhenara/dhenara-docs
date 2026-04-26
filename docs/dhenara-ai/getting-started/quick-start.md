---
title: Quick Start
---

# Quick Start with Dhenara AI

This guide gets you from installation to the first successful model call using the public `ResourceConfig` flow.

## Setup

First, make sure you have Dhenara installed:

```bash
pip install dhenara-ai
```

Then create a secret directory and place `dai_credentials.yaml` inside it. For a minimal Anthropic-only quick start:

```bash
mkdir -p /path/to/secrets
export DAI_SECRET_CONFIG_DIR=/path/to/secrets
```

```yaml title="/path/to/secrets/dai_credentials.yaml"
anthropic:
  api_key: <YOUR_ANTHROPIC_API_KEY>
```

If you prefer, you can skip `DAI_SECRET_CONFIG_DIR` and pass an explicit credentials file path to
`ResourceConfig.load_from_file()` instead.

## Basic Text Generation

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
    config=AIModelCallConfig(
        max_output_tokens=1024,
        reasoning=False,
        streaming=False,
    ),
    is_async=False,
)

response = client.generate(
    prompt="What are three ways to improve productivity?",
    instructions=[
        "Be specific and actionable.",
    ],
)

if response.chat_response:
    print(response.chat_response.text())
```

`load_from_file(credentials_file=None, init_endpoints=True)` tells Dhenara AI to discover
`dai_credentials.yaml` from `DAI_SECRET_CONFIG_DIR` and initialize all compatible foundation-model endpoints.

## Enable reasoning (optional)

If your chosen model supports reasoning/thinking, set `reasoning=True`.

```python
client = AIModelClient(
    model_endpoint=endpoint,
    config=AIModelCallConfig(
        reasoning=True,
        reasoning_effort="medium",  # optional; normalized across providers
        max_reasoning_tokens=2000,  # optional; ignored by some providers
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
    async_client = AIModelClient(model_endpoint=endpoint, is_async=True)
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
