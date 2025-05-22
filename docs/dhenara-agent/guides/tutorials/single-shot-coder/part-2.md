---
title: Part 1- Live Inputs
---

# Part 2: Live Inputs

If you look into the flow in part 1, we were hard coding the _task_description_ inside the flow, which is a bit weird.
You don't want to edit your source code every time when you run the agent.

DAD's event system helps here. In this part we will modify the implementation*flow to accept live inputs on run. Make
sure you switch back to \_test_mode* until the last section in this part so that you don't want to send wrong inputs to
APIs and cost money.

## Live Model Selections

First we will add an option to select the model on run. For that, add multiple models to the AIModelNode.

In the `src/agents/autocoder/flows/implementation.py` file make 2 changes:

- Add a `pre_events` as `node_input_required`
- Add more models.

```python
implementation_flow.node(
    "code_generator",
    AIModelNode(
        pre_events=[EventType.node_input_required],
        settings=AIModelNodeSettings(
            models=["claude-3-7-sonnet","o4-mini", "gemini-2.0-flash"],
            system_instructions= ...
```

This will make this node trigger a _node_input_required_ event, and wait for its response before proceeding to
execution. But if you run the agent right now, you will see an error in the logs as:

```text
ERROR:dhenara.agent.dsl.base.node.node_executor:code_generator: No input provided for node via event node_input_required"
```

It is because you are not handling that event though you added it. Let's modify `src/agents/autocoder/handler.py` now.

```python
from dhenara.agent.dsl import (
    FlowNodeTypeEnum,
    NodeInputRequiredEvent,
)
from dhenara.agent.utils.helpers.terminal import async_input, get_ai_model_node_input


async def node_input_event_handler(event: NodeInputRequiredEvent):
    node_input = None
    if event.node_type == FlowNodeTypeEnum.ai_model_call:

        if event.node_id == "code_generator": # NOTE: This is the node ID
            node_input = await get_ai_model_node_input(
                node_def_settings=event.node_def_settings,
            )

        event.input = node_input
        event.handled = True
```

The built-in `get_ai_model_node_input` will handle everything for you. It will trigger a command line prompt and show a
menu to select the models. If you want to change the models to a subset of models defined inside the node, pass the
`models` parameter to this function, else it will use the models inside node definition.

Now if you run this agent, you will see a prompt to select a model.

```bash
(.venv) $ dad agent run autocoder
✓ Node dynamic_repo_analysis execution completed

=== AI Model Selection ===

Select an AI model:
1. claude-3-7-sonnet
2. o4-mini
3. gemini-2.0-flash
Enter number:
```

## Taking live task description

If you closely watch the prompt:

```python
            prompt=Prompt.with_dad_text(
                text=(
                    "## Task Description\n"
                    f"{task_description}"
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
```

You can see currently the _task_description_ is just a Python string substitution. But we want to make it run time. The
best way to handle this is making _task_description_ as DAD variable with a `$var{}`. So modify the prompt as below:

```python
            prompt=Prompt.with_dad_text(
                text=(
                    "## Task Description\n"
                    "$var{task_description}"
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
```

And then modify `src/agents/autocoder/handler.py` as:

```python
from dhenara.agent.dsl import (
    FlowNodeTypeEnum,
    NodeInputRequiredEvent,
)
from dhenara.agent.utils.helpers.terminal import async_input, get_ai_model_node_input


async def node_input_event_handler(event: NodeInputRequiredEvent):
    node_input = None
    if event.node_type == FlowNodeTypeEnum.ai_model_call:
        if event.node_id == "code_generator": # NOTE: This is the node ID
            node_input = await get_ai_model_node_input(
                node_def_settings=event.node_def_settings,
            )
            task_description = await async_input("Enter your query: ")
            node_input.prompt_variables = {"task_description": task_description}

        event.input = node_input
        event.handled = True
```

Here you are waiting for a user input and passing it as a prompt variable to the AI model Node.

Now if you run this (even in test mode), it will ask you for a task description. If you look into the _prompt_ inside
_state.json_ you will see your live input has been taken into the prompt.

```text
"prompt": "## Task Description\ngenerate a readme## Repository Context\n...
```

## Live inputs for the FolderAnalyser

Accepting live task descriptions is cool, but every time you run this, you may be asking about different project repos
or even different parts in project repos. The context you want to send to the LLM will be different each time, and thus
the FolderAnalyserNode should also accept live inputs.

First modify the FolderAnalyzerNode by:

- Add a _node_input_required_ pre_event
- Set setting to None, as we will feed it dynamically

```python
# 1. Dynamic Folder Analysis
implementation_flow.node(
    "dynamic_repo_analysis",
    FolderAnalyzerNode(
        pre_events=[EventType.node_input_required],
        settings=None,
        ),
)
```

And then modify `src/agents/autocoder/handler.py` to handle the _dynamic_repo_analysis_ event too.

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
            task_description = await async_input("Enter your query: ")
            node_input.prompt_variables = {"task_description": task_description}

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

And here again, the `get_folder_analyzer_node_input()` will show a command line interface to get inputs from you, but
you are free to write your own version too.

Now when you run, you will see a prompt to enter operations:

```bash
(.venv) $ dad agent run autocoder

=== Repository Analysis Configuration ===

Select operation type:
1. analyze_folder - Recursively examine a directory
2. analyze_file - Analyze a single file
3. find_files - Search for files matching patterns
4. get_structure - Get directory structure without contents
Enter number:
```

And a lot of further controls on operations too:

```bash
(.venv) $ dad agent run autocoder

=== Repository Analysis Configuration ===

Select operation type:
1. analyze_folder - Recursively examine a directory
2. analyze_file - Analyze a single file
3. find_files - Search for files matching patterns
4. get_structure - Get directory structure without contents
Enter number: 1
Enter path (relative to base dir `$var{run_root}/global_data`): dhenara_docs
Respect .gitignore files? [Y/n]:
Include hidden files (starting with .)? [y/N]:
Read file contents? [Y/n]:
Select content read mode:
1. full - Return the raw text content
2. structure - Extract structural elements
Enter number: 1
Select a predefined exclusion_pattern:
1. No exclussion patters
Enter number: 1
Configure advanced options? [y/N]: N
Add another analysis operation? [y/N]: N

Configured operations:
1. analyze_folder - dhenara_docs
✓ Node dynamic_repo_analysis execution completed

=== AI Model Selection ===

Select an AI model:
1. claude-3-7-sonnet
2. o4-mini
3. gemini-2.0-flash
Enter number: 1
Using model: claude-3-7-sonnet
Enter your query: Check intro section
✓ Node code_generator execution completed
✓ Node code_generator_file_ops execution completed
✓ main_flow execution completed
✓ autocoder_root execution completed
Agent standard run completed successfully. Run ID: run_20250515_121100_f36578


✅ RUN COMPLETED SUCCESSFULLY
────────────────────────────────────────────────────────────────────────────────
  Run ID: run_20250515_121100_f36578
  Artifacts location: path/to/dev_agents/runs/run_20250515_121100_f36578


Logs in path/to/dev_agents/runs/run_20250515_121100_f36578/.trace/logs.jsonl

(.venv) $
```

## Final Code

```python
# ruff: noqa: E501
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

from src.agents.autocoder.types import TaskImplementation


# Parent of the repo where we analyse the folders
global_data_directory = "$var{run_root}/global_data"

# Create a FlowDefinition
implementation_flow = FlowDefinition()


# 1. Dynamic Folder Analysis
implementation_flow.node(
    "dynamic_repo_analysis",
    FolderAnalyzerNode(
        pre_events=[EventType.node_input_required],
        settings=None,
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
                    "## Task Description\n"
                    "$var{task_description}"
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

Handler:

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
            task_description = await async_input("Enter your query: ")
            node_input.prompt_variables = {"task_description": task_description}

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

## What's Next?

When you want to do multiple folder analysis operations, entering them one by one might be a bit tedious. An easy
workaround here is to save them in a JSON file, and then load it. But it requires an additional fitting, the
`component variables`. It's the way to add variables available to all nodes in a flow. In the next part we will see
that.
