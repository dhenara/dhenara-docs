---
title: Nodes
---

# Nodes

## Overview

Nodes are the atomic execution units in Dhenara Agent DSL (DAD). Each node performs a specific function, such as making an AI model call, analyzing a folder, or performing file operations. Nodes form the fundamental building blocks of flows and agents, enabling complex behavior through composition.

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
from dhenara.ai.types import Prompt, ResourceConfigItem

ai_node = AIModelNode(
    resources=ResourceConfigItem.with_model("claude-3-5-sonnet"),
    settings=AIModelNodeSettings(
        system_instructions=["You are a helpful assistant."],
        prompt=Prompt.with_dad_text("Generate ideas for: $var{topic}"),
        model_call_config=AIModelCallConfig(
            max_output_tokens=8000,
            options={"temperature": 0.7}
        )
    ),
)
```

**Key Features**:
- Configure which AI models to use via `resources`
- Set system instructions and prompts
- Control model parameters like temperature and max tokens
- Request structured outputs using Pydantic models
- Use tools by providing tool definitions

### FileOperationNode

The `FileOperationNode` performs file system operations like creating, editing, deleting, and moving files.

```python
from dhenara.agent.dsl import FileOperationNode, FileOperationNodeSettings
from dhenara.ai.types import ObjectTemplate

file_node = FileOperationNode(
    settings=FileOperationNodeSettings(
        base_directory="/path/to/workspace",
        operations_template=ObjectTemplate(
            expression="$hier{code_generator}.outcome.structured.file_operations"
        ),
        stage=True,
        commit=True,
        commit_message="Update files based on analysis",
    ),
)
```

**Key Features**:
- Perform multiple file operations in a single node
- Dynamic operations through templates
- Git integration for staging and committing changes
- Support for various operation types (create, edit, delete, move)

### FolderAnalyzerNode

The `FolderAnalyzerNode` analyzes directory structures and file contents to provide context for other nodes.

```python
from dhenara.agent.dsl import FolderAnalyzerNode, FolderAnalyzerSettings
from dhenara.agent.dsl.inbuilt.flow_nodes.defs.types import FolderAnalysisOperation

analyzer_node = FolderAnalyzerNode(
    settings=FolderAnalyzerSettings(
        base_directory="/path/to/repo",
        operations=[
            FolderAnalysisOperation(
                operation_type="analyze_folder",
                path="src",
                include_patterns=["*.py"],
                exclude_patterns=["__pycache__"],
                include_content=True,
                recursive=True,
            )
        ],
    ),
)
```

**Key Features**:
- Analyze directory structures and file contents
- Filter files by patterns (include/exclude)
- Control recursion and content extraction
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
2. **Static Registration**: Register inputs in advance
3. **Direct Execution**: Provide inputs when executing a node directly

### Node Output

Node execution produces a `NodeOutput` containing the results:

```python
class AIModelNodeOutput(NodeOutput[AIModelNodeOutputData]):
    pass

class AIModelNodeOutcome(NodeOutcome):
    text: str | None
    structured: dict | None
    file: GenericFile | None
    files: list[GenericFile] | None
```

The standardized `NodeOutcome` format makes it easy to access results consistently across different node types.

## Extending the Node System

You can create custom node types by extending `NodeDefinition` and implementing the required interfaces:

```python
from dhenara.agent.dsl.base import NodeDefinition, NodeSettings
from pydantic import BaseModel, Field

class MyCustomNodeSettings(NodeSettings):
    param1: str
    param2: int = 42

class MyCustomNodeInput(NodeInput):
    input_data: str

class MyCustomNodeOutput(NodeOutput):
    result: str

class MyCustomNode(NodeDefinition):
    node_type = "custom"
    settings_class = MyCustomNodeSettings
    input_class = MyCustomNodeInput
    output_class = MyCustomNodeOutput
    
    # You'll need to register an executor for this node type
```

Custom nodes need an executor that implements the actual execution logic.

## Best Practices

1. **Keep Nodes Focused**: Each node should have a single responsibility
2. **Use Typed Inputs/Outputs**: Leverage Pydantic models for type safety
3. **Handle Events**: Use the event system for dynamic configuration
4. **Document Node Behavior**: Clearly document what each node does and expects
5. **Error Handling**: Implement proper error handling in node executors

By following these practices, you can create reusable, maintainable nodes that work consistently in different contexts.