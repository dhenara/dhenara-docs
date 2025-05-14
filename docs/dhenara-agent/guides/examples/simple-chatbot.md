---
sidebar_position: 2
---

# Simple Chatbot

Building on the [Quick Start guide](/dhenara-agent/getting-started/quick-start.md), this example explores the simple
chatbot agent in more detail. The chatbot responds to user queries while demonstrating some basic DAD concepts like node
flow and event handling.

## Agent Structure

A simple chatbot agent consists of three main files:

1. **agent.py**: Defines the agent structure
2. **flow.py**: Contains the flow definition and nodes
3. **handler.py**: Handles events like user input

## Agent Definition

The agent definition file is straightforward, importing the flow and creating the agent:

```python
from dhenara.agent.dsl import AgentDefinition

from .flow import main_flow

# Main Agent Definition
agent = AgentDefinition()
agent.flow(
    "main_flow_1",  # Flow instance ID
    main_flow,      # Flow definition
)
```

## Flow Definition

The flow defines how the agent processes information:

```python
from dhenara.agent.dsl import (
    AIModelNode,
    AIModelNodeSettings,
    EventType,
    FlowDefinition,
)
from dhenara.ai.types import AIModelCallConfig, Prompt

main_flow = FlowDefinition()

# First node - processes user input and generates response
main_flow.node(
    "user_query_processor",
    AIModelNode(
        pre_events=[EventType.node_input_required],
        settings=AIModelNodeSettings(
            models=[
                "claude-3-5-haiku",
                "gpt-4.1-nano",
                "gemini-2.0-flash-lite",
            ],
            system_instructions=[
                "You are an AI assistant in a general purpose chatbot",
                "Always respond in plaintext format.",
            ],
            prompt=Prompt.with_dad_text("$var{user_query}"),
            model_call_config=AIModelCallConfig(
                test_mode=False,
            ),
        ),
    ),
)

# Second node - generates a title for the conversation
main_flow.node(
    "title_generator",
    AIModelNode(
        settings=AIModelNodeSettings(
            models=["gpt-4o-mini"],
            system_instructions=[
                "You are a summarizer which generate a title.",
            ],
            prompt=Prompt.with_dad_text(
                "Summarize in plain text under 60 characters. $expr{ $hier{ai_model_call_1}.outcome.text }",
            ),
        ),
    ),
)
```

## Event Handler

The handler processes input events triggered during flow execution:

```python
from dhenara.agent.dsl import (
    FlowNodeTypeEnum,
    NodeInputRequiredEvent,
)
from dhenara.agent.utils.helpers.terminal import async_input, get_ai_model_node_input


async def node_input_event_handler(event: NodeInputRequiredEvent):
    node_input = None
    if event.node_type == FlowNodeTypeEnum.ai_model_call:
        if event.node_id == "ai_model_call_1":
            node_input = await get_ai_model_node_input(
                node_def_settings=event.node_def_settings,
            )
            user_query = await async_input("Enter your query: ")
            node_input.prompt_variables = {"user_query": user_query}

        event.input = node_input
        event.handled = True
```

## Runner Script

To run the agent, you would use a runner script:

```python
from dhenara.agent.dsl.events import EventType
from dhenara.agent.run import RunContext
from dhenara.agent.runner import AgentRunner
from dhenara.agent.utils.helpers.terminal import (
    print_component_completion,
    print_node_completion,
)

# Import the agent and handler
from src.agents.chatbot.agent import agent
from src.agents.chatbot.handler import node_input_event_handler
from src.runners.defs import project_root

# Define the root component ID
root_component_id = "chatbot_root"
agent.root_id = root_component_id

# Create run context
run_context = RunContext(
    root_component_id=root_component_id,
    project_root=project_root,
    observability_settings=None,  # Optional: add observability settings
    run_root_subpath="agent_chatbot",  # Optional: specify a path for run artifacts
)

# Register event handlers
run_context.register_event_handlers(
    handlers_map={
        EventType.node_input_required: node_input_event_handler,
        EventType.node_execution_completed: print_node_completion,
        EventType.component_execution_completed: print_component_completion,
    }
)

# Create and run the agent
runner = AgentRunner(agent, run_context)
```

## How It Works

1. The flow starts execution, beginning with the `user_query_processor` node
2. This node triggers an `input_required` event, which is handled by the `node_input_event_handler`
3. The handler prompts the user for input and attaches it as a variable to the node
4. The node uses the selected AI model to process the query and generate a response
5. Next, the `title_generator` node runs, creating a title based on the first node's response
6. All results are stored in the run directory for future reference

## Extending the Chatbot

You can extend this basic chatbot by:

- Adding more nodes to the flow for additional processing steps
- Incorporating memory using context variables to remember conversation history
- Integrating with external services or databases
- Adding specialized roles or capabilities through system instructions

This simple example demonstrates the fundamentals of creating an agent with DAD. The following examples will build on
these concepts to create more complex agents.
