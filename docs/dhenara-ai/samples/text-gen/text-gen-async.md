---
title: 'Async Text Generation'
---

# Text Generation: Async

```python
import asyncio
import os

from dhenara.ai import AIModelClient
from dhenara.ai.types import AIModelAPI, AIModelAPIProviderEnum, AIModelCallConfig, AIModelEndpoint
from dhenara.ai.types.genai.foundation_models.anthropic.chat import ClaudeSonnet45


async def main() -> None:
    api = AIModelAPI(
        provider=AIModelAPIProviderEnum.ANTHROPIC,
        api_key=os.environ["ANTHROPIC_API_KEY"],
    )
    endpoint = AIModelEndpoint(api=api, ai_model=ClaudeSonnet45)

    client = AIModelClient(
        model_endpoint=endpoint,
        config=AIModelCallConfig(
            max_output_tokens=300,
            streaming=False,
        ),
        is_async=True,
    )

    response = await client.generate_async(
        prompt="Explain quantum computing to a high school student.",
        instructions=["Keep it short and concrete."],
    )

    assert response.chat_response
    print(response.chat_response.text())


if __name__ == "__main__":
    asyncio.run(main())
```

For a richer async example (including console rendering), see the `packages/dhenara_ai/examples/` directory.
