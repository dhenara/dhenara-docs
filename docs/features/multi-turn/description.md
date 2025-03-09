---
title:  Code Explained
---

# Multi-Turn Conversations with Dhenara

One of Dhenara's most powerful features is its ability to seamlessly manage multi-turn conversations with AI models. The code in [previius page](./code.md) guide demonstrates how to create coherent, context-aware conversations across multiple turns, even when switching between different AI models and providers.

## Overview

Multi-turn conversations allow your application to maintain context across separate interactions with AI models. This is essential for creating natural dialogue flows, chatbots, interactive assistants, and any application where the conversation history matters.

### Key Features

- **Cross-Provider Memory**: Seamlessly switch between models from different providers (OpenAI, Anthropic, Google) while preserving context
- **Conversation History Management**: Simple structure for storing and accessing conversation history
- **Dynamic Model Selection**: Flexibility to choose different models for each conversation turn
- **Per-Turn Instructions**: Set specific instructions for each conversation turn
- **Strongly Typed**: Clean, type-safe implementation with Pydantic models

## How It Works

Dhenara uses a simple yet powerful system to manage conversation state through `ConversationNode` objects, which store each turn's query, response, and metadata. The `PromptFormatter` handles the conversion of conversation history into formats appropriate for each provider.

## Example: Building a Multi-Turn Conversation

Here's a complete implementation showing how to create a multi-turn conversation that switches between AI models:

```python
import datetime
import random
from typing import Any

from dhenara.ai import AIModelClient
from dhenara.ai.providers.common.prompt_formatter import PromptFormatter
from dhenara.ai.types import AIModelCallConfig, AIModelEndpoint
from dhenara.ai.types.conversation._node import ConversationNode
from dhenara.ai.types.external_api import AIModelAPIProviderEnum
from dhenara.ai.types.genai import AIModelAPI
from dhenara.ai.types.genai.foundation_models.anthropic.chat import Claude35Haiku, Claude37Sonnet
from dhenara.ai.types.genai.foundation_models.google.chat import Gemini20Flash, Gemini20FlashLite
from dhenara.ai.types.genai.foundation_models.openai.chat import GPT4oMini, O3Mini

# Initialize API configurations
anthropic_api = AIModelAPI(
    provider=AIModelAPIProviderEnum.ANTHROPIC,
    api_key="your_anthropic_api_key",
)
openai_api = AIModelAPI(
    provider=AIModelAPIProviderEnum.OPEN_AI,
    api_key="your_openai_api_key",
)
google_api = AIModelAPI(
    provider=AIModelAPIProviderEnum.GOOGLE_AI,
    api_key="your_google_api_key",
)


# Create various model endpoints
all_model_endpoints = [
    AIModelEndpoint(api=anthropic_api, ai_model=Claude37Sonnet),
    AIModelEndpoint(api=anthropic_api, ai_model=Claude35Haiku),
    AIModelEndpoint(api=openai_api, ai_model=O3Mini),
    AIModelEndpoint(api=openai_api, ai_model=GPT4oMini),
    AIModelEndpoint(api=google_api, ai_model=Gemini20Flash),
    AIModelEndpoint(api=google_api, ai_model=Gemini20FlashLite),
]


def get_context(previous_nodes: list[ConversationNode], destination_model: Any) -> list[Any]:
    """Process previous conversation nodes into context for the next turn."""
    context = []

    for node in previous_nodes:
        prompts = PromptFormatter.format_conversion_node_as_prompts(
            model=destination_model,
            user_query=node.user_query,
            attached_files=node.attached_files,
            previous_response=node.response,
        )
        context.extend(prompts)

    return context


def handle_conversation_turn(
    user_query: str,
    instructions: list[str],
    endpoint: AIModelEndpoint,
    conversation_nodes: list[ConversationNode],
) -> ConversationNode:
    """Process a single conversation turn with the specified model and query."""

    client = AIModelClient(
        model_endpoint=endpoint,
        config=AIModelCallConfig(
            max_output_tokens=1000,
            streaming=False,
        ),
        is_async=False,
    )

    # Format the user query
    prompt = PromptFormatter.format_conversion_node_as_prompts(
        model=endpoint.ai_model,
        user_query=user_query,
        attached_files=[],
        previous_response=[],
    )[0]

    # Get context from previous turns (if any)
    context = get_context(conversation_nodes, endpoint.ai_model) if conversation_nodes else []

    # Generate response
    response = client.generate(
        prompt=prompt,
        context=context,
        instructions=instructions,
    )

    # Create conversation node
    node = ConversationNode(
        user_query=user_query,
        attached_files=[],
        response=response.chat_response,
        timestamp=datetime.datetime.now().isoformat(),
    )

    return node


def run_multi_turn_conversation():
    multi_turn_queries = [
        "Tell me a short story about a robot learning to paint.",
        "Continue the story but add a twist where the robot discovers something unexpected.",
        "Conclude the story with an inspiring ending.",
    ]

    # Instructions for each turn
    instructions_by_turn = [
        ["Be creative and engaging."],
        ["Build upon the previous story seamlessly."],
        ["Bring the story to a satisfying conclusion."],
    ]

    # Store conversation history
    conversation_nodes = []

    # Process each turn
    for i, query in enumerate(multi_turn_queries):
        # Choose a random model endpoint
        model_endpoint = random.choice(all_model_endpoints)
        # OR choose if fixed order as
        # model_endpoint = all_model_endpoints[i]

        print(f"🔄 Turn {i + 1} with {model_endpoint.ai_model.model_name} from {model_endpoint.api.provider}\n")

        node = handle_conversation_turn(
            user_query=query,
            instructions=instructions_by_turn[i],  # Only if you need to change instruction on each turn, else leave []
            endpoint=model_endpoint,
            conversation_nodes=conversation_nodes,
        )

        # Display the conversation
        print(f"User: {query}")
        print(f"Model: {model_endpoint.ai_model.model_name}\n")
        print(f"Model Response:\n {node.response.choices[0].contents[0].get_text()}\n")
        print("-" * 80)

        # Append to nodes, so that next turn will have the context generated
        conversation_nodes.append(node)


if __name__ == "__main__":
    run_multi_turn_conversation()
```

## Advantages Over Other Libraries

Dhenara's approach to multi-turn conversations offers several advantages:

### 1. Simplified Provider Switching

Unlike other libraries that may require different handlers for different providers, Dhenara's abstraction allows you to seamlessly switch between models from different providers (OpenAI, Anthropic, Google) while maintaining conversation context.

### 2. Clean State Management

The `ConversationNode` structure provides a clear, intuitive way to manage conversation history without complex memory chains or callbacks.

### 3. Full Control Over Instructions

You can easily provide different system instructions for each turn of the conversation, allowing for dynamic guidance as the conversation evolves.

### 4. Type Safety and Reliability

Strong typing via Pydantic models ensures your conversation structures are validated at runtime.

### 5. Provider-Agnostic Implementation

The same code works across all supported providers without modification.

## Common Use Cases

- **Chatbots with Memory**: Build chatbots that remember previous interactions
- **Multi-Stage Processes**: Guide users through multi-step workflows
- **Dynamic Model Selection**: Use cost-effective models for simple queries and more powerful models for complex ones
- **Provider Fallback**: Switch providers if one is unavailable or rate-limited
- **A/B Testing Models**: Compare responses from different models for the same conversation

## Next Steps

- **Add File Support**: Extend the example to include file attachments in conversation turns
- **Implement Streaming**: Modify the configuration to enable streaming responses
- **Add Error Handling**: Implement retries and fallbacks for failed requests
- **Add Async Support**: Convert the example to use async/await for improved performance in server environments

## Conclusion

Dhenara's multi-turn conversation capabilities provide a powerful foundation for building sophisticated AI interactions with minimal code. The clean, provider-agnostic design allows you to focus on your application logic rather than wrangling different provider APIs.