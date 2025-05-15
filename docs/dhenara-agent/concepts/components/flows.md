---
title: Flows
---

# Flows

## Overview

Flows in Dhenara Agent DSL (DAD) are intermediate components that organize nodes into connected processing pipelines.
They define the execution logic, including sequential processing, conditionals, and loops. Flows serve as the primary
way to orchestrate the execution of nodes to achieve specific goals.

## Core Concepts

Flows in DAD are built around these key concepts:

- **Nodes as Building Blocks**: Flows connect and coordinate nodes
- **Execution Logic**: Flows define how and when nodes are executed
- **Data Flow**: Flows manage how data moves between nodes
- **Reusability**: Flows can be composed and reused in different contexts
- **Nesting**: Flows can contain other flows (subflows) for modular design
- **Component Variables**: Flows can define shared variables accessible to all nodes

## Creating Flows

Flows are created using the `FlowDefinition` class:

```python
from dhenara.agent.dsl import FlowDefinition

# Create a flow definition
my_flow = FlowDefinition(root_id="my_flow")
```

The optional `root_id` parameter sets a unique identifier for the flow, which is useful when referencing the flow from
other components.

## Adding Nodes to Flows

Nodes are added to flows using the `node` method:

```python
# Add nodes to the flow
my_flow.node("analyzer", analyzer_node)
my_flow.node("processor", processor_node)
my_flow.node("output", output_node)
```

Each node is assigned a unique ID within the flow, which can be used to reference the node from other parts of the flow
or from other components.

## Component Variables

Flows can define component variables that are accessible to all nodes within the flow. This is particularly useful for
shared configuration and structured task specifications:

```python
# Define component variables
my_flow.vars(
    {
        "task_spec": task_spec,  # Pydantic model or dictionary
        "base_directory": "$var{run_root}/global_data",
        "model_options": {"temperature": 0.7, "max_tokens": 4000}
    }
)

# Access in node configurations
my_flow.node(
    "folder_analyzer",
    FolderAnalyzerNode(
        settings=FolderAnalyzerSettings(
            base_directory="$expr{base_directory}",  # Reference component variable
            operations_template=ObjectTemplate(expression="$expr{task_spec.required_context}")  # Access property of component variable
        )
    )
)
```

Component variables can be:

- Primitive values (strings, numbers, booleans)
- Complex structures (dictionaries, lists)
- Pydantic models
- Templates that reference other variables

They can be accessed in templates using the `$expr{}` syntax without needing a hierarchical reference prefix.

## Flow Execution Patterns

DAD supports several execution patterns for flows:

### Sequential Execution

By default, nodes in a flow are executed sequentially, with each node running after the previous one completes:

```python
# Create a sequential flow
sequential_flow = FlowDefinition()
sequential_flow.node("step1", step1_node)
sequential_flow.node("step2", step2_node)
sequential_flow.node("step3", step3_node)

# Explicitly define sequence - optional as this is the default behavior
sequential_flow.sequence(["step1", "step2", "step3"])
```

In most cases, you don't need to explicitly define the sequence, as nodes will be executed in the order they were added
to the flow.

### Conditional Execution

Conditional execution allows for different execution paths based on conditions:

```python
# Create true and false branch flows
true_branch = FlowDefinition()
true_branch.node("success_action", success_node)

false_branch = FlowDefinition()
false_branch.node("fallback_action", fallback_node)

# Add conditional to the main flow
main_flow = FlowDefinition()
main_flow.node("data_analyzer", analyzer_node)
main_flow.conditional(
    "condition_check",
    statement=ObjectTemplate(expression="$hier{data_analyzer}.outcome.structured.success == True"),
    true_branch=true_branch,
    false_branch=false_branch
)
```

The condition is evaluated using the template engine, which can access results from previous nodes using hierarchical
references.

### Loop Execution

Loops allow for iterative processing over collections of items:

```python
# Create a loop body flow
loop_body = FlowDefinition()
loop_body.node("process_item", process_node)

# Add loop to the main flow
main_flow = FlowDefinition()
main_flow.node("data_collector", collector_node)
main_flow.for_each(
    "process_items",
    statement=ObjectTemplate(expression="$hier{data_collector}.outcome.structured.items"),
    body=loop_body,
    max_iterations=100,
    item_var="current_item",
    index_var="item_index"
)
```

The loop iterates over each item in the collection, with each item accessible via the `item_var` in the loop body.

## Accessing Node Results with Hierarchical References

Results from nodes in a flow can be accessed using hierarchical references with the `$hier{}` syntax:

```python
# Access a node result within the same flow
"$hier{node_id}.outcome.text"

# Access a node result from a specific flow
"$hier{flow_id.node_id}.outcome.structured.property"

# Access a node result from a subflow
"$hier{flow_id.subflow_id.node_id}.outcome.structured.property"
```

These references can be used in templates to dynamically generate content based on previous results:

```python
# In an AIModelNode prompt
Prompt.with_dad_text(
    "Based on the analysis: $expr{$hier{analyzer_node}.outcome.text}\n"
    "Generate code that addresses these issues."
)

# In a FileOperationNode
FileOperationNodeSettings(
    operations_template=ObjectTemplate(
        expression="$expr{$hier{code_generator}.outcome.structured.file_operations}"
    )
)
```

## Flow Execution Context

When a flow is executed, it creates a `FlowExecutionContext` that manages the flow's state and results:

```python
# Execute a flow with a specific context
result = await flow.execute(
    execution_context=FlowExecutionContext(
        component_id="my_flow",
        component_definition=flow,
        run_context=run_context
    )
)
```

The execution context keeps track of all node results and provides access to them throughout execution.

## Common Flow Patterns

### Single-Shot Implementation Flow

A common pattern is the single-shot implementation flow that generates code based on a task description:

```python
# Create an implementation flow
implementation_flow = FlowDefinition()

# Define component variables
implementation_flow.vars({"task_spec": task_spec})

# Add analysis node
implementation_flow.node(
    "dynamic_repo_analysis",
    FolderAnalyzerNode(
        settings=FolderAnalyzerSettings(
            base_directory="$var{run_root}/global_data",
            operations_template=ObjectTemplate(expression="$expr{task_spec.required_context}"),
        ),
    ),
)

# Add code generation node
implementation_flow.node(
    "code_generator",
    AIModelNode(
        pre_events=[EventType.node_input_required],
        settings=AIModelNodeSettings(
            models=["claude-3-7-sonnet"],
            system_instructions=[...],
            prompt=Prompt.with_dad_text(
                "Task Description\n"
                "$expr{task_spec.description}\n\n"
                "## Repository Context\n"
                "$expr{$hier{dynamic_repo_analysis}.outcome.results}\n\n"
            ),
            model_call_config=AIModelCallConfig(
                structured_output=TaskImplementation,
                max_output_tokens=64000,
            ),
        ),
    ),
)

# Add file operation node
implementation_flow.node(
    "code_generator_file_ops",
    FileOperationNode(
        settings=FileOperationNodeSettings(
            base_directory="$var{run_root}/global_data",
            operations_template=ObjectTemplate(
                expression="$expr{$hier{code_generator}.outcome.structured.file_operations}",
            ),
            stage=True,
            commit=True,
        ),
    ),
)
```

This pattern follows a clean workflow:

1. Analyze the repository context
2. Generate code based on the task and context
3. Execute file operations to implement the changes

### Data Processing Flow

Another common pattern is a flow that processes data in stages:

```python
# Create a data processing flow
processing_flow = FlowDefinition()
processing_flow.node("data_collector", collector_node)
processing_flow.node("data_analyzer", analyzer_node)
processing_flow.node("data_transformer", transformer_node)
processing_flow.node("data_exporter", exporter_node)
```

### Decision-Making Flow

Another common pattern is a flow that makes decisions based on analysis:

```python
# Create a decision-making flow
decision_flow = FlowDefinition()
decision_flow.node("data_analyzer", analyzer_node)
decision_flow.conditional(
    "decision_point",
    statement=ObjectTemplate(expression="$hier{data_analyzer}.outcome.structured.score > 0.7"),
    true_branch=high_score_flow,
    false_branch=low_score_flow
)
```

## Best Practices

1. **Logical Organization**: Organize flows to represent clear logical steps
2. **Modular Design**: Use subflows to create reusable components
3. **Clear Naming**: Use descriptive names for flows and nodes
4. **Component Variables**: Use component variables for shared configuration
5. **Hierarchical References**: Use hierarchical references to connect node outputs to inputs
6. **Error Handling**: Include conditional branches for handling errors
7. **Documentation**: Document the purpose and behavior of each flow

By following these practices, you can create clear, maintainable flows that effectively orchestrate complex processing
tasks.
