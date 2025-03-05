---
sidebar_position: 3
---

# Quick Start with Dhenara

This guide will help you get up and running with Dhenara quickly. We'll create a simple application that interacts with an AI model to generate text.

## Setup

First, make sure you have Dhenara installed:

```bash
pip install dhenara
```

You'll need API credentials for at least one of the supported AI providers. For this example, we'll use OpenAI.

## Basic Text Generation

```python
import asyncio
from dhenara.ai import AIModelClient, AIModelCallConfig
from dhenara.ai.types.genai.ai_model import AIModelAPI, AIModelEndpoint
from dhenara.ai.types.external_api import AIModelAPIProviderEnum
from dhenara.ai.types.genai.foundation_models import FoundationModelFns

async def main():
    # Get a pre-configured foundation model
    gpt4o = FoundationModelFns.get_foundation_model("gpt-4o")

    # Set up API credentials
    api = AIModelAPI(
        provider=AIModelAPIProviderEnum.OPEN_AI,
        api_key="your-api-key-here"
    )

    # Create an endpoint combining the model and API
    endpoint = AIModelEndpoint(
        api=api,
        ai_model=gpt4o
    )

    # Configure the API call
    config = AIModelCallConfig(
        max_output_tokens=500,
        streaming=False
    )

    # Create a prompt
    prompt = {
        "role": "user",
        "content": "Explain the importance of documentation in software development"
    }

    # Generate a response
    async with AIModelClient(endpoint, config) as client:
        response = await client.generate(prompt=prompt)

        if response.chat_response:
            print(response.chat_response.choices[0].contents[0].get_text())

# Run the async function
asyncio.run(main())
```

## Streaming Text Generation

For a more interactive experience, enable streaming:

```python
import asyncio
from dhenara.ai import AIModelClient, AIModelCallConfig
from dhenara.ai.types.genai.ai_model import AIModelAPI, AIModelEndpoint
from dhenara.ai.types.external_api import AIModelAPIProviderEnum
from dhenara.ai.types.genai.foundation_models import FoundationModelFns

async def main():
    # Get a pre-configured foundation model
    gpt4o = FoundationModelFns.get_foundation_model("gpt-4o")

    # Set up API credentials
    api = AIModelAPI(
        provider=AIModelAPIProviderEnum.OPEN_AI,
        api_key="your-api-key-here"
    )

    # Create an endpoint combining the model and API
    endpoint = AIModelEndpoint(
        api=api,
        ai_model=gpt4o
    )

    # Configure the API call with streaming
    config = AIModelCallConfig(
        max_output_tokens=500,
        streaming=True
    )

    # Create a prompt
    prompt = {
        "role": "user",
        "content": "Write a short poem about programming"
    }

    # Generate a streaming response
    async with AIModelClient(endpoint, config) as client:
        response = await client.generate(prompt=prompt)

        if response.async_stream_generator:
            async for chunk, final_response in response.async_stream_generator:
                if chunk:
                    # Process each chunk as it arrives
                    for delta in chunk.data.choice_deltas:
                        for content_delta in delta.content_deltas:
                            print(content_delta.get_text_delta(), end="", flush=True)
                if final_response:
                    # Handle the final consolidated response
                    print("\n\nStream completed!")

# Run the async function
asyncio.run(main())
```

## Using the Synchronous Interface

If you prefer a synchronous interface:

```python
from dhenara.ai import AIModelClientSync, AIModelCallConfig
from dhenara.ai.types.genai.ai_model import AIModelAPI, AIModelEndpoint
from dhenara.ai.types.external_api import AIModelAPIProviderEnum
from dhenara.ai.types.genai.foundation_models import FoundationModelFns

# Get a pre-configured foundation model
claude = FoundationModelFns.get_foundation_model("claude-3-5-sonnet")

# Set up API credentials
api = AIModelAPI(
    provider=AIModelAPIProviderEnum.ANTHROPIC,
    api_key="your-anthropic-api-key"
)

# Create an endpoint
endpoint = AIModelEndpoint(
    api=api,
    ai_model=claude
)

# Configure the call
config = AIModelCallConfig()

# Create a prompt
prompt = {
    "role": "user",
    "content": "What are the most important things to know about AI safety?"
}

# Generate a response synchronously
with AIModelClientSync(endpoint, config) as client:
    response = client.generate(prompt=prompt)

    if response.chat_response:
        print(response.chat_response.choices[0].contents[0].get_text())
```

## Working with Images

Dhenara also supports image generation:

```python
import asyncio
import base64
from PIL import Image
import io
from dhenara.ai import AIModelClient, AIModelCallConfig
from dhenara.ai.types.genai.ai_model import AIModelAPI, AIModelEndpoint
from dhenara.ai.types.external_api import AIModelAPIProviderEnum
from dhenara.ai.types.genai.foundation_models import FoundationModelFns

async def main():
    # Get a pre-configured image generation model
    dalle = FoundationModelFns.get_foundation_model("dall-e-3")

    # Set up API credentials
    api = AIModelAPI(
        provider=AIModelAPIProviderEnum.OPEN_AI,
        api_key="your-api-key-here"
    )

    # Create an endpoint
    endpoint = AIModelEndpoint(
        api=api,
        ai_model=dalle
    )

    # Configure the call
    config = AIModelCallConfig(
        options={
            "size": "1024x1024",
            "quality": "standard",
            "style": "vivid",
            "response_format": "b64_json"
        }
    )

    # Generate an image
    async with AIModelClient(endpoint, config) as client:
        response = await client.generate(
            prompt="A futuristic city with flying cars and digital billboards"
        )

        if response.image_response:
            # Get the base64 image data
            image_content = response.image_response.choices[0].contents[0]

            if image_content.content_format == "base64":
                # Convert base64 to image
                image_bytes = base64.b64decode(image_content.content_b64_json)
                image = Image.open(io.BytesIO(image_bytes))

                # Save the image
                image.save("generated_image.png")
                print("Image saved as generated_image.png")

# Run the async function
asyncio.run(main())
```

## Next Steps

{/*
<!--
- Explore [basic usage guides](../guides/basic-usage) for more detailed examples
- Learn about [available foundation models](../foundation-models/overview)
- Check the [provider-specific guides](../guides/provider-guides/openai) for provider-specific features
-->
 */}
