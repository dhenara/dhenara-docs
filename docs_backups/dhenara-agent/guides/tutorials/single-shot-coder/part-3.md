---
title: Part 3- Component Variables
---

# Part 3: Component Variables

In Part 2, we implemented live inputs for our agent, allowing us to specify the task description and context files at
runtime. While this is a significant improvement, entering multiple folder analysis operations one by one can be
tedious, especially when dealing with complex projects that require analyzing numerous files for context.

In this part, we'll enhance our implementation by using **component variables** and structured task specifications
loaded from files. This approach provides greater flexibility and reusability to our agent.

## What are Component Variables?

In the Dhenara Agent DSL (DAD), components are high-level constructs like Flows and Agents. Component variables are
variables defined at the component level that are accessible to all nodes within that component. This is a powerful
feature for several reasons:

1. **Shared Configuration**: Multiple nodes can access the same data without duplicating it
2. **Flow Reusability**: The same flow can be used in different agents with different variable values
3. **Clean Separation**: You can separate complex configurations from your flow logic

For our implementation flow, we'll use component variables to store task specifications, making it easier to handle
complex tasks and creating more maintainable code.

## Task Specification Structure

Before we implement component variables, let's understand the task specification structure we'll be using. We'll define
a `TaskSpec` type that contains:

1. An order number for execution sequencing
2. A unique task ID
3. A detailed description of what the task should accomplish
4. A list of required context files/folders that the LLM needs to analyze to implement the task

This structured approach allows us to define complex tasks in a JSON file, which we can load into our flow as a
component variable.

## Implementing Component Variables

Let's enhance our implementation by adding component variables to our flow. We'll make the following changes:

1. Expand our types to include `TaskSpec` and `TaskSpecWithFolderAnalysisOps`
2. Create a function to load the task specification from a JSON file
3. Add the task specification as a component variable to our flow
4. Update the FolderAnalyzerNode to use operations from the task specification
5. Update the AIModelNode to use the task description from the specification

### Step 1: Update the Types

First, let's update our `types.py` file to include the task specification types:

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

### Step 2: Update the Implementation Flow

Next, let's update our implementation flow to use component variables:

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

### Step 3: Update the Handler

Finally, let's update our handler to work with our new component variables approach:

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

## Creating the JSON Task Specification

To make our component variables approach work, we need to create two files:

1. A Markdown file for the task description
2. A JSON file for the task specification

Let's create these files in the `src/common/live_prompts/autocoder/` directory:

```markdown
# task_description.md

Create a readme file
```

```json
# task_spec.json
{
    "order": 1,
    "task_id": "singleshot_task",
    "description": "No description as it should be read from file",
    "required_context": [
        {
            "operation_type": "analyze_folder",
            "path": "dhenara_docs/docs",
            "content_read_mode": "none",
            "additional_gitignore_paths": null
        },
        {
            "operation_type": "analyze_file",
            "path": "dhenara_docs/sidebars.ts",
            "content_read_mode": "full"
        }
    ]
}
```

## Key Differences and Improvements

Let's understand the key improvements in this approach compared to the previous parts:

1. **Component Variables**:

   - We added `implementation_flow.vars({"task_spec": task_spec})` to define a component-level variable
   - All nodes in the flow can access this variable using `$expr{task_spec...}` expressions

2. **Structured Task Definition**:

   - We defined a proper `TaskSpec` data model with Pydantic
   - The task specification can now be loaded from a JSON file

3. **Dynamic Context Analysis**:

   - The FolderAnalyzerNode now uses
     `operations_template=ObjectTemplate(expression="$expr{task_spec.required_context}")` to dynamically get operations
     from our task specification
   - We no longer need user input for each analysis operation

4. **Prompt Template**:

   - The AIModelNode prompt now uses `$expr{task_spec.task_id}` and `$expr{task_spec.description}` to reference the task
     information

5. **Handler Simplification**:
   - We've commented out the code to manually get the task description through user input
   - The handler is now simpler because most configuration comes from the component variables

## Running the Enhanced Agent

To run our agent with component variables:

1. Make sure you've created the necessary directory structure:

   ```bash
   mkdir -p src/common/live_prompts/autocoder
   ```

2. Create the task description and specification files:

   ```bash
   echo "Create a readme file" > src/common/live_prompts/autocoder/task_description.md
   ```

   And create the JSON file with the content shown above.

3. Run the agent:
   ```bash
   dad agent run autocoder
   ```

## Benefits of Component Variables

Using component variables provides several benefits:

1. **Reduced Code Duplication**: You define configuration once and reference it throughout the flow
2. **Cleaner Flow Definition**: Your flow focuses on the structure rather than detailed configurations
3. **Easier Maintenance**: Changes to configuration are centralized
4. **Flow Reusability**: The same flow can be used with different variable values
5. **Better Organization**: Logical separation between flow structure and configuration

## What's Next?

Now that we've built a fully functional single-shot coding assistant with component variables, you can explore more
advanced features:

1. **Multiple Flows**: Create additional flows for different purposes, like planning or verification
2. **Flow Composition**: Compose flows together to create more complex agents
3. **Advanced Event Handling**: Implement more sophisticated event handlers
4. **Custom Nodes**: Create your own custom nodes to extend the functionality

The complete code for this tutorial can be found in the
[DAD Tutorials repository](https://github.com/dhenara/dad_tutorials).
