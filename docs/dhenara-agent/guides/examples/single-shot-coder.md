---
sidebar_position: 4
---

# Single-Shot Coder

The Single-Shot Coder is a simplified version of the [Code Generation Agent](./auto-coder.md) designed for focused,
one-time coding tasks. This agent bypasses the planning phase and goes directly to implementation, making it ideal for
smaller, well-defined tasks.

## Agent Overview

Unlike the full Autocoder agent, which has analysis, planning, and implementation phases, the Single-Shot Coder focuses
solely on implementation. It takes a pre-defined task specification and executes the necessary file operations to
implement the code changes.

This agent is useful when:

- You have a clear, well-defined task
- The task doesn't require complex planning
- You want a quicker implementation turnaround

## Agent Structure

The Single-Shot Coder has a simpler structure than the Autocoder:

```plaintext
src/agents/singleshot_coder/
├── __init__.py
├── agent.py        # Main agent definition
├── flow.py         # Flow configuration
└── handler.py      # Event handlers
```

It reuses the implementation flow from the Autocoder agent but skips the planning phase.

## Agent Definition

The agent definition is straightforward, directly using the implementation flow:

```python
from dhenara.agent.dsl import AgentDefinition

from .flow import implementation_flow

agent = AgentDefinition()
agent.flow(
    "quick_coder",
    implementation_flow,
)
```

## Flow Configuration

Instead of generating a task specification dynamically through a planning phase, the Single-Shot Coder loads a
predefined task specification from a file:

```python
import json

from src.agents.autocoder.types import TaskSpecWithFolderAnalysisOps
from ..autocoder.flows.implementation import implementation_flow

# Load task background information
def read_background():
    with open("src/common/data/backgrounds/dad_docs_docusorus_1.md") as file:
        return file.read()

# Load task description
def read_description():
    with open("src/common/live_prompts/singleshot_coder/task_description.md") as file:
        return file.read()

# Load and prepare task specification
def read_task_spec_json():
    with open("src/common/live_prompts/singleshot_coder/task_spec.json") as file:
        spec_dict = json.load(file)
        spec = TaskSpecWithFolderAnalysisOps(**spec_dict)

        # Update description with content from task_description.md
        _task_description = read_description()
        spec.description = _task_description
        return spec

# Load data
task_background = read_background()
task_spec = read_task_spec_json()

# Configure implementation flow
implementation_flow.vars(
    {
        "task_background": task_background,
        "task_spec": task_spec,
    }
)
```

## Event Handler

The event handler is also simplified, focusing only on handling input events for the code generator node:

```python
from dhenara.agent.dsl import FlowNodeTypeEnum, NodeInputRequiredEvent
from dhenara.agent.utils.helpers.terminal import get_ai_model_node_input

from ..autocoder.flows.defs import models

async def singleshot_autocoder_input_handler(event: NodeInputRequiredEvent):
    if event.node_type == FlowNodeTypeEnum.ai_model_call:
        node_input = None

        if event.node_id == "code_generator":
            node_input = await get_ai_model_node_input(
                node_def_settings=event.node_def_settings,
                models=models,
            )
        else:
            print(f"WARNING: Unhandled ai_model_call input event for node {event.node_id}")

        event.input = node_input
        event.handled = True
```

## Task Specification

The task specification is defined in a JSON file with this structure:

```json
{
  "order": 1,
  "task_id": "singleshot_task",
  "description": "This will be replaced with the content from task_description.md",
  "required_context": [
    {
      "operation_type": "analyze_folder",
      "path": "docs/dhenara-agent/examples",
      "content_read_mode": "full"
    },
    {
      "operation_type": "analyze_file",
      "path": "docs/dhenara-agent/getting-started/quick-start.md"
    }
  ]
}
```

The `required_context` field specifies which files or folders should be analyzed to provide context for the
implementation. This approach gives you precise control over what information is provided to the AI model.

## Running the Agent

To run the Single-Shot Coder, use a runner script:

```python
from dhenara.agent.dsl.events import EventType
from dhenara.agent.run import RunContext
from dhenara.agent.runner import AgentRunner

from src.agents.singleshot_coder.agent import agent
from src.agents.singleshot_coder.handler import singleshot_autocoder_input_handler
from src.runners.defs import observability_settings, project_root

root_component_id = "singleshot_coder_root"
agent.root_id = root_component_id

run_context = RunContext(
    root_component_id=root_component_id,
    observability_settings=observability_settings,
    project_root=project_root,
    run_root_subpath="agent_singleshot_coder",
)

run_context.register_event_handlers(
    handlers_map={
        EventType.node_input_required: singleshot_autocoder_input_handler,
        # Additional event handlers...
    }
)

runner = AgentRunner(agent, run_context)
```

## Use Cases

The Single-Shot Coder is ideal for:

1. **Isolated Feature Development**: When adding a single feature or component
2. **Bug Fixes**: Targeted fixes for specific issues
3. **Documentation Updates**: Creating or updating documentation files
4. **Configuration Changes**: Updating configuration files or settings
5. **Small Refactoring Tasks**: Focused refactoring of limited scope

## Advantages over Full Autocoder

- **Simplicity**: Fewer components and simpler flow
- **Speed**: Faster execution by skipping the planning phase
- **Precision**: Direct control over exactly which files are analyzed
- **Predictability**: Pre-defined task specification ensures consistent behavior

## Conclusion

The Single-Shot Coder demonstrates how DAD can be adapted for simpler use cases while still leveraging the power of the
implementation flow. It's a great example of how you can reuse components from more complex agents to create streamlined
solutions for specific tasks.

By understanding both the full [Code Generation Agent](./auto-coder.md) and this simplified version, you can choose the
right approach for different coding tasks based on their complexity and requirements.
