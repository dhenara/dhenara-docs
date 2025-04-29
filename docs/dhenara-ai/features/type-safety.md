---
title:  Type Safety
---

# Type Safety and Unified Response Format

Dhenara is designed with strong type safety principles at its core, ensuring robust and predictable behavior when working with AI models. This page explains our approach to type safety and unified response formats, and how this benefits your development workflow.

## Type Safety with Pydantic Models

### Comprehensive Type Validation

Dhenara uses Pydantic models throughout the library to enforce strict type validation, helping you catch errors early in the development process instead of at runtime.

```python
from dhenara.ai.types.genai import ChatResponse, ChatResponseUsage

# All models are properly typed and validated
response = ChatResponse(
    model="gpt-4",
    provider=AIModelProviderEnum.OPEN_AI,
    usage=ChatResponseUsage(
        total_tokens=100,
        prompt_tokens=50,
        completion_tokens=50
    ),
    choices=[...]
)
```

### Key Benefits of Dhenara's Type System

- **Early Error Detection**: Invalid data structures are caught immediately during object creation, not when trying to use the data.
- **Self-Documenting Code**: The type definitions serve as documentation, making it clear what data is expected.
- **IDE Support**: Get autocompletion and type hints in your IDE, making development faster and more efficient.
- **Runtime Safety**: Prevent unexpected errors from propagating through your application.

### Type-Safe Enumerations

Dhenara uses enumerations for all categorical values, providing compile-time and runtime validation:

```python
from dhenara.ai.types.external_api import AIModelProviderEnum

# Use strongly typed enumerations
provider = AIModelProviderEnum.OPEN_AI  # Safe, validated at runtime
provider = "some_random_string"  # Error! Caught by type checking
```

## Unified Response Data Format

One of Dhenara's standout features is its unified response format across all AI providers, making it simple to switch between models or use multiple models in the same application.

### Consistent Response Structure

Whether you're using OpenAI, Google AI, Anthropic, or any other provider, the response structure remains consistent:

```python
# The format is the same whether using OpenAI, Google AI, Anthropic, etc.
response = chat_client.generate(prompt=prompt)
if response.chat_response:
    # Access data the same way regardless of the provider
    text = response.chat_response.choices[0].contents[0].text
```

### Unified Content Items

All AI model responses are normalized into standardized content item types:

- `ChatResponseTextContentItem` - For standard text responses
- `ChatResponseReasoningContentItem` - For model reasoning/thinking
- `ChatResponseToolCallContentItem` - For tool/function calls
- `ImageResponseContentItem` - For generated images

This means you can easily process responses without worrying about provider-specific formats:

```python
# Works with any provider
for choice in response.chat_response.choices:
    for content in choice.contents:
        if content.type == "text":
            print(content.text)
        elif content.type == "reasoning":
            print(f"Reasoning: {content.thinking_text}")
```

### Standardized Streaming Support

Dhenara's streaming implementation works the same way across all providers:

```python
async with client as c:
    response = await c.generate_async(prompt=prompt)
    async for chunk, _ in response.async_stream_generator:
        # Process streaming chunks consistently regardless of provider
        if chunk and chunk.data:
            for delta in chunk.data.choice_deltas:
                for content_delta in delta.content_deltas:
                    print(content_delta.get_text_delta(), end="")
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

## Comparison with Other Libraries

### Versus LangChain

While LangChain provides a wide range of integrations, it often lacks strict type safety:

| Feature | Dhenara | LangChain |
|---------|---------|-----------|
| **Type Safety** | Strong typing with Pydantic models throughout | Mixed, often relies on dictionaries or loosely typed objects |
| **Response Format** | Unified response structure across all providers | Different response formats for different providers |
| **Error Handling** | Structured error types with detailed information | Often passes through provider-specific errors |
| **Usage Tracking** | Consistent usage and cost tracking | Varies by integration |
| **IDE Support** | Full autocompletion and type hints | Limited due to looser typing |

### Versus Direct Provider SDKs

Using provider SDKs directly can be challenging when working with multiple AI models:

| Feature | Dhenara | Direct Provider SDKs |
|---------|---------|---------------------|
| **Cross-Provider Compatibility** | Same code works across providers | Need different code for each provider |
| **Response Structure** | Normalized, consistent structure | Different structures for each provider |
| **Learning Curve** | Learn once, use everywhere | Learn each provider's unique API |
| **Type Safety** | Consistent type checking | Varies by provider |

## Benefits for Development Teams

Having a type-safe, unified API across providers offers significant advantages for teams:

1. **Reduced Cognitive Load**: Developers don't need to context-switch between different provider APIs
2. **Code Reusability**: Write code that works with any supported AI model
3. **Easy Provider Switching**: Compare models or switch providers without rewriting application code
4. **Safer Refactoring**: Type checking catches issues when changing code
5. **Better Collaboration**: Clear interfaces make it easier for team members to work together

## Example: Working with Different Providers

```python
from dhenara.ai import AIModelClient
from dhenara.ai.types.external_api import OpenAiMessageRoleEnum

# Function that works with any provider
async def get_completion(client, question):
    prompt = {
        "role": OpenAiMessageRoleEnum.USER,
        "content": question
    }

    response = await client.generate_async(prompt=prompt)

    # Same access pattern regardless of the underlying provider
    if response.chat_response:
        return response.chat_response.choices[0].contents[0].text
    return None

# Works with OpenAI
async with AIModelClient(openai_endpoint) as client:
    answer = await get_completion(client, "What is machine learning?")

# Works with Anthropic without changing access code
async with AIModelClient(anthropic_endpoint) as client:
    answer = await get_completion(client, "What is machine learning?")
```

The type safety and unified response format in Dhenara make it an ideal choice for teams building production applications with AI, where predictability, reliability, and maintainability are crucial.