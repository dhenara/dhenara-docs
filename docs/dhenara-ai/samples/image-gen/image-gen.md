---
title: 'Image Generation'
---

# Image Generation

```python
import base64
import io
import os

from PIL import Image  # pip install Pillow
from dhenara.ai import AIModelClient
from dhenara.ai.types import (
    AIModelAPI,
    AIModelAPIProviderEnum,
    AIModelCallConfig,
    AIModelEndpoint,
    ImageContentFormat,
)
from dhenara.ai.types.genai.foundation_models.openai.image import DallE3

# 1. Create an API
# This can be used to create multiple model endpoints for the same API provider
openai_api = AIModelAPI(
    provider=AIModelAPIProviderEnum.OPEN_AI,
    api_key=os.environ["OPENAI_API_KEY"],
)


# Create the model endpoint
model_endpoint = AIModelEndpoint(api=openai_api, ai_model=DallE3)

# Create the client
client = AIModelClient(
    model_endpoint=model_endpoint,
    config=AIModelCallConfig(
        options={
            "quality": "standard",
            "size": "1024x1024",
            "style": "natural",
            "n": 1,
            "response_format": "b64_json",
        },
        test_mode=False,
    ),
    is_async=False,  # Sync mode
)


user_query = "Elephant amigurumi walking in savanna, a professional photograph, blurry background"

response = client.generate(
    prompt=user_query,
)


assert response.image_response
for choice in response.image_response.choices:
    for image_content in choice.contents:
        if image_content.content_format == ImageContentFormat.BASE64:
            image_bytes = base64.b64decode(image_content.content_b64_json)
            image = Image.open(io.BytesIO(image_bytes))
            image.save("generated_image.png")
            print("Saved generated_image.png")
        elif image_content.content_format == ImageContentFormat.URL:
            print("URL:", image_content.content_url)

print("Usage:", response.image_response.usage)
print("Charge:", response.image_response.usage_charge)

```
