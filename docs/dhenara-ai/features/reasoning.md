---
title: Reasoning
---

# Unified Reasoning Contents

## The Challenge of Reasoning Tokens

AI models are increasingly exposing their internal "thinking" or "reasoning" processes, offering a window into how the
model arrives at its conclusions. This capability is extremely valuable for:

- Debugging model outputs
- Verifying logical chains
- Evaluating model performance
- Understanding model reasoning patterns
- Providing transparency to users

However, different AI providers implement this feature in completely different ways, creating a significant challenge
for developers who want to work with multiple models.

## How Different Providers Handle Reasoning

### Anthropic's Approach

Anthropic models like Claude 3.7 Sonnet expose reasoning through a dedicated API structure with separate content types:

```python
# Anthropic response structure (simplified)
{
    "content": [
        {
            "type": "thinking",  # Dedicated type for reasoning
            "thinking": "First, I need to analyze the financial data..."
        },
        {
            "type": "text",
            "text": "Based on my analysis, the company's growth rate is 12%..."
        }
    ]
}
```

Anthropic treats reasoning as a first-class citizen in their response structure with a distinct content type.

### DeepSeek's Approach

DeepSeek models like DeepSeek-R1 embed reasoning within the text response using XML-like markup:

```
<think>
Let me work through this step by step.
The problem is asking for the integral of x²sin(x).
I'll use integration by parts with u = x² and dv = sin(x)dx.
</think>

The integral of x²sin(x) can be solved using integration by parts...
```

The thinking process is embedded directly in the content, requiring parsing to extract it.

### OpenAI's Approach

While writing this document, OpenAI doesn't expose the reasoing tokens to developers in any manner. When they support it
in the API, we update to handle it.

## The Dhenara Solution

Dhenara provides a unified interface for working with reasoning content regardless of the provider implementation:

```python
# With Dhenara, regardless of the provider:
response = client.generate(prompt="Solve this integral: ∫x²sin(x)dx",
                          config=AIModelCallConfig(reasoning=True))

# Access reasoning content uniformly
for choice in response.chat_response.choices:
    for content in choice.contents:
        if content.type == "reasoning":
            print("Reasoning:", content.thinking_text)
        elif content.type == "text":
            print("Answer:", content.text)
```

### How Dhenara Unifies Reasoning Content

Looking at the underlying code, Dhenara:

1. **Provides standardized types** - `ChatResponseContentItemType.REASONING` is a distinct content type
2. **Handles provider differences transparently**:

   - For Anthropic: Converts `ThinkingBlock` objects directly to `ChatResponseReasoningContentItem`
   - For DeepSeek: Parses `<think>...</think>` markup and creates separate reasoning content items

3. **Supports streaming** with `ChatResponseReasoningContentItemDelta` for incremental reasoning updates

This approach means developers can code against a single consistent interface regardless of which model they're using.

Most of the existing frameworks either:

1. **Don't handle reasoning tokens specially** - they just pass through whatever the provider returns
2. **Require separate code paths** for each provider's reasoning structure
3. **Only support reasoning for specific providers** without a unified approach

## Getting Started with Reasoning in Dhenara

To use reasoning capabilities:

```python
from dhenara.ai import AIModelClient
from dhenara.ai.types import AIModelCallConfig

# Create client with a model that supports reasoning
client = AIModelClient(model_endpoint=your_model_endpoint)

# Enable reasoning in your call
response = client.generate(
    prompt="Explain how to calculate the derivative of x³sin(x)",
    config=AIModelCallConfig(
        reasoning=True,
        max_reasoning_tokens=1000  # Optional: limit reasoning tokens
    )
)

# Access both reasoning and answer
for choice in response.chat_response.choices:
    for content in choice.contents:
        if content.type == "reasoning":
            print("Model's reasoning process:")
            print(content.thinking_text)
        elif content.type == "text":
            print("\nModel's answer:")
            print(content.text)
```

By providing a unified interface for reasoning content, Dhenara significantly simplifies working with multiple AI models
and enables you to build more transparent, explainable AI applications.
