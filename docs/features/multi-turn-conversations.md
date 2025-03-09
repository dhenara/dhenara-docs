---
title: Multi-Turn Conversations
---

## Multi-Turn Conversations with Dhenara

One of Dhenara's most powerful features is its ability to seamlessly manage multi-turn conversations with AI models. The code example demonstrates how to create coherent, context-aware conversations across multiple turns, even when switching between different AI models and providers.

Multi-turn conversations allow your application to maintain context across separate interactions with AI models. This is essential for creating natural dialogue flows, chatbots, interactive assistants, and any application where conversation history matters.

## Real World Usage

In this example, a developer is building an application that requires conversational memory while also having the flexibility to route generated outputs between models from different providers.

Traditional frameworks often make this challenging, but Dhenara provides a streamlined solution. The code below demonstrates this approach, showcasing how Dhenara manages this complexity seamlessly.


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



## How It Works

Dhenara uses a simple yet powerful system to manage conversation state through `ConversationNode` objects, which store each turn's query, response, and metadata. The `PromptFormatter` handles the conversion of conversation history into formats appropriate for each provider.

### Key Components

1. **API Configuration**: The example initializes connections to three major providers:
   ```python
   anthropic_api = AIModelAPI(provider=AIModelAPIProviderEnum.ANTHROPIC, api_key="your_anthropic_api_key")
   openai_api = AIModelAPI(provider=AIModelAPIProviderEnum.OPEN_AI, api_key="your_openai_api_key")
   google_api = AIModelAPI(provider=AIModelAPIProviderEnum.GOOGLE_AI, api_key="your_google_api_key")
   ```

2. **Model Endpoints**: Multiple model endpoints are created, giving you flexibility to use any model from any provider:
   ```python
   all_model_endpoints = [
       AIModelEndpoint(api=anthropic_api, ai_model=Claude37Sonnet),
       AIModelEndpoint(api=openai_api, ai_model=O3Mini),
       # ...and more
   ]
   ```

3. **Context Management**: The `get_context()` function processes previous conversation turns into appropriate context for the next model:
   ```python
   def get_context(previous_nodes: list[ConversationNode], destination_model: Any) -> list[Any]:
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
   ```

4. **Conversation Turn Handler**: The `handle_conversation_turn()` function manages a single conversation turn:
   - Creates an `AIModelClient` for the current model endpoint
   - Formats the user query for the specific model
   - Obtains context from previous conversation turns
   - Generates a response
   - Creates a `ConversationNode` to store the turn

5. **Multi-Turn Execution**: The `run_multi_turn_conversation()` function demonstrates:
   - Managing a series of related queries
   - Randomly selecting different models for each turn (you could also use a fixed sequence)
   - Maintaining conversation context between turns
   - Providing turn-specific instructions to each model

## Key Benefits

1. **Model Flexibility**: You can switch between models from different providers without losing context.

2. **Provider Abstraction**: The same code works with OpenAI, Anthropic, Google, and other providers.

3. **Seamless Context Transfer**: Previous conversation turns are automatically converted to the appropriate format for each model.

4. **Simple API**: Despite the complexity of managing different providers and models, the API remains simple and consistent.

## When to Use This Pattern

This pattern is ideal for:

- Building chatbots that need access to multiple models
- Creating applications that need to switch models based on specialized capabilities
- Implementing failover between different AI providers
- A/B testing different models within the same conversation flow
- Building systems where different parts of a conversation require different model strengths

Dhenara's conversation handling makes all these scenarios straightforward to implement while keeping your codebase clean and maintainable.


