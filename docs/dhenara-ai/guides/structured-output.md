---
title: Structured Output (Pydantic)
---

# Structured Output (Pydantic)

Structured output is one of the highest-leverage features in Dhenara: you ask for output that conforms to a schema, and you get a validated object back (provider-agnostic).

This is ideal for:

- Extraction (JSON you can trust)
- Workflow steps (each turn produces a typed “state”)
- Validation-driven agent loops (fail fast when the model goes off-format)

## Basic: return a Pydantic model

```python
from pydantic import BaseModel, Field

from dhenara.ai import AIModelClient
from dhenara.ai.types import AIModelCallConfig


class ProductRatings(BaseModel):
    rating: int = Field(..., ge=1, le=5)
    value_for_money_rating: int = Field(..., ge=1, le=5)


class ProductReview(BaseModel):
    product_name: str
    rating: ProductRatings
    pros: list[str]
    cons: list[str]
    summary: str


client = AIModelClient(
    model_endpoint=endpoint,
    config=AIModelCallConfig(
        structured_output=ProductReview,
        max_output_tokens=1000,
    ),
)

resp = client.generate(prompt="Write a review for iPhone 15 Pro Max")
chat = resp.chat_response

# Returns a Python dict (validated against the schema)
review = chat.structured()

# Or, if the provider returned something invalid, Dhenara raises during parsing/validation.
print(review["product_name"], review["rating"]["rating"])
```

## Multi-turn pattern: typed outputs per step

In multi-turn workflows, you typically:

1) Keep a `messages: list[MessageItem]` history
2) Add a user `Prompt`
3) Generate a response
4) Append `final.chat_response.to_message_item()` back to `messages`
5) Validate and use the structured payload in your app

This is the core pattern used in the canonical examples.

## Streaming note

Streaming yields partial chunks, but the *final* response is where you should read structured output:

```python
resp = client.generate(messages=messages)

for chunk, final in resp.stream_generator:
    # render token deltas (optional)
    pass

if final and final.chat_response:
    payload = final.chat_response.structured()
```

## See runnable examples

If you want the full “production recipe” (streaming + multi-turn + structured output + validation per turn, and optional reasoning), these scripts are the canonical source:

- `packages/dhenara_ai/examples/21_structed_output.py`
- `packages/dhenara_ai/examples/17_multi_turn_with_structured_output_and_messages_api.py`
- `packages/dhenara_ai/examples/19_streaming_multi_turn_structured_thinking.py`
