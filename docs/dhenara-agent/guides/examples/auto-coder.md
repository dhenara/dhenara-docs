---
sidebar_position: 3
---

# Code Generation Agent

This example demonstrates how to build a sophisticated code generation agent using Dhenara Agent DSL (DAD). The
Autocoder agent can analyze code repositories, plan implementation steps, and execute precise file operations to
implement code changes.

## Agent Overview

The Autocoder agent follows a three-step process:

1. **Analysis**: Analyzes the repository structure to understand the codebase
2. **Planning**: Creates a structured plan with implementation tasks
3. **Implementation**: Executes file operations to implement code changes

This agent showcases advanced DAD features including:

- Complex flows with multiple stages
- Conditional branching
- Folder analysis operations
- File operations for code implementation
- Structured data processing

## Agent Structure

The Autocoder agent consists of several components:

```plaintext
src/agents/autocoder/
├── __init__.py
├── agent.py                  # Main agent definition
├── handler.py                # Event handlers
├── types.py                  # Pydantic data models
└── flows/                    # Flow definitions
    ├── __init__.py
    ├── defs.py               # Common definitions
    ├── flow.py               # Main coordinator flow
    ├── planner.py            # Planning stage flow
    ├── implementation.py     # Implementation stage flow
    └── structured_cleaner.py # Helper flow for fixing structured output
```

## Main Agent Definition

The agent definition connects the coordinator flow:

```python
from dhenara.agent.dsl import AgentDefinition

from .flows.flow import coordinator_flow

# Main Agent Definition
agent = AgentDefinition()
agent.flow(
    "coordinator_flow_1",
    coordinator_flow,
)
```

## Coordinator Flow

The coordinator flow orchestrates the entire process:

```python
from dhenara.agent.dsl import FlowDefinition
from dhenara.ai.types import ObjectTemplate

from .implementation import implementation_flow
from .planner import planner_flow

# Load task information
task_background = read_background()
task_description = read_description()

# Coordinator Agent Flow
coordinator_flow = FlowDefinition()

# First stage: Planning
coordinator_flow.subflow(
    "planner",
    planner_flow,
    variables={
        "task_background": task_background,
        "task_description": task_description,
    },
)

# Conditional execution based on plan generation success
coordinator_flow.conditional(
    id="plan_executor",
    statement=ObjectTemplate(
        expression="$expr{py: $hier{planner.plan_generator}.outcome.structured is not None}",
    ),
    # Loop through all implementation tasks if plan was generated
    true_branch=FlowDefinition().for_each(
        id="implementation_loop",
        statement=ObjectTemplate(
            expression="$expr{py: $hier{planner.plan_generator}.outcome.structured.implementation_tasks }",
        ),
        item_var="task_spec",
        index_var="task_index",
        max_iterations=20,
        body=implementation_flow,
        body_variables={
            "task_background": task_background,
            # task_spec is passed via index_var
        },
    ),
    # Handle failure case
    false_branch=FlowDefinition().node(
        "no_plan_generated",
        CommandNode(
            settings=CommandNodeSettings(
                commands=[
                    "echo 'Planner is unsuccessful.'",
                ],
            )
        ),
    ),
)
```

## Planning Flow

The planning flow analyzes the repository and generates an implementation plan:

```python
from dhenara.agent.dsl import (
    AIModelNode, AIModelNodeSettings, EventType, FlowDefinition, FolderAnalyzerNode
)
from dhenara.ai.types import AIModelCallConfig, Prompt

from src.agents.autocoder.types import Plan

# Planner Agent Flow
planner_flow = FlowDefinition().vars(
    {
        "task_background": PLACEHOLDER,
        "task_description": PLACEHOLDER,
    }
)

# Repository analysis
planner_flow.node(
    "pre_plan_repo_analysis",
    FolderAnalyzerNode(
        pre_events=[EventType.node_input_required],
        settings=None,  # Configured through the handler
    ),
)

# Planning node
planner_flow.node(
    "plan_generator",
    AIModelNode(
        pre_events=[EventType.node_input_required],
        settings=AIModelNodeSettings(
            models=models,
            system_instructions=[
                "You are a professional implementation planner for coding tasks",
                # Additional instructions...
            ],
            prompt=Prompt.with_dad_text(
                text=(
                    "Task Background: $var{task_background} \n"
                    "Task: $var{task_description} \n"
                    "Context Files info:\n $expr{ $hier{pre_plan_repo_analysis}.outcome.results }\n\n"
                    # Additional prompt text...
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

## Implementation Flow

The implementation flow executes a single task from the plan:

```python
from dhenara.agent.dsl import (
    AIModelNode, AIModelNodeSettings, EventType, FileOperationNode,
    FileOperationNodeSettings, FlowDefinition, FolderAnalyzerNode, FolderAnalyzerSettings
)
from dhenara.ai.types import AIModelCallConfig, ObjectTemplate, Prompt

from src.agents.autocoder.types import TaskImplementation

# Implementation flow variables
implementation_flow = FlowDefinition().vars(
    {
        "task_background": PLACEHOLDER,
        "task_spec": "No Spec",  # Should be a TaskSpec type
    }
)

# Dynamic analysis for this specific task
implementation_flow.node(
    "dynamic_repo_analysis",
    FolderAnalyzerNode(
        settings=FolderAnalyzerSettings(
            base_directory=global_data_directory,
            operations_template=ObjectTemplate(expression="$expr{task_spec.required_context}"),
        ),
    ),
)

# Code generation node
implementation_flow.node(
    "code_generator",
    AIModelNode(
        pre_events=[EventType.node_input_required],
        settings=AIModelNodeSettings(
            models=models,
            system_instructions=[
                "You are a professional code implementation agent",
                # Additional instructions...
            ],
            prompt=Prompt.with_dad_text(
                text=(
                    "## Background\n"
                    "$var{task_background}\n\n"
                    "## Task Specification\n"
                    "Task ID: $expr{task_spec.task_id}\n"
                    "Description: $expr{task_spec.description}\n\n"
                    "## Repository Context\n"
                    "$expr{$hier{dynamic_repo_analysis}.outcome.results}\n\n"
                    # Additional prompt text...
                ),
                disable_checks=True,
            ),
            model_call_config=AIModelCallConfig(
                structured_output=TaskImplementation,
                test_mode=test_mode,
                max_output_tokens=64000,
                reasoning=True,
            ),
        ),
    ),
)

# Execute file operations
implementation_flow.node(
    "code_generator_file_ops",
    FileOperationNode(
        settings=FileOperationNodeSettings(
            base_directory=global_data_directory,
            operations_template=ObjectTemplate(
                expression="$expr{ $hier{code_generator}.outcome.structured.file_operations }",
            ),
            stage=True,
            commit=False,
        ),
    ),
)
```

## Data Models

The agent uses structured data models defined with Pydantic:

```python
from dhenara.agent.dsl.inbuilt.flow_nodes.defs.types import (
    FileOperation, FileSystemAnalysisOperation, FolderAnalysisOperation
)
from pydantic import BaseModel, Field

class TaskSpec(BaseModel):
    """
    Specification for a logical development task with its required context.
    Each task is a discrete unit of work in the overall plan.
    """

    order: int = Field(..., description="Execution order of this task in the overall plan")
    task_id: str = Field(..., description="Unique identifier for this task")
    description: str = Field(..., description="Detailed description of what this task accomplishes")
    required_context: list[FileSystemAnalysisOperation] = Field(
        default_factory=list,
        description="File-system analysis operations needed to provide context",
    )

class TaskImplementation(BaseModel):
    """
    Contains the concrete file operations to implement a specific task of the plan.
    """

    task_id: str | None = Field(default=None, description="ID of the corresponding TaskSpec")
    file_operations: list[FileOperation] | None = Field(
        default_factory=list,
        description="File operations to execute for this implementation task",
    )
    execution_commands: list[dict] | None = Field(
        None,
        description="Optional shell commands to run after file operations",
    )
    verification_commands: list[dict] | None = Field(
        None,
        description="Optional commands to verify the changes work as expected",
    )

class Plan(BaseModel):
    """
    A comprehensive, structured plan for implementing a specific task.
    """

    title: str = Field(..., description="Concise title of the plan")
    description: str = Field(..., description="Detailed explanation of the implementation approach")
    implementation_tasks: list[TaskSpec] = Field(..., description="Ordered implementation tasks")
    validation_steps: list[str] = Field(..., description="Steps to validate the implementation")
    estimated_complexity: int | None = Field(None, description="Complexity estimate (1-10)")
```

## Running the Agent

To run the Autocoder agent, you would use a runner script similar to the one below:

```python
from dhenara.agent.dsl.events import EventType
from dhenara.agent.run import RunContext
from dhenara.agent.runner import AgentRunner

from src.agents.autocoder.agent import agent
from src.agents.autocoder.handler import autocoder_input_handler
from src.runners.defs import observability_settings, project_root

root_component_id = "coding_agent_root"
agent.root_id = root_component_id

run_context = RunContext(
    root_component_id=root_component_id,
    observability_settings=observability_settings,
    project_root=project_root,
    run_root_subpath="agent_autocoder",
)

run_context.register_event_handlers(
    handlers_map={
        EventType.node_input_required: autocoder_input_handler,
        # Additional event handlers...
    }
)

runner = AgentRunner(agent, run_context)
```

## Conclusion

The Autocoder agent demonstrates how DAD can be used to create sophisticated AI agents for code generation. By
orchestrating repository analysis, planning, and implementation stages, the agent can handle complex coding tasks with
minimal human intervention.

This example highlights several advanced DAD features:

- **Multi-stage flows**: Breaking complex tasks into manageable stages
- **Structured data**: Using Pydantic models for structured inputs and outputs
- **Dynamic analysis**: Analyzing specific files based on task requirements
- **File operations**: Implementing code changes through file system operations
- **Conditional logic**: Handling success and failure cases
- **Looping**: Processing multiple implementation tasks sequentially

By understanding this example, you can create your own specialized agents for various software development tasks.
