---
title: Key Concepts
---

# Key Concepts

Understanding the core concepts of Dhenara will help you use the library effectively. This guide explains the
fundamental components and how they work together.

## Architecture Overview

Dhenara is built on principles of simplicity, flexibility, and separation of concerns. The architecture separates:

1. **API Providers** - The services that expose AI model APIs (OpenAI, Anthropic, Amazon Bedrock, Microsoft Azure etc.)
2. **Models** - The specific AI models with their capabilities and parameters
3. **Endpoints** - The combination of an API provider and a specific model
4. **Clients** - The interface you use to interact with endpoints

This separation lets you:

- Switch between models while keeping the same code structure
- Use the same model through different API providers
- Configure each component independently

## Core Components

### AIModelAPI

Represents credentials and configuration for a specific AI provider:

```python
# Imports used throughout the docs
from dhenara.ai.types import AIModelAPI, AIModelAPIProviderEnum

# Create API configurations for different providers
openai_api = AIModelAPI(
    provider=AIModelAPIProviderEnum.OPEN_AI,
    api_key="your_openai_api_key",
)

anthropic_api = AIModelAPI(
    provider=AIModelAPIProviderEnum.ANTHROPIC,
    api_key="your_anthropic_api_key",
)

vertex_ai_api = AIModelAPI(
    provider=AIModelAPIProviderEnum.GOOGLE_VERTEX_AI,
    credentials={"service_account_json": {...}},
    config={"project_id": "your-project", "location": "us-central1"},
)
```

### AIModel & Foundation Models

Predefined models with appropriate settings and capabilities:

- Token limits
- Context window sizes
- Cost information
- Provider-specific parameters
- Model Options ( This is very useful when you deal with image generation )

Dhenara includes foundation models for popular services like OpenAI's GPT models, Google's Gemini, Anthropic's Claude,
DeepSeek's R1 and more.

### AIModelEndpoint

Connects a specific model with an API configuration:

```python
# Foundation models (optional convenience constants)
from dhenara.ai.types.genai.foundation_models.openai.chat import GPT52
from dhenara.ai.types.genai.foundation_models.anthropic.chat import ClaudeSonnet45

from dhenara.ai.types import AIModelEndpoint

# Connect models with API providers
gpt4o_endpoint = AIModelEndpoint(
    api=openai_api,
    ai_model=GPT52,
)

claude_endpoint = AIModelEndpoint(
    api=anthropic_api,
    ai_model=ClaudeSonnet45,
)
```

The same model can be used with different API providers:

```python
# Using Claude through different API providers
claude_direct = AIModelEndpoint(api=anthropic_api, ai_model=ClaudeSonnet45)
claude_on_bedrock = AIModelEndpoint(api=bedrock_api, ai_model=ClaudeSonnet45)
claude_on_vertex = AIModelEndpoint(api=vertex_ai_api, ai_model=ClaudeSonnet45)
```

### AIModelClient

The main interface for generating content. It handles:

- Connection lifecycle management
- Request formatting and validation
- Response parsing and normalization
- Error handling and retries
- Streaming management

Available in both synchronous and asynchronous modes:

```python
# Client
from dhenara.ai import AIModelClient

# Synchronous client
client = AIModelClient(
    model_endpoint=endpoint,
    config=config,
    is_async=False,
)

# Asynchronous client
async_client = AIModelClient(
    model_endpoint=endpoint,
    config=config,
    is_async=True,
)
```

### AIModelCallConfig

Controls the behavior of individual API calls:

```python
from dhenara.ai.types import AIModelCallConfig

# Text Generation
call_config = AIModelCallConfig(
    max_output_tokens=4000,  # Limit response length
    streaming=True,          # Enable streaming
    reasoning=True,          # Enable reasoning/thinking mode
    max_reasoning_tokens=8000,  # Limit reasoning tokens
    timeout=30,              # Set timeout in seconds
    retries=3,               # Configure retries
    options={},              # Model-specific options
)


#Image call config for Dalle3
call_config=AIModelCallConfig(
    options={
        "quality": "standard",
        "size": "1024x1024",
        "style": "natural",
        "n": 1,
        "response_format": "b64_json",
    },
)
```

## Unified Response Format

Dhenara normalizes responses from all providers into consistent types:

- `AIModelCallResponse`: Top-level container for all responses
- `ChatResponse`: For text generation
- `ImageResponse`: For image generation
- Streaming variants with identical structure

This allows switching between providers without changing your response handling code.

## Working with Streaming

Dhenara provides first-class support for streaming responses:

```python
response = client.generate(prompt=prompt)

if response.stream_generator:
    for chunk, accumulated in response.stream_generator:
        if chunk:
            # Process each token as it arrives
            print(chunk.data.choice_deltas[0].content_deltas[0].get_text_delta(),
                  end="", flush=True)

        # On the last iteration, accumulated contains the complete response
        if accumulated:
            final_response = accumulated
```

Streaming responses automatically accumulate content, providing a final response identical in structure to non-streaming
responses.

## Typical Workflow

1. **Configure API credentials** - Create `AIModelAPI` instances
2. **Select and configure models** - Choose from foundation models or create custom ones
3. **Create endpoints** - Connect models with API providers
4. **Configure and create a client** - Set up behavior for API calls
5. **Generate content** - Use the client to send prompts and process responses

## Error Handling and Resource Management

Dhenara automatically manages resources and connections:

```python
# Resources automatically cleaned up when context exits
with AIModelClient(...) as client:
    response = client.generate(prompt)

# Async version
async with AIModelClient(...) as client:
    response = await client.generate_async(prompt)
```

The library includes built-in error handling, retries, and timeouts to ensure robust operation in production
environments.

## Next Steps

- Read the [installation guide](./installation) if you haven't already
- Try the [quick start examples](./quick-start) to see these concepts in action
- Explore the API reference for detailed information on each component
