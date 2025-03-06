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
