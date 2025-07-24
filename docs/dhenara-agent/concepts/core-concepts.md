---
sidebar_position: 3
---

# Core Concepts

This guide explains the fundamental concepts and building blocks of Dhenara Agent DSL (DAD). Understanding these
concepts will help you design and build effective agent systems.

## Domain Specific Language (DSL)

A [Domain Specific Language](https://en.wikipedia.org/wiki/Domain-specific_language) is a specialized language designed
for a particular domain. DAD is a DSL for AI Agent creation. Though we call it a DSL, it is not a separate programming
language, but rather Python with specialized patterns and structures. We call it a DSL because DAD is an attempt to make
agent definitions look like a program, as shown below:

```python
implementation_flow = (
    FlowDefinition()
    .node(
        "dynamic_repo_analysis",
        FolderAnalyzerNode(settings=FolderAnalyzerSettings(base_directory=global_data_directory)),
    )
    .node(
        "code_generator",
        AIModelNode(
            pre_events=[EventType.node_input_required],
            settings=AIModelNodeSettings(
                models=models,
                system_instructions=["You are a professional code implementation agent."],
                prompt=Prompt.with_dad_text(text=("Description: $expr{task_description}\n\n")),
                model_call_config=AIModelCallConfig(
                    structured_output=TaskImplementation,
                ),
            ),
        ),
    )
    .for_each(
        id="implementation_loop",
        statement="$expr{ $hier{code_generator}.outcome.structured.implementation_tasks }",
        item_var="task_spec",
        index_var="task_index",
        start_index=0,
        max_iterations=20,
        body=FlowDefinition().node(
            "code_generator_file_ops",
            FileOperationNode(
                settings=FileOperationNodeSettings(
                    base_directory=global_data_directory,
                    operations_template="$expr{ $hier{code_generator}.outcome.structured.file_operations }",
                ),
                stage=True,
                commit=False,
            ),
        ),
    )
)
```

## Basic Elements

A DAD agent definition consists of three primary types of elements:

- **Execution Flow Node** (or simply Node): The atomic unit of execution
- **Execution Flow** (or simply Flow): A collection of nodes with execution logic
- **Agent**: Created using `AgentDefinition`, which organizes and coordinates multiple flows

These elements form a hierarchical structure, with Agents at the top, containing Flows, which in turn contain Nodes.

### Node Types

The framework provides several built-in node types:

- **AIModelNode**: Performs an AI Model API call
- **FileOperationNode**: Performs file operations like create_file, edit_file, delete_file, etc.
- **FolderAnalyzerNode**: Reads a folder or file with fine-grained controls
- **CommandNode**: Executes a shell command

These are the core built-in nodes in the framework, with support for additional node types including
[MCP](https://modelcontextprotocol.io) (Model Context Protocol) being developed.

You can also create your custom nodes by creating a NodeDefinition along with its settings and executor.

### Flow Structure

A Flow is created using a `FlowDefinition`, to which you can add the following elements:

- Nodes
- Conditional Blocks (for branching logic)
- ForEach Blocks (for iteration)
- Other subflows (for modular design)

### Agent Structure

An Agent is created using an `AgentDefinition`, to which you can add the following elements:

- Flows (top-level execution units)
- Conditional Blocks (for high-level branching)
- ForEach Blocks (for iterative processing)
- Other subagents (for complex, hierarchical designs)

### Element Identifiers

When you add an element to a Flow/Agent definition, you need to provide an `id` string that uniquely identifies that
element within its parent. For example, in the code above, "dynamic_repo_analysis", "code_generator",
"implementation_loop", and "code_generator_file_ops" are ids.

These ids are crucial because they allow you to reference the output of one element's execution in another element using
the `$hier{}` template syntax, like:

```python
statement="$expr{ $hier{code_generator}.outcome.structured.implementation_tasks }",
```

## Component Variables

Component variables are variables defined at the component level (Flow or Agent) that are accessible to all elements
within that component. They provide a way to share configuration or state within a component hierarchy.

To define component variables in a flow:

```python
implementation_flow = FlowDefinition()
implementation_flow.vars(
    {
        "task_spec": task_spec,
        "global_data_directory": "$var{run_root}/global_data",
    }
)
```

Component variables can be accessed in templates using the `$expr{}` syntax:

```python
operations_template=ObjectTemplate(expression="$expr{task_spec.required_context}")
```

Component variables provide several benefits:

1. **Shared Configuration**: Multiple nodes can access the same data without duplication
2. **Flow Reusability**: The same flow can be used with different variable values
3. **Cleaner Organization**: Separation of configuration from flow logic

## Element Execution

### Nodes

Nodes are the atomic units of execution in DAD. Each node performs a specific task such as:

- Making an LLM API call
- Analyzing files or folders
- Performing file operations
- Executing shell commands

Nodes are the leaf components in the hierarchy and do the actual work in an agent system.

### Flows

Flows are collections of nodes that define execution logic. They determine how data moves between nodes and in what
order nodes are executed. Flows can include:

- Sequential execution of nodes
- Conditional branches based on results
- Loops for iterative processing
- Nested subflows for modular design

### Agents

Agents are top-level components that can contain multiple flows and other agents (subagents). They represent complete
functional units and orchestrate the overall behavior of the system.

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

The execution context creates a hierarchical structure that mirrors the component hierarchy, allowing child components
to access resources and results from their parent contexts.

## Event System

The event system provides a publish-subscribe mechanism for communication between components:

- **Events**: Typed messages with a specific purpose (e.g., `node_input_required`)
- **Event Handlers**: Functions that respond to specific event types
- **Event Bus**: Central hub for routing events to handlers

### Common Event Types

Common event types include:

- `node_input_required`: Request input for a node
- `node_execution_completed`: Notify when a node finishes execution
- `node_execution_failed`: Notify when a node encounters an error

### Event Handling Example

To make a node trigger an input event, add it to the pre_events list:

```python
AIModelNode(
    pre_events=[EventType.node_input_required],
    settings=AIModelNodeSettings(...)
)
```

Then create a handler to respond to this event:

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

Register the handler in the run context:

```python
run_context.register_event_handlers(
    handlers_map={
        EventType.node_input_required: node_input_event_handler,
        EventType.node_execution_completed: print_node_completion,
    }
)
```

## Template Engine

The template engine is a powerful feature of DAD that allows for dynamic text generation and processing:

### Variable Substitution

Replace `$var{name}` with the value of a variable:

```python
"$var{task_description}"
```

### Expression Evaluation

Evaluate expressions using `$expr{...}`:

```python
"$expr{1 + 2}"
"$expr{task_spec.task_id}"
```

### Hierarchical References

Access results from other nodes using `$hier{node_id.property}`:

```python
"$expr{ $hier{code_generator}.outcome.structured.file_operations }"
```

### Python Expressions

Evaluate Python code with `$expr{py: ...}`:

```python
"$expr{py: len(items)}"
```

### Object Template

For complex expressions or when using templates in object properties:

```python
operations_template=ObjectTemplate(
    expression="$expr{ $hier{code_generator}.outcome.structured.file_operations }",
)
```

The template engine makes it easy to build dynamic prompts, process responses, and coordinate between components.

## Run System

The run system manages the execution environment for DAD components:

- **RunContext**: Manages run directories, artifacts, and settings
- **IsolatedExecution**: Provides isolation between runs
- **Run Lifecycle**: Initialize, setup, execute, manage artifacts, and complete

### Run Artifacts

Each run creates a unique directory structure for artifacts:

```
runs/run_20250514_233729_f3cd51/
├── .trace/
│   ├── dad_metadata.json
│   ├── logs.jsonl
│   ├── metrics.jsonl
│   └── trace.jsonl
├── root_component_id/
│   └── flow_id/
│       ├── node_id_1/
│       │   ├── outcome.json
│       │   ├── result.json
│       │   └── state.json (for AIModelNode)
│       └── node_id_2/
│           ├── outcome.json
│           └── result.json
└── static_inputs/
```

Each node's artifacts include:

- **result.json**: Complete execution result including input, output, and outcome
- **outcome.json**: Just the outcome field extracted for convenience
- **state.json**: (For AIModelNode) The API call parameters including the final prompt

The run system ensures reproducibility and proper resource management across different runs.

## Observability

Observability is a core feature of DAD that provides visibility into execution:

- **Tracing**: Track the execution path of components and nodes
- **Logging**: Capture structured logs with context
- **Metrics**: Collect numerical data about execution
- **Dashboards**: Visualize traces and metrics for analysis

Observability helps debug issues, optimize performance, and understand complex agent behaviors.

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

## Practical Example: Single-Shot Coder

Here's a practical example of a simple coding assistant that demonstrates many of the concepts discussed:

```python
# Create a FlowDefinition
implementation_flow = FlowDefinition()

# Add component variables
implementation_flow.vars(
    {
        "task_spec": task_spec,
    }
)

# 1. Dynamic Folder Analysis
implementation_flow.node(
    "dynamic_repo_analysis",
    FolderAnalyzerNode(
        pre_events=[EventType.node_input_required],
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
            models=["claude-3-7-sonnet", "o4-mini"],
            system_instructions=["You are a professional code implementation agent."],
            prompt=Prompt.with_dad_text(
                text=(
                    "Task ID: $expr{task_spec.task_id}\n"
                    "Description: $expr{task_spec.description}\n\n"
                    "## Repository Context\n"
                    "$expr{$hier{dynamic_repo_analysis}.outcome.results}\n\n"
                ),
            ),
            model_call_config=AIModelCallConfig(
                structured_output=TaskImplementation,
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
        ),
    ),
)

# Create and register an agent
agent = AgentDefinition()
agent.flow("main_flow", implementation_flow)
```

This example demonstrates:

- Component variables for task specifications
- Event system for handling inputs
- Template engine for dynamic prompts and data passing
- Hierarchical structure of agents, flows, and nodes
- Different node types working together

## Next Steps

Now that you understand the core concepts of DAD, you can:

- Explore the [Architecture](../architecture/overview) in more detail
- Learn about specific [Node Types](../concepts/components/nodes) and their capabilities
- Understand how to use [Flows](../concepts/components/flows) and [Agents](../concepts/components/agents)
- Dive deeper into the [Templating System](../concepts/templating-system) and [Event System](../concepts/event-system)
