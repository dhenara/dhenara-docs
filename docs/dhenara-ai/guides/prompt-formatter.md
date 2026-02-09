---
title: Prompts & Messages
---


# Prompts, Context, and Messages

Dhenara supports multiple input styles.

## 1) Simple: `prompt`

Use this for single-shot calls.

```python
response = client.generate(prompt="Explain Kafka in one paragraph")
print(response.chat_response.text())
```

## 2) Multi-turn (recommended): `messages`

Use `messages` for chatbots and workflows. It’s provider-friendly and preserves the correct message structure (including
tool calls).

```python
from dhenara.ai.types.genai.dhenara.request import MessageItem, Prompt

messages: list[MessageItem] = [
    Prompt.with_text("Give me 3 ideas for a CLI tool"),
]

resp1 = client.generate(messages=messages)
messages.append(resp1.chat_response.to_message_item())

messages.append(Prompt.with_text("Now pick the best one and write a README outline"))
resp2 = client.generate(messages=messages)

print(resp2.chat_response.text())
```

## 3) Legacy style: `context`

If you already have history in a separate list, you can pass it via `context`. For new code, prefer the Messages API.

## Do you still need `PromptFormatter`?

Usually no. Dhenara’s request/response types are designed so that multi-turn history can be passed back directly.

If you’re migrating older code that manually transforms history between providers, `PromptFormatter` can help, but we
recommend starting from `messages` instead.
