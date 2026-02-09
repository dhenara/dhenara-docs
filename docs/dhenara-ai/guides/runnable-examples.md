---
title: Runnable Examples Index
---

# Runnable Examples Index

The fastest way to *feel* Dhenara’s “goodness” is to run the examples and inspect the artifacts.

All scripts live in:

- `packages/dhenara_ai/examples/`

The GitHub links in this page point to the canonical `dhenara-ai` repo, where the same examples live at `examples/`.

## How to run

From the repo root:

```bash
cd packages/dhenara_ai

# If you're using pip, create/activate a venv and install the package first.
# Example (macOS/Linux):
#   python -m venv .venv
#   source .venv/bin/activate
#   pip install -e .

# run an example
python examples/19_streaming_multi_turn_structured_thinking.py
```

If you use `uv`, the simplest workflow is to sync the repo once and then run everything via `uv run` (no manual activation needed):

```bash
cd packages/dhenara_ai

uv sync
uv run python examples/19_streaming_multi_turn_structured_thinking.py
```

Most examples use the shared config helpers under `packages/dhenara_ai/examples/include/`.

## What to run (recommended order)

If you only run a few scripts, run these first:

1) **Streaming + multi-turn + structured output + reasoning + validation**
   - `19_streaming_multi_turn_structured_thinking.py`
2) **Streaming + tools + structured output (end-to-end workflow)**
   - `18_streaming_multi_turn_with_tools_and_structured_output.py`
3) **Multi-turn tools with correct Messages API history**
   - `16_multi_turn_with_tools_and_messages_api.py`
4) **Structured output basics (Pydantic)**
   - `21_structed_output.py`

## Capability map

<div className="table-scroll">

| You want to learn | Run this | What to look for |
|---|---|---|
| Provider-agnostic text generation | [01_text_generation.py](https://github.com/dhenara/dhenara-ai/blob/master/examples/01_text_generation.py) | Same `.generate()` shape across providers |
| Streaming response handling | [02_text_streaming.py](https://github.com/dhenara/dhenara-ai/blob/master/examples/02_text_streaming.py) | Token deltas + final accumulated response |
| Input styles (prompt/context/messages) | [10_various_input_formats.py](https://github.com/dhenara/dhenara-ai/blob/master/examples/10_various_input_formats.py) | Migration-friendly request shapes |
| Multi-turn via ResourceConfig | [12_multi_turn_with_resouce_config.py](https://github.com/dhenara/dhenara-ai/blob/master/examples/12_multi_turn_with_resouce_config.py) | Endpoint switching without changing app code |
| Streaming multi-turn via ResourceConfig | [13_streaming_multi_turn_with_resouce_config.py](https://github.com/dhenara/dhenara-ai/blob/master/examples/13_streaming_multi_turn_with_resouce_config.py) | Streaming loop + final response per turn |
| Async streaming multi-turn | [13_async_streaming_multi_turn_with_resouce_config.py](https://github.com/dhenara/dhenara-ai/blob/master/examples/13_async_streaming_multi_turn_with_resouce_config.py) | Async generator semantics |
| Messages API multi-turn (recommended) | [14_multi_turn_with_messages_api.py](https://github.com/dhenara/dhenara-ai/blob/master/examples/14_multi_turn_with_messages_api.py) | `messages` history + `to_message_item()` |
| Streaming + Messages API | [15_streaming_multi_turn_with_messages_api.py](https://github.com/dhenara/dhenara-ai/blob/master/examples/15_streaming_multi_turn_with_messages_api.py) | Streaming with message history preserved |
| Tools + Messages API (correct tool loop) | [16_multi_turn_with_tools_and_messages_api.py](https://github.com/dhenara/dhenara-ai/blob/master/examples/16_multi_turn_with_tools_and_messages_api.py) | `ToolCallResult` and `call_id` handling |
| Structured output + Messages API | [17_multi_turn_with_structured_output_and_messages_api.py](https://github.com/dhenara/dhenara-ai/blob/master/examples/17_multi_turn_with_structured_output_and_messages_api.py) | Typed schema per turn |
| Streaming + tools + structured output | [18_streaming_multi_turn_with_tools_and_structured_output.py](https://github.com/dhenara/dhenara-ai/blob/master/examples/18_streaming_multi_turn_with_tools_and_structured_output.py) | Real workflow pattern: stream + tool calls + typed output |
| “The goodness” recipe (stream + multi-turn + typed + reasoning + validation) | [19_streaming_multi_turn_structured_thinking.py](https://github.com/dhenara/dhenara-ai/blob/master/examples/19_streaming_multi_turn_structured_thinking.py) | Validation-driven loop + artifacts per call |
| Function calling API surface | [20_fn_calling.py](https://github.com/dhenara/dhenara-ai/blob/master/examples/20_fn_calling.py) | `ToolDefinition.from_callable` + `ToolChoice` |
| Structured output quickstart | [21_structed_output.py](https://github.com/dhenara/dhenara-ai/blob/master/examples/21_structed_output.py) | `structured_output=<Pydantic model>` + `chat.structured()` |
| Images | [30_image_openai.py](https://github.com/dhenara/dhenara-ai/blob/master/examples/30_image_openai.py), [31_image_with_resource_config.py](https://github.com/dhenara/dhenara-ai/blob/master/examples/31_image_with_resource_config.py), [32_image_with_messages_and_text.py](https://github.com/dhenara/dhenara-ai/blob/master/examples/32_image_with_messages_and_text.py) | Unified image response handling |
| Cross-provider structured output sanity check | [91_all_providers_structured_simple_test.py](https://github.com/dhenara/dhenara-ai/blob/master/examples/91_all_providers_structured_simple_test.py) | Provider normalization differences |
| OpenAI reasoning knobs | [98_openai_reasoing.py](https://github.com/dhenara/dhenara-ai/blob/master/examples/98_openai_reasoing.py) | `reasoning_effort` + reasoning mode behavior |
| OpenAI tool calling specifics | [99_openai_toolcall.py](https://github.com/dhenara/dhenara-ai/blob/master/examples/99_openai_toolcall.py) | Provider-specific edge cases |

</div>

## Docs that match these examples

- [Advanced Recipes](/dhenara-ai/guides/advanced-recipes)
- [Prompts & Messages](/dhenara-ai/guides/prompt-formatter)
- [Structured Output (Pydantic)](/dhenara-ai/guides/structured-output)
- [Tools & Function Calling](/dhenara-ai/guides/tools-and-function-calling)
- [Artifacts & Debugging](/dhenara-ai/guides/artifacts-and-debugging)
