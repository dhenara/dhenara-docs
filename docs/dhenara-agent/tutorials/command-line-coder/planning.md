---
sidebar_position: 3
---

# Part 2: Planning Flow

In the previous part, we built a simple single-shot coding assistant that could implement straightforward tasks in one
go. However, for more complex tasks, it's helpful to first create a plan that breaks the task down into manageable
steps.

In this part, we'll add a planning flow to our coding assistant that will:

1. Analyze the codebase to understand the context
2. Create a structured plan with multiple implementation steps
3. Prepare the groundwork for executing those steps sequentially

## Why Add Planning?

Planning offers several advantages for a coding assistant:

- **Better context management**: Breaking tasks into smaller pieces helps manage the context window limitations of LLMs
- **Improved structured reasoning**: Planning first encourages the model to think through the problem before coding
- **Progress tracking**: A plan allows tracking progress through complex tasks
- **Error isolation**: If one step fails, others can still succeed

## Creating a New Agent

Let's create a new agent that builds on our single-shot implementation but adds planning capabilities:

```bash
dhenara create agent planner_coder
```

## Understanding the Plan Structure

First, let's define the structure for our plan in a `types.py` file:

```python
# src/agents/planner_coder/types.py
from dhenara.agent.dsl.inbuilt.flow_nodes.defs.types import (
    FileOperation,
    FileSystemAnalysisOperation,
    FolderAnalysisOperation,
)
from pydantic import BaseModel, Field


class TaskSpec(BaseModel):
    """
    Specification for a logical development task with its required context.
    Each task is a discrete unit of work in the overall plan.
    """

    order: int = Field(
        ...,
        description="Execution order of this task in the overall plan",
    )
    task_id: str = Field(
        ...,
        description="Unique identifier for this task using only lowercase letters, numbers, and underscores [a-z0-9_]",
        pattern="^[a-z0-9_]+$",
    )
    description: str = Field(
        ...,
        description="Precise and detailed description of what this task accomplishes in markdown format",
    )
    required_context: list[FolderAnalysisOperation] = Field(
        default_factory=list,
        description="List of specific file-system analysis operations needed to provide context for implementing this task",
    )


class Plan(BaseModel):
    """
    A comprehensive, structured plan for implementing a specific task given by the user.
    Outlines the entire implementation strategy broken down into logical tasks.
    """

    title: str = Field(
        ...,
        description="Concise title of the plan under 100 characters",
    )
    description: str = Field(
        ...,
        description="Detailed explanation of the implementation approach in markdown format",
    )
    implementation_tasks: list[TaskSpec] = Field(
        ...,
        description="Ordered tasks of implementation, each representing a logical step in the overall plan",
    )
    validation_steps: list[str] = Field(
        ...,
        description="Steps to validate that the complete implementation works correctly",
    )
    estimated_complexity: int | None = Field(
        None,
        description="Optional estimate of implementation complexity on a scale of 1-10",
        ge=1,
        le=10
    )

    def get_task_by_id(self, task_id: str) -> TaskSpec | None:
        """Retrieve a specific implementation task by its ID"""
        for task in self.implementation_tasks:
            if task.task_id == task_id:
                return task
        return None


class TaskImplementation(BaseModel):
    """
    Contains the concrete file operations to implement a specific task of the plan.
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

## Creating the Planner Flow

Now, let's create a planner flow in a new file called `planner.py`:

```python
# src/agents/planner_coder/flows/planner.py
from dhenara.agent.dsl import (
    AIModelNode,
    AIModelNodeSettings,
    EventType,
    FlowDefinition,
    FolderAnalyzerNode,
    FolderAnalyzerSettings,
)
from dhenara.agent.dsl.inbuilt.flow_nodes.defs.types import FolderAnalysisOperation
from dhenara.ai.types import (
    AIModelCallConfig,
    ObjectTemplate,
    Prompt,
)

from ..types import Plan

# Constants
global_data_directory = "$expr{run_root}/global_data"
models = [
    "claude-3-5-sonnet",
    "gpt-4o",
    "gpt-4-turbo",
    "claude-3-opus",
    "gpt-4o-mini",
    "claude-3-5-haiku",
]
test_mode = False

# Create the planner flow
planner_flow = FlowDefinition().vars(
    {
        "task_description": "Create a simple web server in Python using Flask that serves a RESTful API with endpoints for creating, reading, updating, and deleting user records stored in a SQLite database.",
    }
)

# 1. Initial Folder Analysis for Context
planner_flow.node(
    "repo_analysis",
    FolderAnalyzerNode(
        pre_events=[EventType.node_input_required],  # This will trigger our input handler
        settings=FolderAnalyzerSettings(
            base_directory=global_data_directory,
            operations=[
                FolderAnalysisOperation(
                    operation_type="analyze_folder",
                    path=".",  # Analyze the current directory
                    max_depth=3,
                    include_primary_meta=True,
                    respect_gitignore=True,
                    content_read_mode="structure",
                    max_words_per_file=None,
                ),
            ],
        ),
    ),
)

# 2. Planning Node
planner_flow.node(
    "plan_generator",
    AIModelNode(
        pre_events=[EventType.node_input_required],
        settings=AIModelNodeSettings(
            models=models,
            system_instructions=[
                "You are a professional implementation planner for coding tasks.",
                "Your job is to create a detailed implementation plan based on the task requirements and folder analysis.",
                "Break down complex tasks into logical steps that can be implemented independently.",
                "For each step, specify which files need to be analyzed to provide context.",
                "Optimize for implementation with LLM context window limitations.",
                "Return a structured Plan object for downstream processing.",
            ],
            prompt=Prompt.with_dad_text(
                text=(
                    "## Task Description\n"
                    "$var{task_description}\n\n"
                    "## Repository Context\n"
                    "$expr{$hier{repo_analysis}.outcome.results}\n\n"
                    "Generate a detailed implementation plan. You must return a Plan object with the following:\n"
                    "1. A concise title for the plan\n"
                    "2. A detailed description of the implementation approach\n"
                    "3. An ordered list of implementation tasks, each with:\n"
                    "   - A unique task_id\n"
                    "   - An execution order number\n"
                    "   - A detailed description\n"
                    "   - Required context (specific files/folders to analyze)\n"
                    "4. Validation steps to verify the implementation\n"
                    "5. An estimated complexity rating (1-10)\n\n"
                    "Optimize for context window limitations by keeping each task focused and manageable.\n"
                ),
            ),
            model_call_config=AIModelCallConfig(
                structured_output=Plan,
                test_mode=test_mode,
            ),
        ),
    ),
)
```

## Implementing the Handler

Let's update our handler to support the planning flow:

```python
# src/agents/planner_coder/handler.py
from dhenara.agent.dsl import (
    FlowNodeTypeEnum,
    NodeInputRequiredEvent,
)
from dhenara.agent.utils.helpers.terminal import (
    async_input,
    get_ai_model_node_input,
    get_folder_analyzer_node_input,
)

# Global constants (you might want to move these to a defs.py file)
global_data_directory = "$expr{run_root}/global_data"
models = [
    "claude-3-5-sonnet",
    "gpt-4o",
    "gpt-4-turbo",
    "claude-3-opus",
    "gpt-4o-mini",
    "claude-3-5-haiku",
]


async def planner_coder_input_handler(event: NodeInputRequiredEvent):
    """Handles input required events for the planner coder"""
    if event.node_type == FlowNodeTypeEnum.ai_model_call:
        node_input = None

        if event.node_id == "plan_generator":
            node_input = await get_ai_model_node_input(
                node_def_settings=event.node_def_settings,
                models=models,
            )

            # Get the task description from the user
            task_description = await async_input("Please enter your coding task: ")
            node_input.prompt_variables = {"task_description": task_description}

        else:
            print(f"WARNING: Unhandled ai_model_call input event for node {event.node_id}")

        event.input = node_input
        event.handled = True

    elif event.node_type == FlowNodeTypeEnum.folder_analyzer:
        if event.node_id == "repo_analysis":
            node_input = await get_folder_analyzer_node_input(
                node_def_settings=event.node_def_settings,
                base_directory=global_data_directory,
            )
        else:
            print(f"WARNING: Unhandled folder_analyzer input event for node {event.node_id}")

        event.input = node_input
        event.handled = True
```

## Setting Up the Agent

With our planner flow defined, let's update the agent.py file:

```python
# src/agents/planner_coder/agent.py
from dhenara.agent.dsl import AgentDefinition

from .flows.planner import planner_flow

# Main Agent Definition
agent = AgentDefinition()
agent.flow(
    "planner",
    planner_flow,
)
```

## Testing the Planner

Now you can run your planner agent:

```bash
dhenara run agent planner_coder
```

When you run this, you'll be prompted for a task description. The agent will then analyze the codebase and generate a
structured plan with steps for implementation.

## Examining the Results

After running the agent, you can examine the generated plan in the outcome.json file in the run directory. The plan will
include:

- A title and description of the implementation approach
- A list of ordered tasks with unique IDs
- For each task, a detailed description and required context
- Validation steps to verify the implementation
- An estimated complexity rating

## What's Next?

Now that we have a planning flow that can break down complex tasks into manageable steps, we need to enhance our
implementation flow to:

1. Accept a task from the plan
2. Analyze the required context
3. Implement the specific task

In [Part 3: Enhanced Implementation Flow](./enhanced-implementation.md), we'll update our implementation flow to handle
these requirements and work with the output from our planner.
