---
title: Resource Configuration
---

# ResourceConfig

`ResourceConfig` is the “single place” to keep credentials, APIs, and model endpoints. It’s useful when you:

- Use multiple providers/models
- Want a consistent credentials file format
- Want to select endpoints by model name (and optionally provider)

## 1) Create a credentials template

```python
from dhenara.ai.types import ResourceConfig

ResourceConfig.create_credentials_template("credentials.yaml")
print("Edit credentials.yaml with your keys")
```

The template contains all supported providers. Keep only what you use.

Example shape:

```yaml
# Dhenara AI Provider Credentials
# Replace placeholder values with your actual API keys and remove unused items

openai:
  api_key: <YOUR_OPENAI_API_KEY>

anthropic:
  api_key: <YOUR_ANTHROPIC_API_KEY>

google_gemini_api:
  api_key: <YOUR_GOOGLE_GEMINI_API_API_KEY>

amazon_bedrock:
  credentials:
    access_key_id: <YOUR_AMAZON_BEDROCK_ACCESS_KEY_ID>
    secret_access_key: <YOUR_AMAZON_BEDROCK_SECRET_ACCESS_KEY>
  config:
    region: <YOUR_AMAZON_BEDROCK_REGION>
```

## 2) Load and initialize endpoints

```python
from dhenara.ai.types import ResourceConfig

rc = ResourceConfig()
rc.load_from_file(credentials_file="credentials.yaml", init_endpoints=True)

print("APIs:", [api.provider for api in rc.model_apis])
print("Endpoints:", len(rc.model_endpoints))
```

With `init_endpoints=True`, Dhenara tries to create endpoints for compatible foundation models.

## 3) Pick an endpoint and call the model

```python
from dhenara.ai import AIModelClient

endpoint = rc.get_model_endpoint(model_name="gpt-5.2")
if not endpoint:
    raise RuntimeError("No matching endpoint. Check credentials and provider availability.")

client = AIModelClient(model_endpoint=endpoint, is_async=False)
response = client.generate(prompt="Write a 1-sentence tagline for a developer tool")

print(response.chat_response.text())
```

## 4) Multi-turn using ResourceConfig + Messages API

```python
from dhenara.ai.types.genai.dhenara.request import MessageItem, Prompt

endpoint = rc.get_model_endpoint(model_name="gpt-4o-mini")
client = AIModelClient(model_endpoint=endpoint, is_async=False)

messages: list[MessageItem] = []

for q in ["Give me 3 startup name ideas", "Now pick the best one and explain why"]:
    messages.append(Prompt(role="user", text=q))
    r = client.generate(messages=messages)
    chat = r.chat_response
    print(chat.text())
    messages.append(chat.to_message_item())
```

If you need more control (query by provider, custom resource queries, explicit model lists), use
`ResourceConfigItem` and `get_resource()`.
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

The `ResourceConfig` system internally manages the mapping between foundation models (like GPT-4o, Claude 3, etc.) and
the API providers that can serve them (OpenAI, Azure OpenAI, etc.). This abstraction allows your application code to
focus on what AI capabilities you need rather than worrying about the specific API implementation details.

By centralizing credential management, it also improves security by keeping sensitive information out of your
application code and configuration versioning systems.
