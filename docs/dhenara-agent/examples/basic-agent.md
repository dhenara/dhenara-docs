---
title: Basic Code Generation Agent
---

# Basic Code Generation Agent

This example demonstrates a simple agent that analyzes a repository, generates code based on requirements, and implements the changes.

## Implementation

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
from dhenara.agent.dsl.inbuilt.flow_nodes.defs.types import FolderAnalysisOperation
from dhenara.ai.types import (
    AIModelCallConfig,
    ObjectTemplate,
    Prompt,
    ResourceConfigItem,
)

from src.agents.autocoder.types import TaskImplementation

# Define repository directory
repo_dir = "/path/to/repository"

# Available models
models = [
    "claude-3-7-sonnet",
    "gpt-4.1-nano",
    "claude-3-5-haiku",
    "gemini-2.0-flash"
]

# Create a flow for implementing code changes
implementation_flow = FlowDefinition()

# Add a folder analyzer node to analyze the repository
implementation_flow.node(
    "repo_analysis",
    FolderAnalyzerNode(
        pre_events=[EventType.node_input_required],
        settings=FolderAnalyzerSettings(
            base_directory=repo_dir,
            operations=[
                FolderAnalysisOperation(
                    operation_type="analyze_folder",
                    path="src",
                    include_patterns=["*.py"],
                    exclude_patterns=["__pycache__"],
                    include_content=True
                )
            ]
        )
    )
)

# Add an AI model node to generate code changes
implementation_flow.node(
    "code_generator",
    AIModelNode(
        resources=ResourceConfigItem.with_models("claude-3-7-sonnet"),
        pre_events=[EventType.node_input_required],
        settings=AIModelNodeSettings(
            system_instructions=[
                "You are a professional code implementation agent.",
                "Your task is to generate the exact file operations necessary to implement requested changes.",
            ],
            prompt=Prompt.with_dad_text(
                text=(
                    "Implement the following batch of code changes:\n\n"
                    "Task: $var{task_description} \n"
                    "Context Files info: $hier{repo_analysis}.outcome.structured\n\n"
                    "Return a TaskImplementation object."
                ),
            ),
            model_call_config=AIModelCallConfig(
                structured_output=TaskImplementation,
                max_output_tokens=8000,
            ),
        ),
    ),
)

# Add a file operation node to implement the changes
implementation_flow.node(
    "code_implementer",
    FileOperationNode(
        settings=FileOperationNodeSettings(
            base_directory=repo_dir,
            operations_template=ObjectTemplate(
                expression="$hier{code_generator}.outcome.structured.file_operations"
            ),
            stage=True,
            commit=True,
            commit_message="Implemented requested changes"
        )
    )
)

# Input handler for the nodes
async def handle_input_required(event: NodeInputRequiredEvent):
    if event.node_id == "repo_analysis":
        # Configure the folder analysis
        event.input = FolderAnalyzerNodeInput(
            settings_override=FolderAnalyzerSettings(
                base_directory=repo_dir,
                operations=[
                    FolderAnalysisOperation(
                        operation_type="analyze_folder",
                        path="src",
                        include_patterns=["*.py"],
                        exclude_patterns=["__pycache__, *.pyc"],
                        include_content=True
                    )
                ]
            )
        )
        event.handled = True
    elif event.node_id == "code_generator":
        # Get the model and task description from the user
        selected_model = await get_model_selection(models)
        task_description = await get_task_description()

        event.input = AIModelNodeInput(
            resources_override=[ResourceConfigItem.with_model(selected_model)],
            prompt_variables={
                "task_description": task_description
            }
        )
        event.handled = True

# Register the input handler
event_bus.register(EventType.node_input_required, handle_input_required)

# Execute the flow
result = await implementation_flow.execute(
    execution_context=FlowExecutionContext(
        component_id="implementation_flow",
        component_definition=implementation_flow,
        run_context=run_context
    )
)
```

## Key Concepts

### Repository Analysis

The `FolderAnalyzerNode` examines the repository to provide context for the code generation:

```python
implementation_flow.node(
    "repo_analysis",
    FolderAnalyzerNode(
        pre_events=[EventType.node_input_required],
        settings=FolderAnalyzerSettings(...)
    )
)
```

This node analyzes the specified directories and files, providing structured repository information to other nodes.

### AI-Powered Code Generation

The `AIModelNode` uses an LLM to generate structured code changes based on the repository analysis and task description:

```python
implementation_flow.node(
    "code_generator",
    AIModelNode(
        resources=ResourceConfigItem.with_models("claude-3-7-sonnet"),
        pre_events=[EventType.node_input_required],
        settings=AIModelNodeSettings(...)
    )
)
```

This node takes the repository analysis and a task description as input, and produces a structured `TaskImplementation` object containing file operations.

### Code Implementation

The `FileOperationNode` applies the generated changes to the repository:

```python
implementation_flow.node(
    "code_implementer",
    FileOperationNode(
        settings=FileOperationNodeSettings(
            base_directory=repo_dir,
            operations_template=ObjectTemplate(
                expression="$hier{code_generator}.outcome.structured.file_operations"
            ),
            stage=True,
            commit=True,
            commit_message="Implemented requested changes"
        )
    )
)
```

This node takes the file operations from the code generator and applies them to the repository.

### Interactive Input

The input handler collects necessary inputs for each node, enabling user interaction:

```python
async def handle_input_required(event: NodeInputRequiredEvent):
    if event.node_id == "repo_analysis":
        # Configure folder analysis...
    elif event.node_id == "code_generator":
        # Get task description...
```

This event-driven approach allows for dynamic configuration of nodes at runtime.

## Use Cases

This basic code generation agent pattern is useful for:

- Automating routine code changes across multiple files
- Implementing standard features or patterns consistently
- Generating boilerplate code based on specifications
- Applying code transformations based on static analysis

## Extensions

This pattern can be extended in several ways:

- Add validation nodes to review generated changes before implementation
- Implement feedback loops to refine generated code
- Add test generation and execution nodes
- Integrate with CI/CD pipelines for automated code improvements