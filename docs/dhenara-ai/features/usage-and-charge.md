---
title: Usage & Charge Data
---

Dhenara offers a unified, powerful interface for interacting with AI models from different providers. While many
libraries provide basic functionality for AI model integration, Dhenara goes beyond by offering built-in features that
make it particularly valuable for commercial applications and organizations that need to monitor their AI costs.

## Unified Usage Tracking

### Comprehensive Usage Data

Every AI model call in Dhenara returns standardized usage metrics, regardless of which provider you're using. This means
you get consistent usage data whether you're calling OpenAI, Google AI, Anthropic, or other supported providers.

```python
# Example response with usage data
response = client.generate(prompt="Hello world")

# Access usage data in a consistent format
if response.chat_response and response.chat_response.usage:
    print(f"Total tokens: {response.chat_response.usage.total_tokens}")
    print(f"Prompt tokens: {response.chat_response.usage.prompt_tokens}")
    print(f"Completion tokens: {response.chat_response.usage.completion_tokens}")
    print(f"Reasoning tokens: {response.chat_response.usage.reasoning_tokens}")
```

For chat-based models, usage information includes:

- Total tokens consumed
- Prompt tokens (input)
- Completion tokens (output)

For image generation models, usage includes:

- Number of images generated
- Model configuration details
- Size and quality settings

This unified approach to usage tracking makes it easier to monitor and analyze AI consumption across your applications.

## Built-in Cost Calculation

### Automatic Cost Calculation

Unlike most AI libraries that leave cost tracking as an exercise for the developer, Dhenara provides cost calculations
out of the box. Every response includes not just usage data but also the calculated cost based on the provider's
pricing.

```python
# The cost is automatically calculated with each response
if response.chat_response and response.chat_response.usage_charge:
    print(f"Cost for this call: ${response.chat_response.usage_charge.cost}")
    print(f"Charge (optional): {response.chat_response.usage_charge.charge}")
```

### How Cost Calculation Works

Dhenara's cost calculation system works through several components:

1. **Foundation Model Cost Data**: Each foundation model includes provider-specific pricing information:

   - For chat models: Input and output token costs per million tokens
   - For image models: Either flat cost per image or option-based cost mapping

2. **Precise Calculation Logic**:
   - For text generation: `cost = (prompt_tokens × input_cost_per_token) + (completion_tokens × output_cost_per_token)`
   - For image generation: Cost is calculated based on the number of images and model-specific parameters like size and
     quality

This built-in cost tracking saves you from having to implement complex cost calculations or maintain up-to-date pricing
information for different AI models.

## Commercial-Ready Cost Management

### Cost Multiplier for Business Applications

For commercial applications, Dhenara offers a unique feature: the ability to add a margin or multiplier to the base
provider cost. This is particularly valuable if you're:

- Reselling AI capabilities as part of your product or service
- Accounting for operational overhead
- Building in a profit margin
- Allocating internal costs across departments

```python
# Example of configuring a cost multiplier for a model endpoint
from dhenara.ai.types import AIModelEndpoint
from dhenara.ai.types.genai.ai_model import ChatModelCostData

model_endpoint = AIModelEndpoint(
    api=my_api,
    ai_model=my_model,
    # Add a 20% margin to the base cost
    cost_data=ChatModelCostData(
        input_token_cost_per_million=0.5,
        output_token_cost_per_million=1.5,
        cost_multiplier_percentage=20,
    ),
)

# When using this endpoint, responses will include both raw cost and the calculated charge
# response.chat_response.usage_charge.cost → Raw provider cost
# response.chat_response.usage_charge.charge → Cost with your margin applied
```

The multiplier can be configured per model endpoint, giving you fine-grained control over cost management.

### Flexible Cost Configuration

Dhenara allows you to:

1. **Use default pricing** from foundation models (up-to-date with provider pricing)
2. **Override pricing** at the endpoint level if you negotiate special rates with providers
3. **Set different multipliers** for different models or use cases

This flexibility makes Dhenara ideal for businesses that need to carefully manage AI costs and incorporate them into
their business model.

## How This Compares to Alternatives

Most alternative libraries like LangChain focus primarily on model integration and chains but leave cost tracking and
management as an external concern. This means you would typically need to:

1. Implement your own usage tracking logic
2. Maintain pricing data for each model separately
3. Build custom cost calculation systems
4. Create your own margin application mechanism

Dhenara eliminates this extra work by providing these features as core functionality. This is particularly valuable
when:

- Building commercial applications with AI capabilities
- Managing AI budgets across teams or projects
- Creating transparent cost attribution systems
- Monitoring usage patterns to optimize costs

## Configuration Options

You can control usage and cost tracking through configuration:

```python
# In your configuration file (or set via env and import settings)
ENABLE_USAGE_TRACKING = True
ENABLE_COST_TRACKING = True
```

When `ENABLE_COST_TRACKING` is enabled, usage tracking is automatically enabled as well, since cost calculation requires
usage data.

## Summary

Dhenara's built-in usage tracking and cost calculation capabilities set it apart from other AI integration libraries. By
providing these features out of the box, Dhenara saves development time, improves cost visibility, and makes it easier
to build commercial applications on top of AI models.

Whether you're building internal tools or commercial products, Dhenara's approach to usage and cost management helps you
maintain control over your AI expenses while providing the flexibility needed for various business models.
