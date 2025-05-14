---
sidebar_position: 2
---

# Part 1: Single-Shot Implementation Flow

In this first part of our tutorial, we'll build a simple "single-shot" coding assistant that can take a task description
and generate code to implement it. This will serve as the foundation for our more advanced agent in later parts.

## What is a Single-Shot Implementation?

A single-shot implementation is the simplest form of a coding assistant. It takes a task description, analyzes the
relevant code context, and generates code to implement the task in one go. Unlike more complex agents, it doesn't break
the task down into smaller steps or create a plan—it simply executes the implementation directly.

## Project Setup

Let's start by setting up our project structure:

1. Create a new project (or use an existing one):

```bash
dhenara startproject coding_assistant
cd coding_assistant
```

2. Create a new agent for our single-shot coder:

```bash
dhenara create agent singleshot_coder
```

## Understanding the Project Structure

This will create the following structure:

```
src/
├── agents/
│   └── singleshot_coder/
│       ├── __init__.py
│       ├── agent.py
│       ├── flow.py
│       └── handler.py
└── runners/
    ├── __init__.py
    ├── defs.py
    └── singleshot_coder.py
```

## Creating the Types

Before we implement our flow, let's create a file to define the types our agent will use. In the `singleshot_coder`
directory, create a `types.py` file:

```python
from dhenara.agent.dsl.inbuilt.flow_nodes.defs.types import (
    FileOperation,
    FileSystemAnalysisOperation,
    FolderAnalysisOperation,
)
from pydantic import BaseModel, Field


class TaskSpecWithFolderAnalysisOps(BaseModel):
    """Task specification with required context for implementation"""

    task_id: str = Field(
        ...,
        description="Unique identifier for this task",
    )
    description: str = Field(
        ...,
        description="Detailed description of what this task accomplishes in markdown format",
    )
    required_context: list[FolderAnalysisOperation] = Field(
        default_factory=list,
        description=(
            "List of specific file-system analysis operations needed to provide context for implementing this task."
        ),
    )


class TaskImplementation(BaseModel):
    """
    Contains the concrete file operations to implement a specific task.
    This is the output generated after analyzing the context specified in the TaskSpec.
    """

    task_id: str | None = Field(
        default=None,
        description="ID of the corresponding TaskSpec that this implements",
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

## Implementing the Flow

Now, let's update the `flow.py` file with our implementation flow. This flow will:

1. Read context files based on a predefined task specification
2. Generate code based on the task and context
3. Execute the generated file operations

```python
# src/agents/singleshot_coder/flow.py
import json
from pathlib import Path

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
from dhenara.ai.types import (
    AIModelCallConfig,
    ObjectTemplate,
    Prompt,
)

from .types import TaskImplementation, TaskSpecWithFolderAnalysisOps

# Define the base directory for file operations
global_data_directory = "$expr{run_root}/global_data"

# Define the available AI models
models = [
    "claude-3-7-sonnet",
    "gpt-4.1",
    "gpt-4.1-mini",
    "claude-3-5-haiku",
]

# Optional: Set test_mode to True for development without API calls
test_mode = False


def read_task_spec():
    # For tutorial purposes, we're defining a simple task spec here
    # In a real application, you might read this from a file or user input
    task_spec = TaskSpecWithFolderAnalysisOps(
        task_id="example_task",
        description="Create a simple Python function that calculates the Fibonacci sequence up to n terms and returns it as a list.",
        required_context=[
            # This would typically include analysis operations for relevant code
            # For this simple example, we'll leave it empty
        ],
    )
    return task_spec


# Create our implementation flow
implementation_flow = FlowDefinition()

# 1. Read in our task specification
task_spec = read_task_spec()

# 2. Analyze the repository context based on the task specification
implementation_flow.node(
    "context_analysis",
    FolderAnalyzerNode(
        settings=FolderAnalyzerSettings(
            base_directory=global_data_directory,
            operations_template=ObjectTemplate(expression="$expr{task_spec.required_context}"),
        ),
    ),
)

# 3. Generate code implementation
implementation_flow.node(
    "code_generator",
    AIModelNode(
        pre_events=[EventType.node_input_required],  # This will trigger our input handler
        settings=AIModelNodeSettings(
            models=models,
            system_instructions=[
                "You are a professional code implementation agent specialized in executing precise file operations.",
                "Your task is to generate the exact file operations necessary to implement requested code changes - nothing more, nothing less.",
                "Generate machine-executable operations that require zero human intervention.",
                "ALLOWED OPERATIONS:",
                "- create_file(file_path, content)",
                "- delete_file(file_path)",
                "- create_directory(directory_path)",
                "- move_file(source_path, destination_path)",
                "IMPLEMENTATION GUIDELINES:",
                "1. For complete file replacement, use delete_file followed by create_file.",
                "2. Maintain the project's existing code style, indentation, and formatting conventions.",
                "3. Use Python 3.10 style in all code examples.",
            ],
            prompt=Prompt.with_dad_text(
                text=(
                    "## Task Specification\n"
                    f"Task ID: {task_spec.task_id}\n"
                    f"Description: {task_spec.description}\n\n"
                    "## Repository Context\n"
                    "$expr{$hier{context_analysis}.outcome.results}\n\n"
                    "## Implementation Requirements\n"
                    "1. Generate precise file operations that can be executed programmatically\n"
                    "2. Follow a complete implementation strategy that addresses all aspects of the task\n\n"
                    "## Output Format\n"
                    "Return a TaskImplementation object\n"
                ),
            ),
            model_call_config=AIModelCallConfig(
                structured_output=TaskImplementation,
                test_mode=test_mode,
            ),
        ),
    ),
)

# 4. Execute the file operations
implementation_flow.node(
    "file_operations",
    FileOperationNode(
        settings=FileOperationNodeSettings(
            base_directory=global_data_directory,
            operations_template=ObjectTemplate(
                expression="$expr{ $hier{code_generator}.outcome.structured.file_operations }",
            ),
            stage=True,  # Stage changes without committing
            commit=False,
        ),
    ),
)
```

## Implementing the Handler

Next, let's update the handler.py file to handle the input required event:

```python
# src/agents/singleshot_coder/handler.py
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


async def singleshot_coder_input_handler(event: NodeInputRequiredEvent):
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
# src/agents/singleshot_coder/agent.py
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
# src/runners/singleshot_coder.py
from dhenara.agent.dsl.events import EventType
from dhenara.agent.run import RunContext
from dhenara.agent.runner import AgentRunner
from dhenara.agent.utils.helpers.terminal import (
    print_component_completion,
    print_node_completion,
)

# Import our agent and handler
from src.agents.singleshot_coder.agent import agent
from src.agents.singleshot_coder.handler import singleshot_coder_input_handler
from src.runners.defs import observability_settings, project_root

# Configure the agent with a root ID
root_component_id = "singleshot_coder_root"
agent.root_id = root_component_id

# Create run context
run_context = RunContext(
    root_component_id=root_component_id,
    observability_settings=observability_settings,
    project_root=project_root,
    run_root_subpath="agent_singleshot_coder",
)

# Register event handlers
run_context.register_event_handlers(
    handlers_map={
        EventType.node_input_required: singleshot_coder_input_handler,
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
dhenara run agent singleshot_coder
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
