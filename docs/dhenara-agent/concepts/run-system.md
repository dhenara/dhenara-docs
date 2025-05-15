---
title: Run System
---

# Run System

## Overview

The Run System in Dhenara Agent DSL (DAD) is responsible for managing execution contexts, environment setup, and
artifact handling. It provides a structured approach to executing DAD components while maintaining isolation,
reproducibility, and observability.

## Core Run System Components

### RunContext

The `RunContext` is the central component of the run system. It manages the execution environment, including:

- Run directories and IDs
- Input and output artifacts
- Observability configuration
- Resource management
- Event handling
- Execution hierarchies

```python
from dhenara.agent.run import RunContext
from pathlib import Path

# Create a run context
run_context = RunContext(
    root_component_id="my_agent",  # ID of the root component being executed
    project_root=Path("/path/to/project"),  # Project root directory
    run_root=Path("/path/to/project/runs"),  # Where run artifacts are stored
    observability_settings=my_observability_settings,  # Optional custom settings
)

# Setup the run (creates directories, initializes observability, etc.)
run_context.setup_run(run_id_prefix="test")
```

## Setting up the Run Context

A typical pattern for setting up the Run Context in an agent runner:

```python
# Select the agent to run, and import its definitions
from src.agents.autocoder.agent import agent
from src.agents.autocoder.handler import node_input_event_handler
from src.runners.defs import project_root

# Assign a root ID to the agent
root_component_id = "autocoder_root"
agent.root_id = root_component_id

# Create run context
run_context = RunContext(
    root_component_id=root_component_id,
    project_root=project_root,
    observability_settings=None,  # pass observability_settings to enable tracing
    run_root_subpath=None,  # "agent_autocoder" Useful when you have multiple agents in the same project
)

# Register event handlers
run_context.register_event_handlers(
    handlers_map={
        EventType.node_input_required: node_input_event_handler,
        # Optional notification events
        EventType.node_execution_completed: print_node_completion,
        EventType.component_execution_completed: print_component_completion,
    }
)

# Create a runner
runner = AgentRunner(agent, run_context)
```

## Run Directory Structure

A typical run directory structure looks like this:

```
project_root/
├─ runs/
│  ├─ run_20231015_123456/  # Individual run directory
│  │  ├─ .trace/           # Observability data
│  │  │  ├─ trace.jsonl
│  │  │  ├─ metrics.jsonl
│  │  │  ├─ logs.jsonl
│  │  │  └─ dad_metadata.json
│  │  ├─ static_inputs/    # Input data
│  │  ├─ autocoder_root/   # Root component artifacts
│  │  │  └─ main_flow/     # Flow artifacts
│  │  │     ├─ dynamic_repo_analysis/  # Node artifacts
│  │  │     │  ├─ outcome.json
│  │  │     │  └─ result.json
│  │  │     ├─ code_generator/
│  │  │     │  ├─ outcome.json
│  │  │     │  ├─ result.json
│  │  │     │  └─ state.json  # AI model state
│  │  │     └─ code_generator_file_ops/
│  │  │        ├─ outcome.json
│  │  │        └─ result.json
│  ├─ global_data/        # Global data directory for context
│  │  └─ your_project/    # Cloned or copied project for context
```

The run directory structure mirrors the component hierarchy of your agent, with each component having its own directory
for artifacts.

## Artifact Files

Each node execution produces several artifact files:

- **result.json**: The complete result of the node execution, including input, output, and outcome.
- **outcome.json**: A convenience file that extracts just the outcome field from the result.
- **state.json**: (For AIModelNode) Contains the actual LLM API call parameters and final prompt.

These artifacts are used for debugging, reproducibility, and enabling re-runs from specific points.

## Run Lifecycle

1. **Initialization**: Create a `RunContext` with appropriate parameters
2. **Setup**: Call `setup_run()` to create directories and initialize systems
3. **Execution**: Runner uses the context to execute components
4. **Artifact Management**: Results and intermediate data stored in run directory
5. **Completion**: Call `complete_run()` to finalize and record completion status

```python
try:
    # Initialize and setup
    run_context = RunContext(root_component_id="my_agent", project_root=Path("."))
    run_context.setup_run()

    # Execute
    runner = AgentRunner(my_agent, run_context)
    result = await runner.run()

    # Complete successfully
    run_context.complete_run(status="completed")

    return result
except Exception as e:
    # Handle failure
    run_context.complete_run(status="failed", error_msg=str(e))
    raise
```

## Re-runs and Continuations

DAD supports re-running previous executions or continuing from specific points:

```python
# Create a run context for a re-run
run_context = RunContext(
    root_component_id="my_agent",
    project_root=Path("."),
    previous_run_id="run_20231015_123456",  # ID of the previous run
    start_hierarchy_path="agent.flow1.node3"  # Continue from this node
)

# Setup the run with re-run parameters
run_context.setup_run()
```

You can also use the command line to perform a re-run:

```bash
dhenara run agent autocoder --previous-run-id run_20231015_123456 --entry-point autocoder_root.main_flow.code_generator
```

This enables debugging, experimentation, and incremental development of agent workflows.

## Static Inputs

DAD supports providing static inputs to nodes:

```python
# Register static input for a specific node
run_context.register_node_static_input(
    "my_node_id",
    MyNodeInput(param1="value1", param2="value2")
)

# Or load static inputs from JSON
run_context.read_static_inputs()  # Reads from static_inputs.json
```

## Integration with Event System

The Run Context integrates with the event system to handle events during execution:

```python
# Register event handlers
run_context.register_event_handlers(
    handlers_map={
        EventType.node_input_required: node_input_event_handler,
        EventType.node_execution_completed: print_node_completion,
    }
)

# Define a handler for node input events
async def node_input_event_handler(event: NodeInputRequiredEvent):
    if event.node_type == FlowNodeTypeEnum.ai_model_call:
        node_input = await get_ai_model_node_input(
            node_def_settings=event.node_def_settings,
        )
        # Get dynamic input from user
        task_description = await async_input("Enter your query: ")
        node_input.prompt_variables = {"task_description": task_description}

        event.input = node_input
        event.handled = True
```

This integration allows for dynamic, interactive agent behaviors.

## Integration with Runners

Runners are responsible for actually executing components using the run context:

```python
from dhenara.agent.runner import FlowRunner, AgentRunner

# Create an agent runner
runner = AgentRunner(my_agent, run_context)

# Execute the agent
result = await runner.run()

# Or create a flow runner for a specific flow
flow_runner = FlowRunner(my_flow, run_context)
flow_result = await flow_runner.run()
```

Different types of runners (FlowRunner, AgentRunner) handle the execution of different component types.

## Global Data Directory

A common pattern is to use a global data directory for providing context to LLMs:

```python
# Define the global data directory in your flow
global_data_directory = "$var{run_root}/global_data"

# Use it in a FolderAnalyzerNode
implementation_flow.node(
    "dynamic_repo_analysis",
    FolderAnalyzerNode(
        settings=FolderAnalyzerSettings(
            base_directory=global_data_directory,
            operations=[...],
        ),
    ),
)

# Use it in a FileOperationNode
implementation_flow.node(
    "code_generator_file_ops",
    FileOperationNode(
        settings=FileOperationNodeSettings(
            base_directory=global_data_directory,
            operations_template=ObjectTemplate(
                expression="$expr{$hier{code_generator}.outcome.structured.file_operations}",
            ),
            stage=True,
        ),
    ),
)
```

This pattern allows you to analyze and modify files in a consistent location across runs.

## Best Practices

1. **Organized Run Directories**: Keep clean run directories by properly managing artifacts
2. **Error Handling**: Implement proper error handling and always call `complete_run()`
3. **Resource Cleanup**: Ensure resources are properly cleaned up after execution
4. **Run ID Prefixes**: Use meaningful run ID prefixes for easier identification
5. **Environment Configuration**: Configure runs appropriately for different environments (dev, staging, prod)
6. **Artifact Analysis**: Regularly review run artifacts to debug and improve your flows
7. **Leverage Re-runs**: Use the re-run capability for iterative development and debugging

## Conclusion

The Run System in DAD provides a robust infrastructure for managing the execution of agent components. By leveraging the
run system effectively, you can ensure isolation, reproducibility, and observability in your agent workflows. The
integrated event handling and artifact management capabilities make it particularly well-suited for developing complex,
interactive agent workflows.
