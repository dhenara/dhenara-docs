# Dhenara vs. LangChain

Here we compares Dhenara with LangChain, highlighting key differences and advantages to help you choose the right framework for your AI applications.

## At a Glance: Dhenara vs. LangChain

| Feature | Dhenara | LangChain |
|---------|---------|-----------|
| **Architecture** | Clean, direct architecture with minimal abstraction layers | Multiple layers of abstraction (chains, memory, callbacks) |
| **Type Safety** | Strong typing throughout with Pydantic validation | Limited type safety, particularly across providers |
| **Cross-Provider Support** | Seamless provider switching with unified API | Provider switching requires manual memory synchronization |
| **Conversation Management** | Direct, explicit control with `ConversationNode` | Complex memory systems with varying implementations |
| **Streaming** | Simplified streaming with automatic consolidation | Multiple callback systems for streaming |
| **Usage Tracking** | Built-in cost and token tracking across providers | Limited or manual cost tracking |
| **Test Mode** | Built-in test mode for rapid development | Requires manual mocking |
| **Sync/Async** | Unified sync/async interfaces | Mixed sync/async implementations |
| **Boilerplate** | Minimal setup code required | Significant boilerplate for complex scenarios |
| **Learning Curve** | Transparent design patterns | Steep learning curve with many abstractions |

## Key Advantages of Dhenara

### 1. Simplified Architecture

Dhenara uses a more straightforward approach to managing conversation context. The `ConversationNode` structure directly captures all necessary information without the additional layers of abstraction that LangChain introduces with its chains, memory types, and callbacks.

```python
# Dhenara's clean approach
node = ConversationNode(
    user_query=query,
    attached_files=[],
    response=response.chat_response,
    timestamp=datetime.datetime.now().isoformat(),
)
conversation_nodes.append(node)
```

### 2. Strong Typing and Validation

Dhenara leverages Pydantic models throughout the library, ensuring that data structures are properly validated at runtime. This helps catch mistakes early and provides better IDE support with type hints.

Every response follows a consistent pattern:

```python
# Consistent response structure
chat_response = ChatResponse(
    model="gpt-4o",
    provider=AIModelProviderEnum.OPEN_AI,
    usage=ChatResponseUsage(...),
    usage_charge=UsageCharge(...),
    choices=[...],
    metadata={...}
)
```

### 3. Cross-Provider Flexibility

Dhenara's implementation allows seamless switching between providers (OpenAI, Anthropic, Google) while maintaining conversation context. The `PromptFormatter` automatically handles the conversion between different provider formats.

```python
# Effortlessly switch models between turns
model_endpoint = random.choice(all_model_endpoints)  # Can select from any provider
```

### 4. Built-in Usage and Cost Tracking

Dhenara provides automatic tracking of token usage and associated costs across all providers:

```python
# Usage data automatically included in responses
response.chat_response.usage  # ChatResponseUsage with token counts
response.chat_response.usage_charge  # Cost information including price calculations
```

### 5. Simplified Streaming

Streaming is handled through a unified interface that works consistently across providers:

```python
# Streaming with Dhenara
config = AIModelCallConfig(streaming=True)
client = AIModelClient(model_endpoint, config)

async for chunk, final_response in client.generate_async(...):
    # Process each chunk as it arrives
    print(chunk.data.choice_deltas[0].content_deltas[0].text_delta)
```

### 6. Test Mode for Rapid Development

Dhenara includes a built-in test mode that doesn't require API credentials:

```python
# Enable test mode for rapid development without API calls
config = AIModelCallConfig(test_mode=True)
client = AIModelClient(model_endpoint, config)
response = client.generate(prompt=prompt)
```

### 7. Less Boilerplate Code

The Dhenara implementation requires significantly less setup code compared to LangChain's equivalent functionality:

```python
# LangChain equivalent would require:
# - Setting up a memory object
# - Configuring a chain
# - Creating provider-specific clients
# - Setting up callbacks for logging
```

### 8. Direct Control Flow

Dhenara gives developers explicit control over the conversation flow without hiding it behind abstractions:

```python
# Direct access to get context and manage turns
context = get_context(conversation_nodes, endpoint.ai_model)
response = client.generate(prompt=prompt, context=context, instructions=instructions)
```

## How LangChain Would Handle the Same Example

For comparison, here's how a similar multi-turn conversation might be implemented with LangChain:

```python
from langchain.chains import ConversationChain
from langchain.memory import ConversationBufferMemory
from langchain_openai import ChatOpenAI
from langchain_anthropic import ChatAnthropic
from langchain_google_genai import ChatGoogleGenerativeAI

# Setup providers
openai_llm = ChatOpenAI(model_name="gpt-4o-mini")
anthropic_llm = ChatAnthropic(model="claude-3-5-haiku")
google_llm = ChatGoogleGenerativeAI(model="gemini-1.5-flash")

# Dictionary to track LLM chains for each provider
llm_chains = {
    "openai": ConversationChain(
        llm=openai_llm,
        memory=ConversationBufferMemory(),
        verbose=True
    ),
    "anthropic": ConversationChain(
        llm=anthropic_llm,
        memory=ConversationBufferMemory(),
        verbose=True
    ),
    "google": ConversationChain(
        llm=google_llm,
        memory=ConversationBufferMemory(),
        verbose=True
    )
}

# This is where LangChain gets complicated - cross-provider memory sharing
# requires manual handling of memory state
def sync_memories(from_chain, to_chain):
    # Need to extract conversation from one memory and add to another
    # This is non-trivial in LangChain and requires understanding internal structures
    conversation = from_chain.memory.buffer
    to_chain.memory.buffer = conversation

# Execute conversation turns
queries = [
    "Tell me a short story about a robot learning to paint.",
    "Continue the story but add a twist where the robot discovers something unexpected.",
    "Conclude the story with an inspiring ending."
]

instructions = [
    "Be creative and engaging.",
    "Build upon the previous story seamlessly.",
    "Bring the story to a satisfying conclusion."
]

# Need to keep track of which provider was used last
last_provider = None
current_chain = None

for i, query in enumerate(queries):
    # Select provider (randomly or in sequence)
    providers = ["openai", "anthropic", "google"]
    current_provider = random.choice(providers)
    current_chain = llm_chains[current_provider]

    # Sync memory if switching providers
    if last_provider and last_provider != current_provider:
        sync_memories(llm_chains[last_provider], current_chain)

    # Need to inject the system prompt/instructions manually
    # LangChain has limited support for per-turn instructions
    enriched_query = f"{instructions[i]}\n\nUser: {query}"

    # Generate response
    response = current_chain.predict(input=enriched_query)

    print(f"User: {query}")
    print(f"Model: {current_provider}")
    print(f"Response: {response}")
    print("-" * 80)

    last_provider = current_provider
```


## Resource Configuration

| Feature | Dhenara | LangChain |
|---------|---------|-----------|
| **Credential Management** | Centralized YAML configuration with runtime loading | Environment variables or manual client setup |
| **Model Organization** | Structured model registry with provider metadata | Ad-hoc model instantiation |
| **Provider Switching** | Single config with dynamic model selection | Manual client reconfiguration |
| **Endpoint Management** | Automatic endpoint creation from models and APIs | Manual endpoint setup |
| **Resource Querying** | Rich query interface for resource retrieval | No centralized resource management |
| **Multi-environment Support** | Multiple resource configs for different environments | Manual environment handling |

### Dhenara's ResourceConfig Advantage

Dhenara introduces a centralized resource management system that dramatically simplifies working with multiple AI models and providers:

```python
# Load all credentials and initialize endpoints in one line
resource_config = ResourceConfig()
resource_config.load_from_file("credentials.yaml", init_endpoints=True)

# Get any model by name, regardless of provider
claude_endpoint = resource_config.get_model_endpoint("claude-3-5-haiku")
gpt4_endpoint = resource_config.get_model_endpoint("gpt-4o")

# Or use a more specific query when needed
gemini_endpoint = resource_config.get_resource(
    ResourceConfigItem(
        item_type=ResourceConfigItemTypeEnum.ai_model_endpoint,
        query={"model_name": "gemini-1.5-flash", "api_provider": "google_gemini_api"}
    )
)
```

In contrast, LangChain requires setting up each model client individually:

```python
from langchain_openai import ChatOpenAI
from langchain_anthropic import ChatAnthropic
from langchain_google_genai import ChatGoogleGenerativeAI

# Manual setup for each provider
openai_model = ChatOpenAI(api_key=os.environ["OPENAI_API_KEY"], model="gpt-4o")
anthropic_model = ChatAnthropic(api_key=os.environ["ANTHROPIC_API_KEY"], model="claude-3-haiku")
google_model = ChatGoogleGenerativeAI(api_key=os.environ["GOOGLE_API_KEY"], model="gemini-1.5-flash")

# No centralized way to retrieve models by name or query
# Must manually track which model is which
```

Dhenara's ResourceConfig provides a more maintainable, structured approach to managing AI resources, especially in applications that use multiple models across different providers.


## Key Limitations of LangChain in this Use Case

1. **Complex Memory Synchronization**: LangChain doesn't natively support sharing memory across different provider chains, requiring manual memory synchronization.

2. **Opaque Memory Structure**: The internal representation of conversation history is less transparent and harder to manipulate directly.

3. **Provider Switching Complexity**: Switching between providers requires creating separate chains and manually transferring context.

4. **Per-Turn Instructions**: LangChain's design makes it difficult to vary system instructions on a per-turn basis.

5. **Verbose Configuration**: Requires more boilerplate code to set up chains, memory, and callbacks.

6. **Limited Usage Tracking**: Cost tracking is not built-in across providers and requires additional setup.

7. **Inconsistent Streaming**: Streaming implementations vary across providers and require different callback setups.

## When to Choose Dhenara Over LangChain

Dhenara is likely the better choice when:

1. You need seamless multi-provider conversation support
2. You want direct control over conversation state
3. You prefer clean, strongly-typed interfaces
4. Your application needs per-turn instruction customization
5. You require built-in usage and cost tracking
6. You value simplified streaming implementations
7. You need both sync and async interfaces with consistent behavior
8. You want a lower learning curve with more transparent design patterns

LangChain may still be preferable if you're using its extensive collection of tools, agents, and integrations beyond simple conversation management.

## Conclusion

For multi-turn conversations specifically, Dhenara provides a more elegant, flexible, and developer-friendly approach compared to LangChain.
The design prioritizes simplicity and direct control while still offering powerful features like cross-provider compatibility, usage tracking, and contextual awareness.

Rather than hiding complexity behind layers of abstraction, Dhenara gives developers clear patterns that are easy to understand, extend, and debug – making it particularly well-suited for production applications that need reliability and maintainability.