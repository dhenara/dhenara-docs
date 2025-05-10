---
title: 'Text Generation'
---

# Text Generation

```python

from dhenara.ai import AIModelClient
from dhenara.ai.types import AIModelCallConfig, AIModelEndpoint
from dhenara.ai.types.external_api import AIModelAPIProviderEnum
from dhenara.ai.types.genai import AIModelAPI
from dhenara.ai.types.genai.foundation_models.anthropic.chat import Claude37Sonnet

# 1. Create an API
# This can be used to create multiple model endpoints for the same API provider
api = AIModelAPI(
    provider=AIModelAPIProviderEnum.ANTHROPIC,
    api_key="your_api_key", # TODO: Update with your Anthropic API Key
)

# 2. Select or create an AI model
# You can either use the foundation models as it is, or create your own models
model = Claude37Sonnet

# Create the model endpoint
model_endpoint = AIModelEndpoint(api=api, ai_model=model)

# Create the client
client = AIModelClient(
    model_endpoint=model_endpoint,
    config=AIModelCallConfig(
        max_output_tokens=16000,
        reasoning=True,  # thinking/reasoning mode
        max_reasoning_tokens=8000,  # Needed only if reasoning is set
        streaming=False,
    ),
    is_async=False,  # Sync mode/ async mode
)


response = client.generate(
    prompt={
        "role": "user",
        "content": "What are three ways to improve productivity?",
    },
    context=[],  # Optional history/context. Will show this on another example
    instructions=[
        "Be specific and actionable.",  # Optional instructions
    ],
)
# Either print the whole response, or use below function to format it
# print(response)


# -----------------------------------------------------------------------------
# To see formatted response, use below helper fn
def print_response(response):
    for choice in response.chat_response.choices:
        for content in choice.contents:
            # Some formatting to differentiate contents
            # With reasoning=True, same response will have multiple contents
            print("-" * 80)
            print(f"Type:: {content.type}")
            print("-" * 80)
            # Actual response text
            print(f"{content.get_text()}")

    # Optionally get the usage and cost for this call.
    # Usage/Cost calculation is enabled by default, but can be disabled via setting
    print("-" * 80)
    print(f"Usage: {response.chat_response.usage}")
    print(f"Usage Charge: {response.chat_response.usage_charge}")
    print("-" * 80)


# Call response  formatting fn
print_response(response)
```

Output:

<div className="limited-height-code">
```text
--------------------------------------------------------------------------------
Type:: reasoning
--------------------------------------------------------------------------------
The human is asking for three ways to improve productivity. I should provide a clear, concise response that outlines three effective strategies for improving productivity.

I'll focus on well-established productivity methods that are:

1. Evidence-based
2. Practical for most people to implement
3. Specific enough to be actionable

Here are three solid approaches I can recommend:

1. Time blocking and prioritization

   - Setting aside specific time blocks for different tasks
   - Using methods like the Eisenhower Matrix to prioritize tasks based on importance/urgency
   - Focusing on completing the most important tasks first

2. The Pomodoro Technique

   - Working in focused intervals (typically 25 minutes) followed by short breaks
   - Helps maintain concentration and prevent burnout
   - Creates a sense of urgency that can boost focus

3. Environment optimization and minimizing distractions
   - Creating a workspace that minimizes interruptions
   - Using tools to block digital distractions
   - Batching similar tasks together to reduce context switching

## I'll explain each of these methods clearly with some practical implementation tips to make them actionable.

## Type:: text

# Three Ways to Improve Productivity

## 1. Implement Time Blocking

Create a daily schedule that assigns specific time blocks for different tasks. Research shows this reduces decision
fatigue and prevents multitasking. Try allocating your most challenging work to your peak energy hours, and set
realistic time limits for each task.

## 2. Use the Pomodoro Technique

Work in focused intervals (typically 25 minutes) followed by short 5-minute breaks. After completing four intervals,
take a longer 15-30 minute break. This method leverages our natural attention spans and prevents burnout while
maintaining momentum.

## 3. Minimize Distractions

Create an environment that supports focus by:

- Silencing notifications and using apps that block distracting websites
- Communicating boundaries to colleagues during deep work sessions
- Organizing your workspace to reduce visual clutter and mental load

## Each of these strategies can be implemented immediately and adjusted to fit your specific work style and circumstances.

Usage: total_tokens=533 prompt_tokens=50 completion_tokens=483 Usage Charge: cost=0.007395 charge=None

---

````
</div>
If you scroll downm you will see there are 2  items in `contents`, one is `text` type, which is the actual response of the model, and and additional `reasoning` type with the *think-text*. This is because we used a model with reasoning capabilities along with `reasoning=True`. The good part is that, this is will be the same for all reasoning models that exposes their *thinking* part to the user. (Eg: for Anthropic's *Clause3.7* and *DeepSeek-R1* )


If you print the output without calling the *print_response()* function, it will look like,

```text  title="Output Without formatting"
status=ExternalApiCallStatus(status='response_received_success', api_provider='anthropic', model='claude-3-7-sonnet', message='Output generated', code='success', http_status_code=200, data=None) chat_response=ChatResponse(model='claude-3-7-sonnet-20250219', provider='anthropic', api_provider='anthropic', usage=ChatResponseUsage(total_tokens=533, prompt_tokens=50, completion_tokens=483), usage_charge=UsageCharge(cost=0.007395, charge=None), choices=[ChatResponseChoice(index=0, finish_reason='end_turn', stop_sequence=None, contents=[ChatResponseReasoningContentItem(index=0, metadata={'signature': 'ErUBCkYIARgCIkBO2WeAlhVU2Er4BOR0QHUExtwtYE1CybJ3TjxsQVWJrQ1PvDZF9n1jNHkghhBHgMRFL5xRiXuBV+qqmUReiDIGEgzyx62PpTE+/XAidLsaDPhRX5iEm7q7tMtPyCIwDq6IXsKBCqTZcC3DbGy03RVPl+HQBAux424miePRqPRGACyk2IAEm6HRRV5nQ5zzKh2/sCntAG005ooBDkGv6FsU6tw4Of8Jni7mQadD+g=='}, storage_metadata={}, custom_metadata={}, type=<ChatResponseContentItemType.REASONING: 'reasoning'>, role='assistant', thinking_text="The human is asking for three ways to improve productivity. I should provide a clear, concise response that outlines three effective strategies for improving productivity.\n\nI'll focus on well-established productivity methods that are:\n1. Evidence-based\n2. Practical for most people to implement\n3. Specific enough to be actionable\n\nHere are three solid approaches I can recommend:\n\n1. Time blocking and prioritization\n   - Setting aside specific time blocks for different tasks\n   - Using methods like the Eisenhower Matrix to prioritize tasks based on importance/urgency\n   - Focusing on completing the most important tasks first\n   \n2. The Pomodoro Technique\n   - Working in focused intervals (typically 25 minutes) followed by short breaks\n   - Helps maintain concentration and prevent burnout\n   - Creates a sense of urgency that can boost focus\n   \n3. Environment optimization and minimizing distractions\n   - Creating a workspace that minimizes interruptions\n   - Using tools to block digital distractions\n   - Batching similar tasks together to reduce context switching\n   \nI'll explain each of these methods clearly with some practical implementation tips to make them actionable."), ChatResponseTextContentItem(index=1, metadata={}, storage_metadata={}, custom_metadata={}, type=<ChatResponseContentItemType.TEXT: 'text'>, role='assistant', text='# Three Ways to Improve Productivity\n\n## 1. Implement Time Blocking\nCreate a daily schedule that assigns specific time blocks for different tasks. Research shows this reduces decision fatigue and prevents multitasking. Try allocating your most challenging work to your peak energy hours, and set realistic time limits for each task.\n\n## 2. Use the Pomodoro Technique\nWork in focused intervals (typically 25 minutes) followed by short 5-minute breaks. After completing four intervals, take a longer 15-30 minute break. This method leverages our natural attention spans and prevents burnout while maintaining momentum.\n\n## 3. Minimize Distractions\nCreate an environment that supports focus by:\n- Silencing notifications and using apps that block distracting websites\n- Communicating boundaries to colleagues during deep work sessions\n- Organizing your workspace to reduce visual clutter and mental load\n\nEach of these strategies can be implemented immediately and adjusted to fit your specific work style and circumstances.')], metadata={})], metadata=AIModelCallResponseMetaData(streaming=False, duration_seconds=0, provider_metadata={'id': 'msg_01KegPt3ZuQNG2yqUYcszAL8'})) async_stream_generator=None sync_stream_generator=None image_response=None
````
