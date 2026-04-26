---
title: Foundation Models
---

# Foundation Models & Custom Models

Foundation models are the building blocks of AI in the Dhenara framework. These pre-configured models encapsulate the
capabilities of various AI providers and enable consistent interactions regardless of the underlying API differences.

You are not locked to the packaged foundation-model list. The library ships useful defaults, but you can always create
your own `FoundationModel` or `AIModel` objects and use them with the same client APIs.

## Understanding Foundation Models

In Dhenara, a foundation model is a pre-configured representation of a specific AI model from a provider (like OpenAI,
Google AI, Anthropic, etc.) with standardized properties:

- Model identification information
- Context/token limitations
- Cost data for usage tracking
- Configuration options
- Provider-specific parameters

These foundation models ensure consistent behavior while abstracting away provider-specific implementation details.

## Using Foundation Models

You can access foundation models using their respective constants or through the provided APIs:

```python
from dhenara.ai.types.genai.foundation_models import ALL_CHAT_MODELS, ALL_IMAGE_MODELS
from dhenara.ai.types.genai.foundation_models import OPENAI_CHAT_MODELS, ANTHROPIC_CHAT_MODELS
from dhenara.ai.types.genai.foundation_models.fns import FoundationModelFns

# Get all foundation models
for model in ALL_CHAT_MODELS:
    print(f"Model: {model.display_name}, Provider: {model.provider}")

# Get a specific foundation model by name
claude_model = FoundationModelFns.get_foundation_model("claude-haiku-4-5")
```

## Cross-Provider Model Compatibility

One of the most powerful features of Dhenara's foundation model system is the ability to use the same model across
different API providers through model cloning and customization.

### Example: Adapting a Claude model for Amazon Bedrock

Anthropic's Claude models can be accessed through Anthropic's direct API or via Amazon Bedrock. Hosted providers can
use different model identifiers, so the usual pattern is to clone the foundation model and replace `model_name`.

```python
from dhenara.ai import AIModelClient
from dhenara.ai.types import AIModelEndpoint
from dhenara.ai.types import AIModelAPI, AIModelAPIProviderEnum
from dhenara.ai.types.genai.ai_model import ChatModelCostData
from dhenara.ai.types.genai.foundation_models.anthropic.chat import ClaudeSonnet45

# Initialize API configuration for Amazon Bedrock
bedrock_api = AIModelAPI(
    provider=AIModelAPIProviderEnum.AMAZON_BEDROCK,
    credentials={
        "access_key_id": "your_access_key_id",
        "secret_access_key": "your_secret_access_key",
    },
    config={"region": "your_region"},
)

# Clone the foundation model and customize for Amazon Bedrock
bedrock_claude_sonnet = ClaudeSonnet45.clone(
    # Use the current Bedrock model identifier for your account and region
    model_name="provider-specific-bedrock-model-id",
)
# NOTE: Remove the version suffix used by Anthropic's direct API
bedrock_claude_sonnet.metadata["version_suffix"] = None

# Optionally override cost data for accurate usage tracking
bedrock_claude_sonnet.cost_data = ChatModelCostData(
    input_token_cost_per_million=3.0,
    output_token_cost_per_million=15.0,
)

# Create a model endpoint connecting the model with the API
model_endpoint = AIModelEndpoint(
    api=bedrock_api,
    ai_model=bedrock_claude_sonnet,
)

# Create the client and use it
client = AIModelClient(
    model_endpoint=model_endpoint,
    is_async=False,
)
```

## Creating Custom Foundation Models

You can create completely custom models for specialized use cases:

```python
from dhenara.ai.types.genai.ai_model import (
    AIModelFunctionalTypeEnum,
    AIModelProviderEnum,
    ChatModelCostData,
    ChatModelSettings,
    FoundationModel,
)

# Create a custom foundation model
custom_model = FoundationModel(
    model_name="your-custom-model",
    display_name="Your Custom Model",
    provider=AIModelProviderEnum.CUSTOM,
    functional_type=AIModelFunctionalTypeEnum.TEXT_GENERATION,
    settings=ChatModelSettings(
        max_context_window_tokens=100000,
        max_output_tokens=8000,
    ),
    valid_options={
        # Define your model's valid options here
    },
    metadata={
        "details": "Your custom model's description",
    },
    cost_data=ChatModelCostData(
        input_token_cost_per_million=1.0,
        output_token_cost_per_million=5.0,
    ),
)
```

## Model Settings and Configuration

Foundation models include detailed settings that specify their capabilities:

### Text Generation Models

```python
ChatModelSettings(
    max_context_window_tokens=200000,  # Maximum tokens in the context window
    max_output_tokens=8192,           # Maximum output tokens
    supports_reasoning=True,          # Whether reasoning mode is supported
    max_reasoning_tokens=32000,       # Maximum tokens for reasoning (if supported)
)
```

### Image Generation Models

```python
ImageModelSettings(
    max_words=4000,  # Maximum words in prompt
)
```

## Cost Tracking

Foundation models include cost data for accurate usage tracking:

```python
ChatModelCostData(
    input_token_cost_per_million=3.0,      # Cost per million input tokens
    output_token_cost_per_million=15.0,    # Cost per million output tokens
    cost_multiplier_percentage=10.0,       # Optional markup percentage
)
```

## Readily Available Foundation Models

Dhenara includes a rich collection of pre-configured foundation models. But you can always create your own models; the
functional client path is independent from the packaged foundation-model collection.

To see the full list of packaged foundation models, check the [Foundation Models](https://github.com/dhenara/dhenara-ai/tree/master/src/dhenara/ai/types/genai/foundation_models) directory in the codebase.


## Conclusion

Foundation models in Dhenara provide a powerful abstraction layer that allows you to:

- Work with multiple AI providers through a consistent interface
- Adapt models to work with different API providers
- Track usage and costs accurately
- Customize models for specific use cases

By leveraging foundation models, you can create robust AI applications that aren't tied to a specific provider while
maintaining full control over model settings and costs.
