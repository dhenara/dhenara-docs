---
sidebar_position: 3
---

# Core Concepts

This guide explains the fundamental concepts and building blocks of Dhenara Agent DSL (DAD). Understanding these concepts will help you design and build effective agent systems.

## Component Hierarchy

DAD uses a hierarchical component model with three main types of components:

```
Agent
 ├── Flow 1
 │    ├── Node A
 │    ├── Node B
 │    └── Subflow
 │         ├── Node C
 │         └── Node D
 ├── Flow 2
 │    ├── Node E
 │    └── Node F
 └── Subagent
      └── Flow 3
           ├── Node G
           └── Node H
```

### Nodes

Nodes are the atomic units of execution in DAD. Each node performs a specific task such as:
- Making an LLM API call
- Analyzing files or folders
- Performing file operations
- Executing shell commands

Nodes are the leaf components in the hierarchy and do the actual work in an agent system.

### Flows

Flows are collections of nodes that define execution logic. They determine how data moves between nodes and in what order nodes are executed. Flows can include:

- Sequential execution of nodes
- Conditional branches based on results
- Loops for iterative processing
- Nested subflows for modular design

### Agents

Agents are top-level components that can contain multiple flows and other agents (subagents). They represent complete functional units and orchestrate the overall behavior of the system.

## Execution Model

Execution in DAD follows a clear separation between definition (what to do) and execution (how to do it):

1. **Definition Classes**: `NodeDefinition`, `FlowDefinition`, `AgentDefinition`
2. **Executable Classes**: `ExecutableNode`, `Flow`, `Agent`
3. **Executor Classes**: `NodeExecutor`, `FlowExecutor`, `AgentExecutor`

This separation allows for flexible composition and customization while maintaining consistent execution behavior.

## Execution Context

The execution context is a crucial concept in DAD. It:

- Tracks the execution state (pending, running, completed, failed)
- Stores results from executed nodes
- Manages hierarchical variable scoping
- Provides access to resources (e.g., LLM models)
- Enables communication between components through events

The execution context creates a hierarchical structure that mirrors the component hierarchy, allowing child components to access resources and results from their parent contexts.

## Event System

The event system provides a publish-subscribe mechanism for communication between components:

- **Events**: Typed messages with a specific purpose (e.g., `node_input_required`)
- **Event Handlers**: Functions that respond to specific event types
- **Event Bus**: Central hub for routing events to handlers

Common event types include:
- `node_input_required`: Request input for a node
- `node_execution_completed`: Notify when a node finishes execution
- `node_execution_failed`: Notify when a node encounters an error

## Template Engine

The template engine is a powerful feature of DAD that allows for dynamic text generation and processing:

- **Variable Substitution**: Replace `$var{name}` with the value of a variable
- **Expression Evaluation**: Evaluate expressions like `$expr{1 + 2}`
- **Hierarchical References**: Access results from other nodes using `$hier{node_id.property}`
- **Python Expressions**: Evaluate Python code with `$expr{py: len(items)}`

The template engine makes it easy to build dynamic prompts, process responses, and coordinate between components.

## Run System

The run system manages the execution environment for DAD components:

- **RunContext**: Manages run directories, artifacts, and settings
- **IsolatedExecution**: Provides isolation between runs
- **Run Lifecycle**: Initialize, setup, execute, manage artifacts, and complete

The run system ensures reproducibility and proper resource management across different runs.

## Observability

Observability is a core feature of DAD that provides visibility into execution:

- **Tracing**: Track the execution path of components and nodes
- **Logging**: Capture structured logs with context
- **Metrics**: Collect numerical data about execution
- **Dashboards**: Visualize traces and metrics for analysis

Observability helps debug issues, optimize performance, and understand complex agent behaviors.

## Resource Management

DAD provides a flexible system for managing AI model resources and API credentials:

- **ResourceConfig**: Configure models, endpoints, and credentials
- **ResourceRegistry**: Register and override resources
- **Thread-Local Resources**: Isolate resources between threads

Resource management makes it easier to work with different LLM providers and models while maintaining security and configurability.

## Example: Component Relationships

Here's how these concepts work together in a simple DAD agent:

```python
# Define a flow with nodes
my_flow = FlowDefinition()
my_flow.node("analyzer", FolderAnalyzerNode(...))
my_flow.node("processor", AIModelNode(...))

# Define an agent with flows
my_agent = AgentDefinition()
my_agent.flow("main_flow", my_flow)

# Create run context for execution
run_context = RunContext(
    root_component_id="my_agent",
    project_root=Path("."),
)

# Run the agent
runner = AgentRunner(my_agent, run_context)
runner.setup_run()
result = await runner.run()
```

In this example:
1. The flow contains two nodes that execute in sequence
2. The agent contains the flow and potentially other flows
3. The run context provides the execution environment
4. The runner handles the execution process

## Next Steps

Now that you understand the core concepts of DAD, you can:

- Explore the [Architecture](../architecture/overview) in more detail
- Learn about specific [Node Types](../components/nodes) and their capabilities
- Understand how to use [Flows](../components/flows) and [Agents](../components/agents)
- Dive deeper into the [Templating System](../features/templating-system) and [Event System](../advanced-guides/event-system)
