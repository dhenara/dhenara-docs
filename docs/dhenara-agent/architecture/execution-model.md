---
title: Execution Model
---

# Execution Model

## Overview

The Dhenara Agent DSL (DAD) execution model defines how agent components are executed, how data flows between them, and how the execution environment is managed. This model provides a robust framework for reproducible, observable agent execution with clear state management and error handling.

## Execution Flow

The execution flow in DAD follows these general steps:

1. **Initialization**: A component (agent, flow, or node) is created with its definition
2. **Execution Context Setup**: An execution context is created to manage state
3. **Component Execution**:
   - For agents and flows: Execute child components in the appropriate order
   - For nodes: Perform the specific action defined by the node
4. **Result Storage**: Store execution results in the execution context
5. **Event Handling**: Trigger and handle events as needed throughout execution
6. **Template Processing**: Process templates, expressions, and references

## Key Components of the Execution Model

### Execution Context

The `ExecutionContext` is a crucial component that:

- Tracks the execution state (pending, running, completed, failed)
- Stores results from previously executed nodes
- Manages hierarchical variable scoping
- Provides access to resources (e.g., LLM models) and artifact storage
- Enables components to communicate with each other

```
ExecutionContext
 ├── Executable Type
 ├── Component Definition
 ├── Parent Context (optional)
 ├── Execution Results
 ├── Artifact Manager
 ├── Resource Configuration
 └── Event Bus
```

The execution context creates a hierarchical structure that mirrors the component hierarchy, allowing child components to access resources and results from their parent contexts.

### Run Context

The `RunContext` manages the overall execution environment:

- Defines the run directories and IDs
- Configures observability systems
- Manages resource registries
- Handles input sources and artifact storage
- Provides isolation between different runs

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

### Component Runners

Component runners orchestrate the execution of components:

- **FlowRunner**: Executes a flow definition
- **AgentRunner**: Executes an agent definition
- **NodeExecutors**: Execute specific node types

```python
from dhenara.agent.runner import FlowRunner

# Create a runner for the flow
runner = FlowRunner(my_flow, run_context)

# Execute the flow
await runner.run()
```

### Isolated Execution

DAD supports isolated execution to prevent interference between runs:

```python
from dhenara.agent.run import IsolatedExecution

async with IsolatedExecution(run_context) as execution:
    # Operations within this block run in an isolated environment
    result = await execution.run(runner)
```

## Data Flow and State Management

### Node Input and Output

Data flows between nodes through typed inputs and outputs:

- **NodeInput**: Defines the input requirements for a node
- **NodeOutput**: Contains the output data from a node
- **NodeOutcome**: Provides a standardized way to access node results

### Template Engine

The template engine facilitates data flow by enabling dynamic content generation:

- **Variable Substitution**: Replace `$var{name}` with variable values
- **Expression Evaluation**: Evaluate expressions with `$expr{...}`
- **Hierarchical References**: Access previous results with `$hier{node_id.property}`
- **Python Expressions**: Execute Python code with `$expr{py: ...}`

```python
prompt=Prompt.with_dad_text(
    "Based on the analysis: $hier{analyzer_node.outcome.text}\n"
    "Generate code in $var{language} that $var{task}"
)
```

### Event System

The event system enables components to communicate and request information:

- Events have a type (e.g., `node_input_required`) and payload
- Components can register handlers for specific event types
- Events can request inputs, notify of status changes, or signal completion

```python
# Register an event handler
async def handle_input_required(event):
    if event.node_id == "ai_processor":
        event.input = AIModelNodeInput(
            prompt_variables={"query": "user input"}
        )
        event.handled = True

# Register the handler with the run context
run_context.register_node_input_handler(handle_input_required)
```

## Error Handling and Recovery

DAD provides several mechanisms for error handling and recovery:

1. **Conditional Branching**: Route execution based on success or failure
2. **Error Events**: Emit events when errors occur to trigger handlers
3. **Run State Tracking**: Track the state of each component execution
4. **Continuation**: Support for continuing execution from a previous point

```python
# Handling errors with conditional branches
flow.connect("main_node", "success_node", on_success=True)
flow.connect("main_node", "error_handler", on_error=True)

# Continuing from a previous run
run_context = RunContext(
    root_component_id="my_agent",
    project_root=Path("."),
    previous_run_id="run_20231015_123456",  # ID of the previous run
    start_hierarchy_path="agent.flow1.node3"  # Continue from this node
)
```

## Observability

The execution model integrates deeply with the observability system:

- **Tracing**: Capture the execution path through components
- **Logging**: Log events and state changes during execution
- **Metrics**: Collect performance and behavioral metrics
- **Artifacts**: Store execution inputs, outputs, and intermediate results

This integration enables detailed analysis and debugging of agent execution.

## Execution Lifecycle

A complete execution lifecycle follows these steps:

1. **Definition**: Create component definitions (agents, flows, nodes)
2. **Context Creation**: Create run and execution contexts
3. **Runner Setup**: Create and configure component runners
4. **Execution**: Execute components through their runners
5. **Result Collection**: Collect and process execution results
6. **Artifact Management**: Store artifacts for analysis and future reference
7. **Run Completion**: Finalize the run and update status

This structured lifecycle ensures consistent, reproducible execution across different environments and use cases.