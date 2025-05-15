---
title: Nodes
---

# Nodes

## Overview

Nodes are the atomic execution units in Dhenara Agent DSL (DAD). Each node performs a specific function, such as making
an AI model call, analyzing a folder, or performing file operations. Nodes form the fundamental building blocks of flows
and agents, enabling complex behavior through composition.

## Core Concepts

Nodes in DAD follow these key principles:

- **Single Responsibility**: Each node focuses on a specific function
- **Typed Input/Output**: Nodes have well-defined input and output types
- **Configuration**: Nodes are configured through settings classes
- **Event-Driven**: Nodes can emit and respond to events
- **Extensible**: The node system can be extended with custom node types

## Built-in Node Types

DAD includes several built-in node types for common operations:

### AIModelNode

The `AIModelNode` makes calls to AI models (like GPT-4, Claude) to process prompts and generate responses.

```python
from dhenara.agent.dsl import AIModelNode, AIModelNodeSettings
from dhenara.ai.types import AIModelCallConfig, Prompt

ai_node = AIModelNode(
    pre_events=[EventType.node_input_required],  # Enables dynamic input handling
    settings=AIModelNodeSettings(
        models=["claude-3-7-sonnet", "o4-mini", "gemini-2.0-flash"],  # Multiple model options
        system_instructions=["You are a helpful assistant."],
        prompt=Prompt.with_dad_text("Generate ideas for: $var{topic}"),  # Template variable
        model_call_config=AIModelCallConfig(
            max_output_tokens=8000,
            structured_output=TaskImplementation,  # Type for structured output
            reasoning=True,
            max_reasoning_tokens=4000,
            options={"temperature": 0.7}
        )
    ),
)
```

**Key Features**:

- Configure multiple AI models via `models` parameter
- Set system instructions and prompts with template variables
- Control model parameters like temperature and max tokens
- Request structured outputs using Pydantic models
- Handle dynamic inputs through event system
- Access reasoning process with the `reasoning` parameter

### FileOperationNode

The `FileOperationNode` performs file system operations like creating, editing, deleting, and moving files.

```python
from dhenara.agent.dsl import FileOperationNode, FileOperationNodeSettings
from dhenara.ai.types import ObjectTemplate

file_node = FileOperationNode(
    settings=FileOperationNodeSettings(
        base_directory="$var{run_root}/global_data",  # Base directory for operations
        operations_template=ObjectTemplate(
            expression="$expr{$hier{code_generator}.outcome.structured.file_operations}"
        ),  # Hierarchical reference to previous node output
        stage=True,
        commit=True,
        commit_message="$var{run_id}: Auto generated.",  # Template variable for commit message
    ),
)
```

**Key Features**:

- Perform multiple file operations in a single node
- Dynamic operations through templates and hierarchical references
- Git integration for staging and committing changes
- Support for various operation types (create, edit, delete, move)

### FolderAnalyzerNode

The `FolderAnalyzerNode` analyzes directory structures and file contents to provide context for other nodes.

```python
from dhenara.agent.dsl import FolderAnalyzerNode, FolderAnalyzerSettings
from dhenara.agent.dsl.inbuilt.flow_nodes.defs.types import FolderAnalysisOperation
from dhenara.ai.types import ObjectTemplate

analyzer_node = FolderAnalyzerNode(
    pre_events=[EventType.node_input_required],  # Enable dynamic input handling
    settings=FolderAnalyzerSettings(
        base_directory="$var{run_root}/global_data",
        operations_template=ObjectTemplate(expression="$expr{task_spec.required_context}"),  # Component variable reference
        # Alternatively, explicit operations:
        # operations=[
        #     FolderAnalysisOperation(
        #         operation_type="analyze_folder",
        #         path="dhenara_docs/docs",
        #         content_read_mode="none",
        #     )
        # ]
    ),
)
```

**Key Features**:

- Analyze directory structures and file contents
- Filter files by patterns (include/exclude)
- Control recursion and content extraction
- Support for dynamic operations through templates or event-based input
- Generate structured representations of repositories

### CommandNode

The `CommandNode` executes shell commands and captures outputs.

```python
from dhenara.agent.dsl import CommandNode, CommandNodeSettings

command_node = CommandNode(
    settings=CommandNodeSettings(
        command=["git", "status"],
        working_directory="/path/to/project",
        timeout=30,
    ),
)
```

**Key Features**:

- Execute shell commands with arguments
- Control execution environment (working directory, environment variables)
- Set timeouts for command execution
- Capture command output and exit code

## Node Input and Output

Nodes use typed inputs and outputs to ensure type safety and clear interfaces:

### Node Input

Each node type has a specific input class derived from `NodeInput`:

```python
from dhenara.agent.dsl.base import NodeInput
from pydantic import Field

class AIModelNodeInput(NodeInput):
    prompt_variables: dict[str, Any] = Field(default_factory=dict)
    instruction_variables: dict[str, Any] = Field(default_factory=dict)
    settings_override: AIModelNodeSettings | None = None
    resources_override: list[ResourceConfigItem] | None = None
```

Inputs can be provided through several mechanisms:

1. **Event Handlers**: Respond to `node_input_required` events

```python
async def node_input_event_handler(event: NodeInputRequiredEvent):
    if event.node_type == FlowNodeTypeEnum.ai_model_call:
        if event.node_id == "code_generator":
            node_input = await get_ai_model_node_input(
                node_def_settings=event.node_def_settings,
            )
            task_description = await async_input("Enter your query: ")
            node_input.prompt_variables = {"task_description": task_description}

            event.input = node_input
            event.handled = True
```

2. **Hierarchical References**: Pass data from previous nodes using the template system

```python
Prompt.with_dad_text("$expr{$hier{previous_node}.outcome.text}")
```

3. **Component Variables**: Use flow-level variables

```python
Prompt.with_dad_text("$expr{task_spec.description}")
```

### Node Output

Node execution produces a `NodeOutput` containing the results, which is accessible via hierarchical references:

```python
# Access a node's outcome in a template
ObjectTemplate(expression="$expr{$hier{code_generator}.outcome.structured.file_operations}")
```

The standardized `NodeOutcome` format makes it easy to access results consistently across different node types:

```python
class NodeOutcome:
    text: str | None       # Text output
    structured: dict | None  # Structured data output
    files: list[File] | None  # File outputs
```

## Working with Events

Nodes can trigger and respond to events, enabling dynamic behavior:

```python
# Node that triggers input event
AIModelNode(
    pre_events=[EventType.node_input_required],  # Will trigger this event before execution
    settings=AIModelNodeSettings(...)
)

# Handler for the event
async def node_input_event_handler(event: NodeInputRequiredEvent):
    if event.node_id == "code_generator":
        # Provide dynamic input
        node_input = await get_ai_model_node_input(...)
        task_description = await async_input("Enter your query: ")
        node_input.prompt_variables = {"task_description": task_description}

        event.input = node_input
        event.handled = True  # Mark as handled

# Register the handler
run_context.register_event_handlers({
    EventType.node_input_required: node_input_event_handler
})
```

## Extending the Node System

You can create custom node types by extending `NodeDefinition` and implementing the required interfaces. See the
[Custom Components](./custom-components.md) section for details.

## Best Practices

1. **Keep Nodes Focused**: Each node should have a single responsibility
2. **Use Typed Inputs/Outputs**: Leverage Pydantic models for type safety
3. **Use Hierarchical References**: Reference previous node outputs using `$hier{}`
4. **Leverage Events**: Use events for dynamic configuration and interaction
5. **Use Component Variables**: For shared configuration in flows
6. **Document Node Behavior**: Clearly document what each node does and expects
7. **Handle Errors**: Implement proper error handling in node executors

By following these practices, you can create reusable, maintainable nodes that work consistently in different contexts.
