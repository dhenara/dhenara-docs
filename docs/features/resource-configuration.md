---
title: Resource Configuration
---

# Resource Configuration

The `ResourceConfig` class provides a centralized way to manage all AI Models and API credentials in Dhenara AI. This page explains how to use this powerful feature to simplify your application's resource management.

## Overview

When working with multiple AI models and providers, managing credentials and configurations can be challenging. The `ResourceConfig` class offers an elegant solution by:

1. Loading credentials from standardized configuration files
2. Automatically initializing API clients with the correct credentials
3. Creating model endpoints by matching models with compatible APIs
4. Providing a query interface to retrieve resources by attributes

## Getting Started

### Creating a Configuration

The simplest way to get started is by creating a credentials template and then loading it:

Also, you can copy a generated [template from GitHub](https://github.com/dhenara/dhenara/blob/master/src/dhenara/ai/types/resource/credentials.yaml). (Below command will generate the same file)

```python
from dhenara.ai.types import ResourceConfig

# Create a template credentials file
ResourceConfig.create_credentials_template("my_credentials.yaml")

# Now edit my_credentials.yaml with your actual API keys

# Load the configuration
config = ResourceConfig()
config.load_from_file("my_credentials.yaml", init_endpoints=True)
```

The generated credentials template will include all supported providers with placeholders for API keys and other required credentials:

```yaml
# Dhenara AI Provider Credentials
# Replace placeholder values with your actual API keys and remove unused items

openai:
  api_key: <YOUR_OPENAI_API_KEY>

google_gemini_api:
  api_key: <YOUR_GOOGLE_GEMINI_API_API_KEY>

anthropic:
  api_key: <YOUR_ANTHROPIC_API_KEY>

# Additional providers...
```

### Accessing Resources

Once loaded, you can access AI model endpoints using different methods:

```python
# Get an API by provider name
anthropic_api = resource_config.get_api(AIModelAPIProviderEnum.ANTHROPIC)

# Get an endpoint by model name
model_endpoint = resource_config.get_model_endpoint(model_name="claude-3-5-haiku")

# Use the endpoint with AIModelClient
from dhenara.ai import AIModelClient
client = AIModelClient(endpoint)
```

For more advanced queries, you can use the resource query interface:

```python
from dhenara.ai.types import ResourceConfigItem, ResourceConfigItemTypeEnum

# Get an endpoint by model name and specific API provider
resource_item = ResourceConfigItem(
    item_type=ResourceConfigItemTypeEnum.ai_model_endpoint,
    query={"model_name": "gpt-4o", "api_provider": "openai"}
)

# Retrieve the endpoint
endpoint = config.get_resource(resource_item)

# Use the endpoint with AIModelClient
from dhenara.ai import AIModelClient
client = AIModelClient(endpoint)
```

## Multi-Turn Conversations using Resource Config

Let's see how to use ResourceConfig in a practical multi-turn conversation example. We will modify the [Multi-Turn Conversations Example](multi-turn-conversations.md#real-world-usage) using ResourceConfig:

```python
import datetime
import random

from dhenara.ai import AIModelClient
from dhenara.ai.providers.common.prompt_formatter import PromptFormatter
from dhenara.ai.types import AIModelCallConfig, AIModelEndpoint, ResourceConfig
from dhenara.ai.types.conversation._node import ConversationNode
from dhenara.ai.types.external_api import AIModelAPIProviderEnum
from dhenara.ai.types.genai.foundation_models.anthropic.chat import Claude35Haiku, Claude37Sonnet
from dhenara.ai.types.genai.foundation_models.google.chat import Gemini20Flash, Gemini20FlashLite
from dhenara.ai.types.genai.foundation_models.openai.chat import GPT4oMini, O3Mini

# Initialize resource config with credentials
resource_config = ResourceConfig()
resource_config.load_from_file(
    credentials_file="~/.dhenara_credentials.yaml",  # Path to your credentials file
    init_endpoints=False,  # Do not automatically create endpoints for all foundation models
)

# Manually set up endpoints
anthropic_api = resource_config.get_api(AIModelAPIProviderEnum.ANTHROPIC)
openai_api = resource_config.get_api(AIModelAPIProviderEnum.OPEN_AI)
google_api = resource_config.get_api(AIModelAPIProviderEnum.GOOGLE_AI)

# Create various model endpoints
resource_config.model_endpoints = [
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
        model_endpoint = random.choice(resource_config.model_endpoints)
        # OR use a specific model
        # model_endpoint = resource_config.get_model_endpoint(model_name=Claude35Haiku.model_name)

        print(f"🔄 Turn {i + 1} with {model_endpoint.ai_model.model_name} from {model_endpoint.api.provider}\n")

        node = handle_conversation_turn(
            user_query=query,
            instructions=instructions_by_turn[i],
            endpoint=model_endpoint,
            conversation_nodes=conversation_nodes,
        )

        # Display the conversation
        print(f"User: {query}")
        print(f"Model: {model_endpoint.ai_model.model_name}\n")
        print(f"Model Response:\n {node.response.choices[0].contents[0].get_text()}\n")
        print("-" * 80)

        # Update conversation history for next turn
        conversation_nodes.append(node)


if __name__ == "__main__":
    run_multi_turn_conversation()
```

## Additional Features

### Loading Custom Models

You can load specific models into a ResourceConfig:

```python
from dhenara.ai.types.genai.foundation_models.openai.chat import GPT4o, O3Mini

# Initialize with only specific models
resource_config = ResourceConfig()
resource_config.load_from_file(
    credentials_file="credentials.yaml",
    models=[GPT4o, O3Mini],
    init_endpoints=True
)
```

### Creating Custom Credentials Templates

Generate custom credentials templates for your specific needs:

```python
from dhenara.ai.types import ResourceConfig

# Create a template with specific output location
ResourceConfig.create_credentials_template(output_file="my_org_credentials.json")
```

### Checking Available Endpoints

Inspect available endpoints:

```python
# List all configured endpoints
for endpoint in resource_config.model_endpoints:
    print(f"Model: {endpoint.ai_model.model_name}, Provider: {endpoint.api.provider}")
```

## Benefits

The `ResourceConfig` approach offers several advantages:

1. **Separation of concerns** - Keep credentials separate from your application code
2. **Configuration as code** - Define your AI resources declaratively
3. **Consistent interface** - Access all AI models through a unified API
4. **Flexible provider mapping** - Use different API providers for the same model type
5. **Automatic resource management** - Let the system handle the details of API initialization

## Implementation Notes

The `ResourceConfig` system internally manages the mapping between foundation models (like GPT-4o, Claude 3, etc.) and the API providers that can serve them (OpenAI, Azure OpenAI, etc.). This abstraction allows your application code to focus on what AI capabilities you need rather than worrying about the specific API implementation details.

By centralizing credential management, it also improves security by keeping sensitive information out of your application code and configuration versioning systems.