---
title: Reasoning
---

# Reasoning / Thinking

Some models can emit “thinking” / “reasoning” content in addition to the final answer. Providers implement this
differently, so Dhenara normalizes it into a consistent response shape.

## Enable reasoning

```python
from dhenara.ai import AIModelClient
from dhenara.ai.types import AIModelCallConfig

client = AIModelClient(
    model_endpoint=your_model_endpoint,
    config=AIModelCallConfig(
        reasoning=True,
        reasoning_effort="medium",  # one of: minimal|low|medium|high|max
        max_reasoning_tokens=2000,   # optional; ignored by some providers
        max_output_tokens=1024,
    ),
    is_async=False,
)

response = client.generate(prompt="Solve: ∫ x^2 sin(x) dx")

chat = response.chat_response
print("Answer:\n", chat.text() if chat else None)
print("Reasoning (if exposed):\n", chat.reasoning() if chat else None)
```

## Notes

- Not all providers expose reasoning text. In those cases `chat.reasoning()` may be `None`.
- Token usage may still include reasoning tokens when supported. See `chat.usage.reasoning_tokens`.
- With streaming enabled, reasoning deltas can arrive before the final text.
