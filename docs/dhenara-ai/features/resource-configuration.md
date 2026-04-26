---
title: Resource Configuration
---

# ResourceConfig

`ResourceConfig` is the central place to keep provider credentials, API definitions, and model endpoints. Use it when
you want one public configuration surface for multiple providers and models.

## Credential discovery

`ResourceConfig.load_from_file()` supports two public discovery flows:

1. Pass an explicit credentials file path.
2. Set `DAI_SECRET_CONFIG_DIR` and place `dai_credentials.yaml` in that directory.

If `DAI_SECRET_CONFIG_DIR` is unset, the default lookup path is `/run/secrets/dai/dai_credentials.yaml`.

## Create a credentials template

```python
from dhenara.ai.types import ResourceConfig

ResourceConfig.create_credentials_template("/path/to/secrets/dai_credentials.yaml")
print("Edit dai_credentials.yaml with your credentials")
```

The generated template includes all supported provider blocks. Keep only what you use.

## Example credentials file

This trimmed example matches the current public credential shape:

```yaml
# Dhenara AI Provider Credentials
# Place this file at $DAI_SECRET_CONFIG_DIR/dai_credentials.yaml or pass its path to ResourceConfig.load_from_file().
# If DAI_SECRET_CONFIG_DIR is unset, the default directory is /run/secrets/dai.

openai:
  api_key: <YOUR_OPENAI_API_KEY>

google_gemini_api:
  api_key: <YOUR_GOOGLE_GEMINI_API_KEY>

anthropic:
  api_key: <YOUR_ANTHROPIC_API_KEY>

google_vertex_ai:
  credentials:
    service_account_json: <YOUR_GOOGLE_VERTEX_AI_SERVICE_ACCOUNT_JSON>
  config:
    project_id: <YOUR_GOOGLE_VERTEX_AI_PROJECT_ID>
    location: <YOUR_GOOGLE_VERTEX_AI_LOCATION>

amazon_bedrock:
  credentials:
    access_key_id: <YOUR_AMAZON_BEDROCK_ACCESS_KEY_ID>
    secret_access_key: <YOUR_AMAZON_BEDROCK_SECRET_ACCESS_KEY>
  config:
    region: <YOUR_AMAZON_BEDROCK_REGION>

microsoft_openai:
  api_key: <YOUR_MICROSOFT_OPENAI_API_KEY>
  config:
    endpoint: <YOUR_MICROSOFT_OPENAI_ENDPOINT>
```

Notes:

- `google_gemini_api` is the YAML provider key for the Google Gemini Developer API.
- `microsoft_openai` is the public Microsoft-hosted OpenAI-compatible surface.
- If you are migrating an older Foundry inference endpoint that ends in `/models`, use the resource root instead or
  let the runtime normalize it to `/openai/v1/`.

## Load and initialize endpoints

```python
from dhenara.ai.types import ResourceConfig

resource_config = ResourceConfig()
resource_config.load_from_file(credentials_file=None, init_endpoints=True)

print("APIs:", [api.provider for api in resource_config.model_apis])
print("Endpoints:", len(resource_config.model_endpoints))
```

With `init_endpoints=True`, Dhenara AI creates endpoints for compatible foundation models using the credentials you
loaded.

If you want to bypass directory discovery, pass an explicit path instead:

```python
resource_config = ResourceConfig()
resource_config.load_from_file("/absolute/path/to/dai_credentials.yaml", init_endpoints=True)
```

## Pick an endpoint and call the model

```python
from dhenara.ai import AIModelClient
from dhenara.ai.types import AIModelAPIProviderEnum, AIModelCallConfig

endpoint = resource_config.get_model_endpoint(
    model_name="claude-haiku-4-5",
    api_provider=AIModelAPIProviderEnum.ANTHROPIC,
)
if endpoint is None:
    raise RuntimeError("No matching endpoint. Check credentials and provider availability.")

client = AIModelClient(
    model_endpoint=endpoint,
    config=AIModelCallConfig(max_output_tokens=300),
    is_async=False,
)
response = client.generate(prompt="Write a one-sentence tagline for a developer tool.")

if response.chat_response:
    print(response.chat_response.text())
```

## Multi-turn with ResourceConfig and the Messages API

```python
from dhenara.ai import AIModelClient
from dhenara.ai.types import AIModelAPIProviderEnum
from dhenara.ai.types.genai.dhenara.request import MessageItem, Prompt

endpoint = resource_config.get_model_endpoint(
    model_name="gemini-2.5-flash",
    api_provider=AIModelAPIProviderEnum.GOOGLE_AI,
)
if endpoint is None:
    raise RuntimeError("No Google Gemini endpoint configured")

client = AIModelClient(model_endpoint=endpoint, is_async=False)

messages: list[MessageItem] = []

for question in ["Give me 3 startup name ideas", "Now pick the best one and explain why"]:
    messages.append(Prompt(role="user", text=question))
    response = client.generate(messages=messages)
    if not response.chat_response:
        raise RuntimeError("No chat response returned")

    print(response.chat_response.text())
    messages.append(response.chat_response.to_message_item())
```

## Query resources directly

If you need more control than `get_model_endpoint(...)`, use `ResourceConfigItem` and `get_resource()`.

```python
from dhenara.ai.types import AIModelAPIProviderEnum, ResourceConfigItem, ResourceConfigItemTypeEnum

gemini_endpoint = resource_config.get_resource(
    ResourceConfigItem(
        item_type=ResourceConfigItemTypeEnum.ai_model_endpoint,
        query={
            "model_name": "gemini-2.5-flash",
            "api_provider": AIModelAPIProviderEnum.GOOGLE_AI,
        },
    )
)
```

## Benefits

The `ResourceConfig` approach gives you:

1. **Separation of concerns**: Keep credentials outside application code.
2. **One public configuration surface**: Use the same file shape across examples and production code.
3. **Flexible provider mapping**: Select endpoints by model name, provider, or richer queries.
4. **Automatic endpoint initialization**: Let Dhenara AI create compatible foundation-model endpoints.
5. **Predictable credential discovery**: Use an explicit file path or the `DAI_SECRET_CONFIG_DIR` contract.
