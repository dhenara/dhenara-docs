---
title: Flows
---

# Flows

## Overview

Flows in Dhenara Agent DSL (DAD) are intermediate components that organize nodes into connected processing pipelines. They define the execution logic, including sequential processing, conditionals, and loops. Flows serve as the primary way to orchestrate the execution of nodes to achieve specific goals.

## Core Concepts

Flows in DAD are built around these key concepts:

- **Nodes as Building Blocks**: Flows connect and coordinate nodes
- **Execution Logic**: Flows define how and when nodes are executed
- **Data Flow**: Flows manage how data moves between nodes
- **Reusability**: Flows can be composed and reused in different contexts
- **Nesting**: Flows can contain other flows (subflows) for modular design

## Creating Flows

Flows are created using the `FlowDefinition` class:

```python
from dhenara.agent.dsl import FlowDefinition

# Create a flow definition
my_flow = FlowDefinition(root_id="my_flow")
```

The optional `root_id` parameter sets a unique identifier for the flow, which is useful when referencing the flow from other components.

## Adding Nodes to Flows

Nodes are added to flows using the `node` method:

```python
# Add nodes to the flow
my_flow.node("analyzer", analyzer_node)
my_flow.node("processor", processor_node)
my_flow.node("output", output_node)
```

Each node is assigned a unique ID within the flow, which can be used to reference the node from other parts of the flow or from other components.

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

# Explicitly define sequence
sequential_flow.sequence(["step1", "step2", "step3"])
```

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

The condition is evaluated using the template engine, which can access results from previous nodes using hierarchical references.

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

## Custom Node Connections

While the default patterns cover most use cases, you can also create custom connections between nodes:

```python
# Create a flow with custom connections
custom_flow = FlowDefinition()
custom_flow.node("start", start_node)
custom_flow.node("process_a", process_a_node)
custom_flow.node("process_b", process_b_node)
custom_flow.node("end", end_node)

# Connect nodes with custom logic
custom_flow.connect("start", "process_a", on_success=True)
custom_flow.connect("start", "process_b", on_error=True)
custom_flow.connect("process_a", "end", on_success=True)
custom_flow.connect("process_b", "end", on_success=True)
```

This example creates a flow where `process_a` is executed if `start` succeeds, and `process_b` is executed if `start` fails. Both processing paths then connect to the `end` node.

## Working with Subflows

Flows can include other flows as subflows, enabling modular design:

```python
# Create a subflow
subflow = FlowDefinition()
subflow.node("subflow_node_1", subflow_node_1)
subflow.node("subflow_node_2", subflow_node_2)

# Add the subflow to a main flow
main_flow = FlowDefinition()
main_flow.node("main_node_1", main_node_1)
main_flow.subflow("processing_subflow", subflow)
main_flow.node("main_node_2", main_node_2)
```

Subflows are executed as part of the parent flow, and their results are accessible using hierarchical references.

## Accessing Flow Results

Results from nodes in a flow can be accessed using hierarchical references:

```python
# Access a node result within the same flow
"$hier{node_id}.outcome.text"

# Access a node result from a specific flow
"$hier{flow_id.node_id}.outcome.structured.property"

# Access a node result from a subflow
"$hier{flow_id.subflow_id.node_id}.outcome.structured.property"
```

These references can be used in templates to dynamically generate content based on previous results.

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

### Data Processing Flow

A common pattern is to create a flow that processes data in stages:

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

### Iterative Processing Flow

Iterative processing flows handle collections of items:

```python
# Create an iterative processing flow
iterative_flow = FlowDefinition()
iterative_flow.node("data_collector", collector_node)
iterative_flow.for_each(
    "item_processor",
    statement=ObjectTemplate(expression="$hier{data_collector}.outcome.structured.items"),
    body=item_processor_flow
)
iterative_flow.node("result_aggregator", aggregator_node)
```

## Best Practices

1. **Logical Organization**: Organize flows to represent clear logical steps
2. **Modular Design**: Use subflows to create reusable components
3. **Clear Naming**: Use descriptive names for flows and nodes
4. **Error Handling**: Include conditional branches for handling errors
5. **Documentation**: Document the purpose and behavior of each flow

By following these practices, you can create clear, maintainable flows that effectively orchestrate complex processing tasks.