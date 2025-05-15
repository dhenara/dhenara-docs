---
title: Part 3- Component Variables
---

# Part 3: Component Variables

In part 2, you were able to feed live inputs to nodes. But When you want to do multiple folder analysis operations, entering them one by one might be a bit tedious. An easy
workaround here is to save them in a JSON file, and then load it. But it requires an additional fitting, the
`component variables`. We will see this detail here

## Component Variables
Components are nothing but Flows and Agents. You can add component level variable which will be availabel for all nodes in that flow.
This is very useful feature when you want to reuse the flows acrosss agents. Eg, by adding component level varialbes, you can use the same implentaion flow to feed output of a plannder flow in a more enhanced CLI agent descibed in the next tutorial

## Final Code
The final code of this tutorial can be found in [DAD Tutorials](https://github.com/dhenara/dad_tutorials)

`src/agents/autocoder/types.py`:
```python
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
    Represents a logical task of implementation with its required context and description.
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
        description=(
            "Precise and detailed description of what this task accomplishes in markdown format. "
            "This is send to an LLM as along with the context read with `required_context`, "
            "so this should be detailed enough for the LLM to do the task"
        ),
    )
    required_context: list[FileSystemAnalysisOperation] = Field(
        default_factory=list,
        description=(
            "List of specific file-system analysis operations needed to provide context for implementing this task."
        ),
    )


class TaskSpecWithFolderAnalysisOps(TaskSpec):
    """Task spec with FolderAnalysisOperation in required_context for more option in analysis"""

    required_context: list[FolderAnalysisOperation] = Field(
        default_factory=list,
        description=(
            "List of specific file-system analysis operations needed to provide context for implementing this task."
        ),
    )


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

`src/agents/autocoder/flows/implementation.py`:

```python
# ruff: noqa: E501
import json
from dhenara.agent.dsl import (
    PLACEHOLDER,
    AIModelNode,
    AIModelNodeSettings,
    EventType,
    FileOperationNode,
    FileOperationNodeSettings,
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

from src.agents.autocoder.types import TaskImplementation,TaskSpecWithFolderAnalysisOps


# Parent of the repo where we analyse the folders
global_data_directory = "$var{run_root}/global_data"


def read_description():
    with open("src/common/live_prompts/autocoder/task_description.md") as file:
        return file.read()


def read_task_spec_json():
    with open("src/common/live_prompts/autocoder/task_spec.json") as file:
        spec_dict = json.load(file)
        spec = TaskSpecWithFolderAnalysisOps(**spec_dict)

        # Update the placeholder description in `task_spec.json` with the `task_description.md` file content
        _task_description = read_description()
        spec.description = _task_description
        return spec


task_spec = read_task_spec_json()

# Create a FlowDefinition
implementation_flow = FlowDefinition()

implementation_flow.vars(
    {
        "task_spec": task_spec,
    }
)



# 1. Dynamic Folder Analysis
implementation_flow.node(
    "dynamic_repo_analysis",
    FolderAnalyzerNode(
        # pre_events=[EventType.node_input_required],
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
            models=["claude-3-7-sonnet","o4-mini", "gemini-2.0-flash"],
            system_instructions=[
                # Role and Purpose
                "You are a professional code implementation agent specialized in executing precise file operations.",
                "Your task is to generate the exact file operations necessary to implement requested code changes - nothing more, nothing less.",
                "Generate machine-executable operations that require zero human intervention.",
                # Supported Operations
                "ALLOWED OPERATIONS:",
                "- create_file(file_path, content)",
                "- delete_file(file_path)",
                "- create_directory(directory_path)",
                # Prohibited Operations
                "PROHIBITED OPERATIONS (do not use):",
                "- edit_file",
                "- list_directory",
                "- search_files",
                "- get_file_metadata",
                "- list_allowed_directories",
                # Best Practices
                "IMPLEMENTATION GUIDELINES:",
                "1. For complete file replacement, use delete_file followed by create_file instead of a single edit_file.",
                "2. Maintain the project's existing code style, indentation, and formatting conventions.",
            ],
            prompt=Prompt.with_dad_text(
                text=(
                    "Task Specification\n"
                    "Task ID: $expr{task_spec.task_id}\n"
                    "Description: $expr{task_spec.description}\n\n"
                    "## Repository Context\n"
                    "$expr{$hier{dynamic_repo_analysis}.outcome.results}\n\n"
                    "## Implementation Requirements\n"
                    "1. Generate precise file operations that can be executed programmatically\n"
                    "2. Strictly follow instructions\n"
                    "3. Consider the entire context when making implementation decisions\n"
                    "## Output Format\n"
                    "Return a TaskImplementation object\n"
                ),
            ),
            model_call_config=AIModelCallConfig(
                structured_output=TaskImplementation,
                test_mode=False,
                max_output_tokens=64000,
                max_reasoning_tokens=4000,
                reasoning=True,
                timeout=1800.0,  # 30 minutes
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

`src/agents/autocoder/handler.py`:
```python
from dhenara.agent.dsl import (
    FlowNodeTypeEnum,
    NodeInputRequiredEvent,
)
from dhenara.agent.utils.helpers.terminal import async_input, get_ai_model_node_input, get_folder_analyzer_node_input

from .flows.implementation import global_data_directory

async def node_input_event_handler(event: NodeInputRequiredEvent):
    node_input = None

    if event.node_type == FlowNodeTypeEnum.ai_model_call:
        if event.node_id == "code_generator": # NOTE: This is the node ID
            node_input = await get_ai_model_node_input(
                node_def_settings=event.node_def_settings,
            )
            #task_description= await async_input("Enter your query: ")
            #node_input.prompt_variables = {"task_description": task_description}

        event.input = node_input
        event.handled = True

    elif event.node_type == FlowNodeTypeEnum.folder_analyzer:
        if event.node_id == "dynamic_repo_analysis":
            node_input = await get_folder_analyzer_node_input(
                node_def_settings=event.node_def_settings,
                base_directory=global_data_directory,
                predefined_exclusion_patterns=[],
            )

        event.input = node_input
        event.handled = True
```


