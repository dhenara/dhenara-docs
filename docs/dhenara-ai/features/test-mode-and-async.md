---
title: Test Mode & Async Support
---

# Test Mode and Synchronous/Asynchronous Client Flexibility

Dhenara provides powerful capabilities to help you develop, test, and deploy AI applications more efficiently. Two key
features that enhance developer productivity are the Test Mode functionality and the flexible Sync/Async client options.

## Test Mode

Dhenara's test mode allows you to develop and test your application without making actual API calls to LLM providers,
saving costs and enabling development in environments without API access.

### How Test Mode Works

Enable test mode by setting the `test_mode` parameter to `True` in your `AIModelCallConfig`:

```python
from dhenara import AIModelClient, AIModelCallConfig
from dhenara.ai.types.shared.platform import PlatformEnvTypeEnum

# Create a client with test mode enabled
client = AIModelClient(
    model_endpoint=my_model_endpoint,
    config=AIModelCallConfig(test_mode=True),
    is_async=False
)

# Use the client normally - no actual API calls will be made
response = client.generate(
    prompt={"role": "user", "content": "Tell me about machine learning"},
    instructions=["You are a helpful AI assistant"]
)
```

### Benefits of Test Mode

- **Cost Savings**: Develop and test without incurring API usage costs
- **Offline Development**: Work on applications without network connectivity
- **Predictable Responses**: Get consistent responses for UI testing
- **Fast Development Cycles**: Skip waiting for actual API responses during development

### Test Response Format

Test mode returns structured responses that mimic the format of real API responses, including:

- Properly structured content
- Model and provider information
- Simulated usage data (if usage tracking is enabled)
- Simulated streaming behavior (if streaming is requested)

## Synchronous and Asynchronous Client Options

Dhenara offers both synchronous and asynchronous client options, allowing you to choose the approach that best fits your
application architecture.

### Creating Sync vs Async Clients

```python
# Synchronous client
sync_client = AIModelClient(
    model_endpoint=my_model_endpoint,
    config=my_config,
    is_async=False  # Use synchronous mode
)

# Asynchronous client
async_client = AIModelClient(
    model_endpoint=my_model_endpoint,
    config=my_config,
    is_async=True  # Use asynchronous mode (default)
)
```

### Using the Sync Client

The synchronous client is best for applications where you need blocking behavior or are working in a synchronous
context:

```python
# Using the sync client with a context manager
with sync_client as client:
    response = client.generate(
        prompt={"role": "user", "content": "What is machine learning?"}
    )
    print(response.chat_response.choices[0].contents[0].text)

# Or without a context manager
response = sync_client.generate(
    prompt={"role": "user", "content": "What is machine learning?"}
)
```

### Using the Async Client

The asynchronous client is ideal for high-throughput applications or when working within an async context:

```python
import asyncio

async def get_response():
    # Using the async client with a context manager
    async with async_client as client:
        response = await client.generate_async(
            prompt={"role": "user", "content": "What is machine learning?"}
        )
        return response.chat_response.choices[0].contents[0].text

# Run the async function
response_text = asyncio.run(get_response())
```

### Connection Reuse

For efficiency in making multiple API calls, both client types support connection reuse:

```python
# Sync example with connection reuse
client = AIModelClient(model_endpoint=my_model_endpoint, is_async=False)
try:
    response1 = client.generate_with_existing_connection(prompt=prompt1)
    response2 = client.generate_with_existing_connection(prompt=prompt2)
    response3 = client.generate_with_existing_connection(prompt=prompt3)
finally:
    client.cleanup_sync()

# Async example with connection reuse
async def process_multiple_prompts():
    client = AIModelClient(model_endpoint=my_model_endpoint, is_async=True)
    try:
        response1 = await client.generate_with_existing_connection_async(prompt=prompt1)
        response2 = await client.generate_with_existing_connection_async(prompt=prompt2)
        response3 = await client.generate_with_existing_connection_async(prompt=prompt3)
    finally:
        await client.cleanup_async()
```

## Advanced Error Handling and Retry Logic

Dhenara's client implementation includes sophisticated error handling and retry mechanisms that work identically in both
sync and async modes:

### Automatic Retries

The client automatically handles transient errors with configurable retry behavior:

```python
client = AIModelClient(
    model_endpoint=my_model_endpoint,
    config=AIModelCallConfig(
        retries=3,                # Number of retry attempts
        retry_delay=1.0,          # Initial delay between retries in seconds
        max_retry_delay=10.0,     # Maximum delay between retries
    )
)
```

### Timeout Management

Set timeouts to prevent hanging operations:

```python
client = AIModelClient(
    model_endpoint=my_model_endpoint,
    config=AIModelCallConfig(
        timeout=30.0,  # Timeout in seconds
    )
)
```

## Conclusion

Dhenara's test mode and flexible sync/async client options simplify the development workflow and make it easy to
integrate AI capabilities into any application architecture. The test mode enables rapid development and testing without
API costs, while the sync/async flexibility ensures you can build applications that scale optimally.

Whether you're building a simple CLI tool, a web application, or a high-throughput API service, Dhenara's client
interface adapts to your needs with consistent behavior and powerful built-in features.
