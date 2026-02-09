---
title: 'Streaming'
---

# Streaming

This example shows how to consume streaming responses.

For the full runnable script (with richer console rendering), see `packages/dhenara_ai/examples/02_text_streaming.py`.

```python
import os

from dhenara.ai import AIModelClient
from dhenara.ai.types import (
    AIModelAPI,
    AIModelAPIProviderEnum,
    AIModelCallConfig,
    AIModelEndpoint,
    ChatResponseChunk,
)
from dhenara.ai.types.genai.foundation_models.anthropic.chat import ClaudeSonnet45
from dhenara.ai.types.shared import SSEErrorResponse, SSEEventType, SSEResponse

# 1. Create an API
# This can be used to create multiple model endpoints for the same API provider
api = AIModelAPI(
    provider=AIModelAPIProviderEnum.ANTHROPIC,
    api_key=os.environ["ANTHROPIC_API_KEY"],
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
        streaming=True,
        reasoning=False,
        max_output_tokens=400,
    ),
    is_async=False,  # Sync mode/ async mode
)


response = client.generate(
    prompt="Explain quantum computing in one paragraph.",
    instructions=["Be concise."],
)


def print_text_deltas(chunk: ChatResponseChunk) -> None:
    for choice_delta in chunk.choice_deltas:
        for content_delta in choice_delta.content_deltas or []:
            text = content_delta.get_text_delta()
            if text:
                print(text, end="", flush=True)


for chunk, final_response in response.stream_generator:
    if chunk is not None:
        if isinstance(chunk, SSEErrorResponse):
            raise RuntimeError(f"{chunk.data.error_code}: {chunk.data.message}")

        if isinstance(chunk, SSEResponse) and chunk.event == SSEEventType.TOKEN_STREAM:
            print_text_deltas(chunk.data)

    if final_response is not None:
        assert final_response.chat_response
        print("\n\n---\nFinal consolidated response:\n")
        print(final_response.chat_response.text())
        print("\nUsage:", final_response.chat_response.usage)

```
