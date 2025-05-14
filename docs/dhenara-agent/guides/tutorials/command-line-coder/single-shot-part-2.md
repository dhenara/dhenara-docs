# Part 2

## Implementing the Handler

Next, let's update the handler.py file to handle the input required event:

```python
# src/agents/autocoder/handler.py
from dhenara.agent.dsl import (
    FlowNodeTypeEnum,
    NodeInputRequiredEvent,
)
from dhenara.agent.utils.helpers.terminal import get_ai_model_node_input

# You can define your models here or import them from elsewhere
models = [
    "claude-3-7-sonnet",
    "gpt-4o",
    "gpt-4.1",
    "claude-3-opus",
    "gpt-4o-mini",
    "claude-3-5-haiku",
]


async def autocoder_input_handler(event: NodeInputRequiredEvent):
    """Handles input required events for the singleshot coder"""
    if event.node_type == FlowNodeTypeEnum.ai_model_call:
        node_input = None

        if event.node_id == "code_generator":
            node_input = await get_ai_model_node_input(
                node_def_settings=event.node_def_settings,
                models=models,
            )
            # In a more complex application, you might add prompt variables here
            # node_input.prompt_variables = {"key": "value"}

        else:
            print(f"WARNING: Unhandled ai_model_call input event for node {event.node_id}")

        event.input = node_input
        event.handled = True

    elif event.node_type == FlowNodeTypeEnum.folder_analyzer:
        # Handle folder analyzer input events if needed
        pass
```

## Updating the Agent Definition

Now, let's update the agent.py file to use our implementation flow:

```python
# src/agents/autocoder/agent.py
from dhenara.agent.dsl import AgentDefinition

from .flow import implementation_flow

# Main Agent Definition
agent = AgentDefinition()
agent.flow(
    "quick_coder",  # The name of our flow
    implementation_flow,
)
```

## Running the Agent

The runner.py file should be already set up correctly, but let's make sure it's properly configured to use our input
handler:

```python
# src/runners/autocoder.py
from dhenara.agent.dsl.events import EventType
from dhenara.agent.run import RunContext
from dhenara.agent.runner import AgentRunner
from dhenara.agent.utils.helpers.terminal import (
    print_component_completion,
    print_node_completion,
)

# Import our agent and handler
from src.agents.autocoder.agent import agent
from src.agents.autocoder.handler import autocoder_input_handler
from src.runners.defs import observability_settings, project_root

# Configure the agent with a root ID
root_component_id = "autocoder_root"
agent.root_id = root_component_id

# Create run context
run_context = RunContext(
    root_component_id=root_component_id,
    observability_settings=observability_settings,
    project_root=project_root,
    run_root_subpath="agent_autocoder",
)

# Register event handlers
run_context.register_event_handlers(
    handlers_map={
        EventType.node_input_required: autocoder_input_handler,
        # Optional notification events
        EventType.node_execution_completed: print_node_completion,
        EventType.component_execution_completed: print_component_completion,
    }
)

# Create a runner
runner = AgentRunner(agent, run_context)

# This enables command line execution
async def main():
    runner.setup_run()
    await runner.run()


if __name__ == "__main__":
    import asyncio

    asyncio.run(main())
```

## Running Your Agent

Now you can run your agent using the DAD CLI:

```bash
dhenara run agent autocoder
```

During execution, you'll be prompted to select an AI model, and the agent will generate file operations to implement the
Fibonacci function as specified in the task description.

## Enhancing the Single-Shot Implementation

There are several ways to enhance this basic implementation:

1. **Accept task description from user input**: Modify the handler to prompt the user for a task description
2. **Add error handling**: Implement error checking for AI model responses
3. **Support multiple task types**: Add capability to handle different kinds of coding tasks

## What's Next?

In [Part 2: Planning Flow](./planning.md), we'll enhance our coding assistant by adding a planning capability. This will
enable it to break down complex tasks into smaller, manageable steps before implementation.
