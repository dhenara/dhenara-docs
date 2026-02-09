---
title: Streaming Simplified
---

# Streaming Simplicity in Dhenara

Dhenara provides a streamlined approach to working with streaming responses from AI models, making it significantly
easier to implement real-time AI interactions while maintaining access to complete responses.

## The Challenge with Streaming

When working with large language models, streaming responses are essential for creating responsive user experiences.
However, traditional streaming implementations introduce several challenges:

1. **Content Management**: You need to track and accumulate streaming chunks
2. **State Management**: Maintaining state across streaming chunks becomes complex
3. **Final Response Access**: Often you need both incremental updates AND the final complete response
4. **Consistent Error Handling**: Errors during streaming need special handling

## How Dhenara Simplifies Streaming

Dhenara addresses these challenges with a built-in streaming management system that handles the complexity for you.

### Automatic Consolidation of Streaming Content

```python
from dhenara.ai import AIModelClient
from dhenara.ai.types import AIModelCallConfig, ChatResponseChunk
from dhenara.ai.types.shared import SSEErrorResponse, SSEEventType, SSEResponse

# Create client with streaming enabled
client = AIModelClient(
    model_endpoint=my_endpoint,
    config=AIModelCallConfig(streaming=True)
)

# Generate a response with streaming
response = client.generate(
    prompt="Tell me a story about a robot learning to paint.",
)

# You get BOTH stream chunks AND the final consolidated response
for chunk, final_response in response.stream_generator:
    if chunk:
        if isinstance(chunk, SSEErrorResponse):
            raise RuntimeError(f"Stream error: {chunk.data.error_code}: {chunk.data.message}")

        if isinstance(chunk, SSEResponse) and chunk.event == SSEEventType.TOKEN_STREAM:
            data: ChatResponseChunk = chunk.data
            for choice_delta in data.choice_deltas:
                for content_delta in choice_delta.content_deltas or []:
                    text = content_delta.get_text_delta()
                    if text:
                        print(text, end="", flush=True)

    if final_response and final_response.chat_response:
        print("\n\nFINAL:\n", final_response.chat_response.text())
```

### Key Streaming Benefits

Dhenara provides several advantages for streaming use cases:

1. **Buffered Final Response**: Dhenara automatically accumulates streaming chunks and provides the complete response
   once streaming is finished.

2. **Simple API**: The same API works for both streaming and non-streaming requests, making your code more maintainable.

3. **Unified Error Handling**: Errors during streaming are handled consistently with non-streaming requests.

4. **Automatic Content Consolidation**: Streaming content is automatically combined into a final response, eliminating
   the need to manually reconstruct content.

5. **Provider-Agnostic**: Works consistently across different providers (OpenAI, Anthropic, Google, etc.)

## Configuration Options

Streaming behavior can be easily configured:

```python
# In your dhenara_config.py file
ENABLE_STREAMING_CONSOLIDATION = True  # Default is True
```

Or at runtime:

```python
from dhenara.ai.config import settings

# Disable streaming consolidation if needed
settings.ENABLE_STREAMING_CONSOLIDATION = False
```

## Comparison with Other Libraries

Unlike many other AI integration libraries, Dhenara's streaming solution provides both the incremental updates and the
complete final response without additional code:

| Feature                                  | Dhenara | LangChain  | Direct API |
| ---------------------------------------- | ------- | ---------- | ---------- |
| Streaming Support                        | ✅      | ✅         | ✅         |
| Automatic Content Consolidation          | ✅      | ❌         | ❌         |
| Final Response Without Manual Tracking   | ✅      | ❌         | ❌         |
| Consistent API Between Stream/Non-Stream | ✅      | ⚠️ Partial | ❌         |
| Provider-Agnostic Implementation         | ✅      | ✅         | ❌         |

## Real-World Benefits

The automatic consolidation feature is particularly valuable for:

1. **User Interfaces**: Display streaming text for responsiveness while storing the complete response for later use.

2. **Post-Processing**: Apply operations on the complete response after streaming finishes.

3. **Caching**: Cache the full consolidated response without reimplementing accumulation logic.

4. **Error Recovery**: If a streaming session is interrupted, you still have access to the content received so far.

## Conclusion

Dhenara's approach to streaming significantly reduces the complexity of working with real-time AI responses. By handling
the state management and content accumulation for you, Dhenara lets you focus on creating great user experiences instead
of managing streaming logic.

With the automatic consolidation feature, you get the best of both worlds: the responsiveness of streaming and the
convenience of complete responses, all with minimal code.
