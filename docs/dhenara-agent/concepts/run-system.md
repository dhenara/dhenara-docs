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

### RunEnvParams

The `RunEnvParams` class encapsulates the essential parameters for a run:

```python
from dhenara.agent.types.data import RunEnvParams

env_params = RunEnvParams(
    run_id="run_20231015_123456",
    run_dir="/path/to/project/runs/run_20231015_123456",
    run_root="/path/to/project/runs",
    trace_dir="/path/to/project/runs/run_20231015_123456/.trace",
    outcome_repo_dir="/path/to/project/runs/outcome/project_name",
)
```

### IsolatedExecution

The `IsolatedExecution` class provides a context manager for isolated execution environments:

```python
from dhenara.agent.run import IsolatedExecution

async with IsolatedExecution(run_context) as execution:
    # Operations within this block run in an isolated environment
    result = await execution.run(runner)
```

This ensures that each run has its own isolated environment, preventing interference between runs.

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
│  │  ├─ node1/            # Node-specific directories
│  │  ├─ node2/
│  │  └─ ...
│  ├─ outcome/             # Outcome repository
│  │  └─ project_name/     # Git repository for outcomes
```

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

## Integration with Runners

Runners are responsible for actually executing components using the run context:

```python
from dhenara.agent.runner import FlowRunner

# Create a runner for a flow
runner = FlowRunner(my_flow, run_context)

# Setup the runner
runner.setup_run()

# Execute the flow
result = await runner.run()
```

Different types of runners (FlowRunner, AgentRunner) handle the execution of different component types.

## Best Practices

1. **Organized Run Directories**: Keep clean run directories by properly managing artifacts
2. **Error Handling**: Implement proper error handling and always call `complete_run()`
3. **Resource Cleanup**: Ensure resources are properly cleaned up after execution
4. **Run ID Prefixes**: Use meaningful run ID prefixes for easier identification
5. **Environment Configuration**: Configure runs appropriately for different environments (dev, staging, prod)

## Conclusion

The Run System in DAD provides a robust infrastructure for managing the execution of agent components. By leveraging the
run system effectively, you can ensure isolation, reproducibility, and observability in your agent workflows.
