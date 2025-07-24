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
├── flows/          # Flow configurations
│   ├── __init__.py
│   └── implementation.py # Implementation flow
├── types.py        # Data models
└── handler.py      # Event handlers
```

It focuses on a three-node structure:

1. FolderAnalyzerNode - For gathering context from files and folders
2. AIModelNode - For code generation based on the task and context
3. FileOperationNode - For executing file operations from the generated implementation

## Data Models

The agent uses Pydantic models for structured data handling:

```python
from dhenara.agent.dsl.inbuilt.flow_nodes.defs.types import FileOperation
from pydantic import BaseModel, Field

class TaskImplementation(BaseModel):
    """
    Contains the concrete file operations to implement a specific task of the plan.
    This is the output generated after analyzing the context specified in the TaskSpec.
    """

    task_id: str | None = Field(
        default=None,
        description=("ID of the corresponding TaskSpec that this implements if it was given in the inputs"),
    )
    file_operations: list[FileOperation] | None = Field(
        default_factory=list,
        description="Ordered list of file operations to execute for this implementation task",
    )
    execution_commands: list[dict] | None = Field(
        None,
        description="Optional shell commands to run after file operations (e.g., for build or setup)",
    )
    verification_commands: list[dict] | None = Field(
        None,
        description="Optional commands to verify the changes work as expected",
    )
```

## Agent Definition

The agent definition is straightforward, directly using the implementation flow:

```python
from dhenara.agent.dsl import AgentDefinition

from .flows.implementation import implementation_flow

agent = AgentDefinition()
agent.flow(
    "main_flow",
    implementation_flow,
)
```

## Implementation Flow

The implementation flow consists of three key nodes:

```python
from dhenara.agent.dsl import (
    AIModelNode,
    AIModelNodeSettings,
    EventType,
    FileOperationNode,
    FileOperationNodeSettings,
    FlowDefinition,
    FolderAnalyzerNode,
    FolderAnalyzerSettings,
)
from dhenara.ai.types import AIModelCallConfig, ObjectTemplate, Prompt

from src.agents.autocoder.types import TaskImplementation

# Directory path for analysis
global_data_directory = "$var{run_root}/global_data"

# Create a FlowDefinition
implementation_flow = FlowDefinition()

# Task specification as a component variable
implementation_flow.vars({
    "task_spec": task_spec,  # Loaded from a file or defined programmatically
})

# 1. Folder Analysis Node
implementation_flow.node(
    "dynamic_repo_analysis",
    FolderAnalyzerNode(
        settings=FolderAnalyzerSettings(
            base_directory=global_data_directory,
            operations_template=ObjectTemplate(expression="$expr{task_spec.required_context}"),
        ),
    ),
)

# 2. Code Generation Node
implementation_flow.node(
    "code_generator",
    AIModelNode(
        pre_events=[EventType.node_input_required],
        settings=AIModelNodeSettings(
            models=["claude-3-7-sonnet", "gpt-4.1-preview", "gemini-2.0-flash"],
            system_instructions=[
                "You are a professional code implementation agent specialized in executing precise file operations.",
                # Additional system instructions...
            ],
            prompt=Prompt.with_dad_text(
                text=(
                    "## Task Description\n"
                    "$expr{task_spec.description}\n\n"
                    "## Repository Context\n"
                    "$expr{$hier{dynamic_repo_analysis}.outcome.results}\n\n"
                    "## Implementation Requirements\n"
                    "1. Generate precise file operations that can be executed programmatically\n"
                    # Additional requirements...
                ),
            ),
            model_call_config=AIModelCallConfig(
                structured_output=TaskImplementation,
                max_output_tokens=64000,
                reasoning=True,
            ),
        ),
    ),
)

# 3. File Operation Node
implementation_flow.node(
    "code_generator_file_ops",
    FileOperationNode(
        settings=FileOperationNodeSettings(
            base_directory=global_data_directory,
            operations_template=ObjectTemplate(
                expression="$expr{ $hier{code_generator}.outcome.structured.file_operations }",
            ),
            stage=True,
            commit=True,
            commit_message="$var{run_id}: Auto generated.",
        ),
    ),
)
```

## Event Handler

The event handler manages model selection and task inputs:

```python
from dhenara.agent.dsl import FlowNodeTypeEnum, NodeInputRequiredEvent
from dhenara.agent.utils.helpers.terminal import get_ai_model_node_input, get_folder_analyzer_node_input

from .flows.implementation import global_data_directory

async def node_input_event_handler(event: NodeInputRequiredEvent):
    node_input = None

    if event.node_type == FlowNodeTypeEnum.ai_model_call:
        if event.node_id == "code_generator":
            node_input = await get_ai_model_node_input(
                node_def_settings=event.node_def_settings,
            )
            # For live input mode, uncomment the following:
            # task_description = await async_input("Enter your query: ")
            # node_input.prompt_variables = {"task_description": task_description}

        event.input = node_input
        event.handled = True

    elif event.node_type == FlowNodeTypeEnum.folder_analyzer:
        if event.node_id == "dynamic_repo_analysis":
            node_input = await get_folder_analyzer_node_input(
                node_def_settings=event.node_def_settings,
                base_directory=global_data_directory,
            )

        event.input = node_input
        event.handled = True
```

## Task Specification

The task specification can be defined in a JSON file with this structure:

```json
{
  "order": 1,
  "task_id": "singleshot_task",
  "description": "Update the README file with relevant content",
  "required_context": [
    {
      "operation_type": "analyze_folder",
      "path": "some_repo/docs",
      "content_read_mode": "none"
    },
    {
      "operation_type": "analyze_file",
      "path": "some_repo/README.md",
      "content_read_mode": "full"
    }
  ]
}
```

## Implementation Approaches

The Single-Shot Coder supports three main implementation approaches:

### 1. Basic Implementation

The simplest approach with hardcoded task description and context files. Good for getting started and understanding the
flow structure.

### 2. Live Input Mode

Enhances the basic implementation by accepting inputs at runtime:

- Dynamic model selection through the terminal interface
- Task description entered by the user during execution
- Context files/folders specified at runtime

### 3. Component Variables Mode

The most flexible approach that uses component variables and structured task specifications:

- Task specifications loaded from JSON files
- Component-level variables accessible to all nodes
- Support for complex context analysis operations
- Better organization and reusability

## Running the Agent

To run the Single-Shot Coder:

```python
from dhenara.agent.dsl.events import EventType
from dhenara.agent.run import RunContext
from dhenara.agent.runner import AgentRunner

from src.agents.singleshot_coder.agent import agent
from src.agents.singleshot_coder.handler import node_input_event_handler
from src.runners.defs import project_root

root_component_id = "singleshot_coder_root"
agent.root_id = root_component_id

run_context = RunContext(
    root_component_id=root_component_id,
    project_root=project_root,
    run_root_subpath="agent_singleshot_coder",
)

run_context.register_event_handlers(
    handlers_map={
        EventType.node_input_required: node_input_event_handler,
        # Additional event handlers...
    }
)

runner = AgentRunner(agent, run_context)
```

## Advantages over Full Autocoder

- **Simplicity**: Fewer components and simpler flow
- **Speed**: Faster execution by skipping the planning phase
- **Precision**: Direct control over exactly which files are analyzed
- **Predictability**: Pre-defined task specification ensures consistent behavior

## Learn More

For a step-by-step guide on building a Single-Shot Coder from scratch, see the
[Single-Shot Coding Assistant tutorial](../tutorials/single-shot-coder/index.md), which walks through:

- Setting up the project structure
- Implementing each part of the flow
- Handling events
- Running the agent and understanding artifacts
- Enhancing with live inputs
- Using component variables

## Conclusion

The Single-Shot Coder demonstrates how DAD can be adapted for simpler use cases while still leveraging the power of the
implementation flow. It's a great example of how you can reuse components from more complex agents to create streamlined
solutions for specific tasks.

By understanding both the full [Code Generation Agent](./auto-coder.md) and this simplified version, you can choose the
right approach for different coding tasks based on their complexity and requirements.
