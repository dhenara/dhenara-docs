---
title: Tools & Function Calling
---

# Tools & Function Calling

Dhenara normalizes tool/function calling across providers and keeps the *message history structure correct* (tool calls and tool results must appear in the right order).

This guide shows the minimal pattern. For a full multi-turn implementation, use the examples linked at the end.

## 1) Define tools

You can define tools two ways:

### Option A: explicit schema

```python
from dhenara.ai.types.genai.dhenara.request import (
    FunctionDefinition,
    FunctionParameter,
    FunctionParameters,
    ToolDefinition,
)

weather_tool = ToolDefinition(
    function=FunctionDefinition(
        name="get_weather",
        description="Get the current weather for a location",
        parameters=FunctionParameters(
            type="object",
            required=["location"],
            properties={
                "location": FunctionParameter(type="string", description="City, e.g. San Francisco"),
                "unit": FunctionParameter(
                    type="string",
                    description="celsius or fahrenheit",
                    allowed_values=["celsius", "fahrenheit"],
                ),
            },
        ),
    )
)
```

### Option B: from a Python callable

```python
from typing import Any

from dhenara.ai.types import ToolDefinition


def get_weather(location: str, unit: str = "celsius") -> dict[str, Any]:
    """Get the current weather in a given location.

    :param location: The city and state, e.g. San Francisco, CA
    :param unit: celsius or fahrenheit
    """
    return {"location": location, "unit": unit, "temperature": 22}


get_weather_tool = ToolDefinition.from_callable(get_weather)
```

## 2) Call the model with tools enabled

```python
from dhenara.ai import AIModelClient
from dhenara.ai.types import AIModelCallConfig, ToolChoice

client = AIModelClient(
    model_endpoint=endpoint,
    config=AIModelCallConfig(
        tools=[get_weather_tool],
        tool_choice=ToolChoice(type="zero_or_more"),
        streaming=False,
    ),
)

resp = client.generate(messages=messages, instructions=["Use tools when appropriate."])
chat = resp.chat_response
```

## 3) Execute tool calls and append tool results

Tool calls arrive as normalized content items on `chat.choices[0].contents`.

In a multi-turn loop, the correct pattern is:

- Append the assistant response as a single message (`chat.to_message_item()`)
- Execute each tool call
- Append a `ToolCallResult` message

```python
import json

from dhenara.ai.types.genai.dhenara.request import ToolCallResult

# 1) Preserve assistant message (including tool calls)
assistant_msg = chat.to_message_item()
if assistant_msg:
    messages.append(assistant_msg)

# 2) Execute tool calls
for content in chat.choices[0].contents or []:
    if content.type == "tool_call" and content.tool_call:
        call = content.tool_call
        args = call.arguments
        result = TOOL_REGISTRY[call.name](**args)

        # 3) Append tool result with the same call_id
        messages.append(
            ToolCallResult(
                call_id=call.call_id,
                name=call.name,
                output=result,
            )
        )
```

## Provider nuance: reasoning + tools

Some providers have constraints when combining “thinking/reasoning” with tool calling in multi-turn conversations.

If you enable reasoning and tools together, ensure you preserve the full assistant message content in history (including reasoning/thinking blocks where required), or disable reasoning for those turns.

## See runnable examples

- `packages/dhenara_ai/examples/16_multi_turn_with_tools_and_messages_api.py`
- `packages/dhenara_ai/examples/18_streaming_multi_turn_with_tools_and_structured_output.py`
- `packages/dhenara_ai/examples/20_fn_calling.py`
