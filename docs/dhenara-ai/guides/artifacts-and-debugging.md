---
title: Artifacts & Debugging
---

# Artifacts & Debugging

Dhenara can capture *debug artifacts per model call*:

- The normalized Dhenara request (prompt/messages/instructions + call config)
- The provider-formatted request
- The raw provider response
- The parsed Dhenara response
- Optional Python logs (captured per call)

This makes it much easier to debug provider quirks, reproduce failures, and compare behavior across models.

## Enable artifacts for a call

```python
from dhenara.ai import AIModelClient
from dhenara.ai.types import AIModelCallConfig
from dhenara.ai.types.genai.dhenara.request import ArtifactConfig

client = AIModelClient(
    model_endpoint=endpoint,
    config=AIModelCallConfig(
        streaming=False,
        artifact_config=ArtifactConfig(
            enabled=True,
            artifact_root="./runs/my_debug_run/turn_01",
            prefix="call_001",
            capture_dhenara_request=True,
            capture_provider_request=True,
            capture_provider_response=True,
            capture_dhenara_response=True,
        ),
    ),
)

resp = client.generate(prompt="Write a short spec for a CLI tool")
```

## Where artifacts are written

Artifacts are written under:

- `<artifact_root>/<prefix>/dai/`

Each stage is captured as JSON (and optional JSONL for Python logs).

## Capture Python logs (optional)

If you want a call-scoped log capture (useful when debugging retries, request translation, parsing, etc.):

```python
from dhenara.ai.types.genai.dhenara.request import ArtifactConfig

ArtifactConfig(
    enabled=True,
    artifact_root="./runs/my_debug_run/turn_01",
    enable_python_logs=True,
    python_log_level="INFO",
    python_logger_levels={
        # Example: reduce noise from a chatty logger
        "httpx": "WARNING",
    },
)
```

## Recommended usage

- Keep artifacts **off** by default in production
- Enable them per request when diagnosing issues
- Use a structured directory per workflow/turn (makes diffing easier)

## See runnable examples

- `packages/dhenara_ai/examples/16_multi_turn_with_tools_and_messages_api.py`
- `packages/dhenara_ai/examples/19_streaming_multi_turn_structured_thinking.py`
