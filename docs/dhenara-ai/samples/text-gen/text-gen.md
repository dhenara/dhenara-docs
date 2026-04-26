---
title: 'Text Generation'
---

# Text Generation

Smallest “hello world” for text generation.

For a full runnable script, see `examples/01_text_generation.py`.

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
    config=AIModelCallConfig(
        max_output_tokens=400,
        streaming=False,
    ),
    is_async=False,
)

response = client.generate(
    prompt="What are three ways to improve productivity?",
    instructions=["Be specific and actionable."],
)

assert response.chat_response
print(response.chat_response.text())

# Optional metrics (if enabled)
print(response.chat_response.usage)
print(response.chat_response.usage_charge)
```

## Reasoning / thinking models

If you enable reasoning on a reasoning-capable model, you can also read any exposed “thinking text” via `reasoning()`.

```python
from dhenara.ai import AIModelClient
from dhenara.ai.types import AIModelCallConfig


client = AIModelClient(
    model_endpoint=endpoint,
    config=AIModelCallConfig(
        reasoning=True,
        reasoning_effort="medium",
        max_reasoning_tokens=800,
        streaming=False,
    ),
    is_async=False,
)

response = client.generate(prompt="Summarize time blocking in 4 bullets.")

assert response.chat_response
print(response.chat_response.reasoning() or "")
print(response.chat_response.text())
```

When reasoning is enabled on a model that exposes thinking content, the normalized chat response usually contains both
reasoning items and text items. Read the provider-agnostic reasoning text with `response.chat_response.reasoning()`
instead of parsing provider-specific raw payloads.
