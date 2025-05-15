---
title: Input Handling
---

# Input Handling

## Overview

Input handling is a critical component of the Dhenara Agent DSL (DAD) framework, enabling interactive configuration and
dynamic behavior of agents. This document describes the architecture of the input handling system, its components, and
patterns for effective implementation.

## Event-Driven Input Architecture

DAD uses an event-driven architecture for input handling, where nodes emit events when they require input, and
registered handlers respond with appropriate configurations:

```python
# Node declares that it requires input
ai_node = AIModelNode(
    pre_events=[EventType.node_input_required],  # This event is emitted before execution
    resources=ResourceConfigItem.with_models("claude-3-7-sonnet"),
    settings=AIModelNodeSettings(...),
)

# Handler provides input when requested
async def input_handler(event: NodeInputRequiredEvent):
    if event.node_id == "my_node" and event.node_type == FlowNodeTypeEnum.ai_model_call:
        # Collect user input
        user_query = await async_input("Enter your query: ")
        event.input = AIModelNodeInput(prompt_variables={"query": user_query})
        event.handled = True  # Mark the event as handled

# Register the handler with the event bus
run_context.register_node_input_handler(input_handler)
```

This architecture provides several benefits:

1. **Separation of Concerns**: Node definitions remain clean and focused on behavior, while input handling is separate
2. **Dynamic Configuration**: Nodes can be dynamically configured at runtime
3. **Interactive Experience**: Enables rich interactive experiences with user input
4. **Reusable Components**: Input handlers can be reused across different agents

## Core Components

### NodeInputRequiredEvent

The `NodeInputRequiredEvent` is the central class for input requests:

```python
class NodeInputRequiredEvent(BaseEvent):
    event_type: str = EventType.node_input_required
    node_id: str  # ID of the node requesting input
    node_type: str  # Type of the node (ai_model_call, folder_analyzer, etc.)
    execution_context: ExecutionContext  # Context of the execution
    input: NodeInput | None = None  # Input to be provided by handler
    handled: bool = False  # Whether the event has been handled
```

When a node with `pre_events=[EventType.node_input_required]` is about to execute, it emits this event. Handlers then
fill in the `input` field and mark it as `handled`.

### Node-Specific Input Classes

Each node type has its own input class that defines the configuration structure:

```python
class AIModelNodeInput(NodeInput):
    prompt_variables: dict[str, Any] = Field(default_factory=dict)
    instruction_variables: dict[str, Any] = Field(default_factory=dict)
    resources_override: list[ResourceConfigItem] | None = None
    settings_override: AIModelNodeSettings | None = None

class FolderAnalyzerNodeInput(NodeInput):
    operations: list[FolderAnalysisOperation] | None = None
    settings_override: FolderAnalyzerSettings | None = None
```

These classes provide type safety and clear structure for node configuration.

## Input Handling in the Single-Shot Coder Tutorial

The single-shot coder tutorial demonstrates practical input handling patterns. In the tutorial, a basic event handler is
implemented:

```python
async def node_input_event_handler(event: NodeInputRequiredEvent):
    node_input = None

    if event.node_type == FlowNodeTypeEnum.ai_model_call:
        if event.node_id == "code_generator":
            # Get model input using the built-in helper
            node_input = await get_ai_model_node_input(
                node_def_settings=event.node_def_settings,
            )
            # Get user task description
            task_description = await async_input("Enter your query: ")
            # Pass it as a prompt variable
            node_input.prompt_variables = {"task_description": task_description}

        event.input = node_input
        event.handled = True

    elif event.node_type == FlowNodeTypeEnum.folder_analyzer:
        if event.node_id == "dynamic_repo_analysis":
            # Use built-in helper for folder analyzer input
            node_input = await get_folder_analyzer_node_input(
                node_def_settings=event.node_def_settings,
                base_directory=global_data_directory,
                predefined_exclusion_patterns=[],
            )

        event.input = node_input
        event.handled = True
```

This handler is registered in the run context:

```python
run_context.register_event_handlers(
    handlers_map={
        EventType.node_input_required: node_input_event_handler,
        # Optional Notification events
        EventType.node_execution_completed: print_node_completion,
        EventType.component_execution_completed: print_component_completion,
    }
)
```

## Built-in Input Helpers

DAD provides several helper functions that simplify collecting user input:

### async_input

A simple utility for asynchronous console input:

```python
async def async_input(prompt: str) -> str:
    # Use event loop to run input in a thread pool
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, lambda: input(prompt))
```

### get_ai_model_node_input

Provides an interactive interface for configuring AI model nodes:

```python
async def get_ai_model_node_input(
    node_def_settings: AIModelNodeSettings,
    models: list[str] = None,
) -> AIModelNodeInput:
    # If models list is provided, show selection menu
    # Otherwise use models from node definition
    if models is None and node_def_settings is not None:
        models = node_def_settings.models

    if models and len(models) > 1:
        print("\n=== AI Model Selection ===")
        model_idx = await get_menu_choice(models, "Select an AI model:")
        print(f"Using model: {models[model_idx]}")

        return AIModelNodeInput(
            resources_override=[ResourceConfigItem.with_model(models[model_idx])]
        )
    return AIModelNodeInput()
```

### get_folder_analyzer_node_input

Provides an interactive interface for configuring folder analyzer nodes:

```python
async def get_folder_analyzer_node_input(
    node_def_settings: FolderAnalyzerSettings = None,
    base_directory: str = None,
    predefined_exclusion_patterns: list[list[str]] = None,
) -> FolderAnalyzerNodeInput:
    # Interactive menu to configure folder analysis operations
    print("\n=== Repository Analysis Configuration ===")

    operations = []
    while True:
        operation = await get_operation_input(base_directory, predefined_exclusion_patterns)
        operations.append(operation)
        if not await get_yes_no_input("Add another analysis operation?", False):
            break

    print("\nConfigured operations:")
    for i, op in enumerate(operations, 1):
        print(f"{i}. {op.operation_type} - {op.path}")

    return FolderAnalyzerNodeInput(
        settings_override=FolderAnalyzerSettings(
            base_directory=base_directory,
            operations=operations,
        )
    )
```

## Common Input Patterns

### Interactive Console Input

The simplest pattern is to collect input directly from the console:

```python
async def ai_model_node_input_handler(event: NodeInputRequiredEvent):
    if event.node_type == FlowNodeTypeEnum.ai_model_call:
        if event.node_id == "ai_model_call_1":
            user_query = await async_input("Enter your query: ")
            event.input = AIModelNodeInput(prompt_variables={"user_query": user_query})
            event.handled = True
```

### Menu-Based Selection

For selecting from multiple options, a menu-based approach is effective:

```python
async def get_menu_choice(options: list[str], prompt: str = "Select an option:") -> int:
    print(f"\n{prompt}")
    for i, option in enumerate(options):
        print(f"  {i+1}. {option}")

    while True:
        try:
            choice = await async_input("Enter number: ")
            idx = int(choice) - 1
            if 0 <= idx < len(options):
                return idx
            print(f"Please enter a number between 1 and {len(options)}")
        except ValueError:
            print("Please enter a valid number")
```

### Combining with Template Variables

Input handlers can provide values for template variables:

```python
async def node_input_event_handler(event: NodeInputRequiredEvent):
    if event.node_id == "code_generator":
        node_input = await get_ai_model_node_input(event.node_def_settings)
        task_description = await async_input("Enter your query: ")

        # These variables will be substituted in templates using $var{task_description}
        node_input.prompt_variables = {"task_description": task_description}

        event.input = node_input
        event.handled = True
```

And in the node definition:

```python
prompt=Prompt.with_dad_text(
    text=(
        "## Task Description\n"
        "$var{task_description}\n"
        # ... more content ...
    ),
)
```

### Leveraging Component Variables

In Part 3 of the tutorial, component variables are used to reduce the need for interactive inputs:

```python
# Load task specification from files
def read_task_spec_json():
    with open("src/common/live_prompts/autocoder/task_spec.json") as file:
        spec_dict = json.load(file)
        spec = TaskSpecWithFolderAnalysisOps(**spec_dict)
        return spec

task_spec = read_task_spec_json()

# Add as component variable
implementation_flow.vars(
    {
        "task_spec": task_spec,
    }
)
```

This makes the task specification available to all nodes in the flow without requiring user input.

### Static Input Registration

For non-interactive scenarios, static inputs can be registered in advance:

```python
# Register static input for a specific node
run_context.register_node_static_input(
    "code_generator",
    AIModelNodeInput(prompt_variables={"task_description": "Implement feature X"})
)

# Or load from a JSON file
run_context.read_static_inputs()  # Reads from static_inputs.json
```

This is useful for batch processing or testing.

## Advanced Input Handling Techniques

### Combined Handler

For agents with multiple nodes, a combined handler can manage all inputs:

```python
async def agent_input_handler(event: NodeInputRequiredEvent):
    # Handle based on node type and ID
    if event.node_type == FlowNodeTypeEnum.ai_model_call:
        await handle_ai_model_input(event)
    elif event.node_type == FlowNodeTypeEnum.folder_analyzer:
        await handle_folder_analyzer_input(event)
    elif event.node_type == FlowNodeTypeEnum.file_operation:
        await handle_file_operation_input(event)
```

### Context-Aware Input

Handlers can use the execution context to make decisions:

```python
async def context_aware_handler(event: NodeInputRequiredEvent):
    # Access results from previous nodes
    if event.node_id == "second_node":
        first_result = event.execution_context.get_result("first_node")
        if first_result and first_result.outcome:
            # Use previous results to inform this input
            event.input = AIModelNodeInput(
                prompt_variables={"previous_output": first_result.outcome.text}
            )
            event.handled = True
```

## Best Practices

1. **Type Safety**: Use appropriate input classes for each node type
2. **Clear Prompts**: Provide clear instructions for user input
3. **Validation**: Validate user input before creating node inputs
4. **Error Handling**: Handle input errors gracefully with appropriate feedback
5. **Timeout Handling**: Implement timeouts for user input to prevent indefinite waiting
6. **Modular Design**: Organize input handlers in a modular way for reusability
7. **Leverage Built-in Helpers**: Use DAD's built-in input helper functions
8. **Component Variables**: Use component variables to reduce repetitive inputs

## Conclusion

The input handling architecture in DAD provides a flexible, powerful system for configuring and interacting with agent
nodes. By leveraging the event-driven architecture, built-in helper functions, and component variables, you can create
rich interactive experiences while maintaining clean separation between node definition and input collection.
