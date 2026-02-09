---
title: Multi-Turn Conversations
---

## Multi-turn conversations with the Messages API

Dhenara supports multi-turn chat by keeping a list of message items. After each call, append the assistant response back
into the list using `ChatResponse.to_message_item()`.

This approach works well for:

- Chatbots and assistants
- Workflows where tool calls appear mid-conversation
- Switching models/providers while preserving a clean, provider-compatible message structure

## Example

```python
from dhenara.ai import AIModelClient
from dhenara.ai.types import AIModelAPI, AIModelAPIProviderEnum, AIModelCallConfig, AIModelEndpoint
from dhenara.ai.types.genai.dhenara.request import MessageItem, Prompt
from dhenara.ai.types.genai.foundation_models.openai.chat import GPT5Mini


api = AIModelAPI(
    provider=AIModelAPIProviderEnum.OPEN_AI,
    api_key="your_openai_api_key",
)

endpoint = AIModelEndpoint(api=api, ai_model=GPT5Mini)

client = AIModelClient(
    model_endpoint=endpoint,
    config=AIModelCallConfig(max_output_tokens=512),
    is_async=False,
)

messages: list[MessageItem] = []

turns = [
    "Tell me a short story about a robot learning to paint.",
    "Continue the story and add a twist.",
    "Conclude with an inspiring ending.",
]

for user_text in turns:
    messages.append(Prompt.with_text(user_text))

    response = client.generate(
        messages=messages,
        instructions=["Be creative and keep it under 200 words."],
    )

    chat = response.chat_response
    if not chat:
        raise RuntimeError("No chat_response returned")

    print("User:", user_text)
    print("Assistant:\n", chat.text())
    print("-" * 60)

    assistant_message = chat.to_message_item()
    if assistant_message:
        messages.append(assistant_message)
```

## Notes

- If you use tool calling, appending `to_message_item()` is important because it keeps the complete assistant message
  (text + tool calls) together.
- If you prefer `prompt`/`context`, that still works — the Messages API is recommended for multi-turn flows.
