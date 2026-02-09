---
title: Type Safety
---

# Type Safety and Unified Response Format

Dhenara is designed with strong type safety principles at its core, ensuring robust and predictable behavior when
working with AI models. This page explains our approach to type safety and unified response formats, and how this
benefits your development workflow.

## Type Safety with Pydantic

Dhenara uses Pydantic models throughout the library for both requests and responses. This gives you:

- Strong runtime validation
- Autocomplete/type hints in your IDE
- A consistent response shape across providers

### Key Benefits of Dhenara's Type System

- **Early Error Detection**: Invalid data structures are caught immediately during object creation, not when trying to
  use the data.
- **Self-Documenting Code**: The type definitions serve as documentation, making it clear what data is expected.
- **IDE Support**: Get autocompletion and type hints in your IDE, making development faster and more efficient.
- **Runtime Safety**: Prevent unexpected errors from propagating through your application.

### Enumerations

Provider/model “enums” are real types (not stringly-typed constants), which keeps configs consistent.

## Unified Response Data Format

One of Dhenara's standout features is its unified response format across all AI providers, making it simple to switch
between models or use multiple models in the same application.

### Consistent Response Structure

Whether you're using OpenAI, Google AI, Anthropic, or any other provider, the response structure remains consistent:

```python
response = client.generate(prompt="Say hello")
chat = response.chat_response

if chat:
    print(chat.text())
    print(chat.reasoning())
    print(chat.structured())
    print(chat.tools())
```

### Unified Content Items

All AI model responses are normalized into standardized content item types:

- `ChatResponseTextContentItem` - For standard text responses
- `ChatResponseReasoningContentItem` - For model reasoning/thinking
- `ChatResponseStructuredOutputContentItem` - For structured JSON outputs (validated)
- `ChatResponseToolCallContentItem` - For tool/function calls
- `ImageResponseContentItem` - For generated images

This means you can process responses without worrying about provider-specific formats:

```python
from dhenara.ai.types.genai.dhenara.response import ChatResponseContentItemType

chat = response.chat_response
if chat:
    for choice in chat.choices:
        for content in choice.contents or []:
            if content.type == ChatResponseContentItemType.TEXT:
                print(content.get_text())
            elif content.type == ChatResponseContentItemType.REASONING:
                print("Reasoning:", content.get_text())
```

### Standardized Streaming Support

Dhenara's streaming implementation works the same way across all providers:

```python
from dhenara.ai.types.shared import SSEEventType, SSEResponse

response = client.generate(prompt="Stream a short poem")
for chunk, final_response in response.stream_generator:
    if isinstance(chunk, SSEResponse) and chunk.event == SSEEventType.TOKEN_STREAM:
        for choice_delta in chunk.data.choice_deltas:
            for content_delta in choice_delta.content_deltas or []:
                text = content_delta.get_text_delta()
                if text:
                    print(text, end="", flush=True)

if final_response and final_response.chat_response:
    print("\n\nFinal:", final_response.chat_response.text())
```

### Unified Usage and Cost Tracking

Track token usage and costs consistently across providers:

```python
# Access usage data the same way for all providers
if response.chat_response.usage:
    print(f"Prompt tokens: {response.chat_response.usage.prompt_tokens}")
    print(f"Completion tokens: {response.chat_response.usage.completion_tokens}")
    print(f"Total tokens: {response.chat_response.usage.total_tokens}")

    if response.chat_response.usage_charge:
        print(f"Cost: ${response.chat_response.usage_charge.cost}")
```

## Practical takeaway

You can write one set of response-handling code, then switch providers/models by changing the endpoint — not the rest of
your app.

## Next steps

If you want the “full recipe” patterns (multi-turn, streaming, validation loops, debugging), these guides are the best
place to start:

- [Structured Output (Pydantic)](/dhenara-ai/guides/structured-output)
- [Tools & Function Calling](/dhenara-ai/guides/tools-and-function-calling)
- [Artifacts & Debugging](/dhenara-ai/guides/artifacts-and-debugging)
