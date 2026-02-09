---
title: Advanced Recipes
---

# Advanced Recipes

If you’re evaluating Dhenara AI, this page is the fastest way to see why it’s more than “just another wrapper”.

Dhenara’s core advantage is that **advanced workflows stay simple**:

- Multi-turn conversations with a provider-friendly Messages API
- Streaming that always yields both deltas and the final accumulated response
- Structured output validated with Pydantic schemas
- Tools/function calling with normalized content items
- Artifacts that capture request/response data for debugging

## Recipe 1: Multi-turn, the “correct” way

Use `messages` for chatbots and workflows. You keep history, then append the assistant message back into history.

```python
from dhenara.ai.types.genai.dhenara.request import MessageItem, Prompt

messages: list[MessageItem] = []

messages.append(Prompt.with_text("Give me 3 names for a new CLI tool"))
resp1 = client.generate(messages=messages)
messages.append(resp1.chat_response.to_message_item())

messages.append(Prompt.with_text("Pick the best name and write a 1-paragraph pitch"))
resp2 = client.generate(messages=messages)
print(resp2.chat_response.text())
```

More detail: see **Prompts & Messages**.

## Recipe 2: Streaming + final accumulated response

Streaming gives you incremental deltas and also a final response object you can safely parse (usage, structured output, etc.).

```python
resp = client.generate(messages=messages)

for chunk, final in resp.stream_generator:
    # render token deltas (optional)
    pass

if final and final.chat_response:
    print(final.chat_response.text())
```

## Recipe 3: Structured output (validated)

Define a Pydantic schema and ask the model to produce it. Then validate and consume it as data, not text.

```python
from pydantic import BaseModel, Field
from dhenara.ai.types import AIModelCallConfig


class TaskPlan(BaseModel):
    title: str
    steps: list[str] = Field(..., min_length=1)


client = AIModelClient(
    model_endpoint=endpoint,
    config=AIModelCallConfig(
        structured_output=TaskPlan,
        max_output_tokens=800,
    ),
)

resp = client.generate(prompt="Create a 5-step migration plan from Flask to Django")
plan = resp.chat_response.structured()
print(plan["title"], plan["steps"][0])
```

More detail: see **Structured Output (Pydantic)**.

## Recipe 4: Tools/function calling (multi-turn loop)

Tools are normalized into content items. In multi-turn workflows:

1) Append the assistant message as a whole (`to_message_item()`)
2) Execute tool calls
3) Append tool results (`ToolCallResult`)

More detail: see **Tools & Function Calling**.

## Recipe 5: Artifacts (debugging superpower)

When you’re diagnosing provider differences, formatting issues, or validation failures, enable artifacts per call.

```python
from dhenara.ai.types import AIModelCallConfig
from dhenara.ai.types.genai.dhenara.request import ArtifactConfig

client = AIModelClient(
    model_endpoint=endpoint,
    config=AIModelCallConfig(
        artifact_config=ArtifactConfig(
            enabled=True,
            artifact_root="./runs/my_debug_run/turn_01",
            prefix="call_001",
            capture_dhenara_request=True,
            capture_provider_request=True,
            capture_provider_response=True,
            capture_dhenara_response=True,
        )
    ),
)
```

More detail: see **Artifacts & Debugging**.

## Canonical runnable examples

Want the full map from “capability” → “script”? See the [Runnable Examples Index](/dhenara-ai/guides/runnable-examples).

These examples show the full “production recipe” patterns end-to-end:

- Tools + messages API: `16_multi_turn_with_tools_and_messages_api.py`
- Structured output: `21_structed_output.py`
- Function calling: `20_fn_calling.py`
- Streaming + tools + structured output: `18_streaming_multi_turn_with_tools_and_structured_output.py`
- Streaming + multi-turn + structured + reasoning + validation: `19_streaming_multi_turn_structured_thinking.py`

## Where to go next

- [Prompts & Messages](/dhenara-ai/guides/prompt-formatter)
- [Structured Output (Pydantic)](/dhenara-ai/guides/structured-output)
- [Tools & Function Calling](/dhenara-ai/guides/tools-and-function-calling)
- [Artifacts & Debugging](/dhenara-ai/guides/artifacts-and-debugging)
