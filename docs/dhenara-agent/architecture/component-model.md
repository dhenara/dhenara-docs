---
title: Component Model
---

# Component Model

## Overview

The Dhenara Agent DSL (DAD) employs a hierarchical component model that enables composition, reuse, and scalability.
This model organizes agent behavior into a clear, logical structure, making it easier to build and maintain complex AI
agent systems.

## Hierarchical Structure

The component hierarchy in DAD consists of three primary levels:

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

### Components at Each Level

1. **Nodes (Leaf components)**:

   - Atomic units of execution that perform specific tasks
   - Represent individual operations like making LLM API calls, analyzing files, or manipulating the file system
   - Form the foundation of any agent workflow

2. **Flows (Intermediate components)**:

   - Collections of nodes organized with execution logic
   - Support sequential execution, conditionals, and loops
   - Can contain other flows (subflows) for modularity
   - Represent logical processing pipelines

3. **Agents (Root components)**:
   - Top-level components that can contain flows and other agents
   - Coordinate the overall behavior and interaction between components
   - Represent complete functional units or capabilities

## Definition and Execution Pattern

Each component follows a clear separation between definition (what it does) and execution (how it runs):

### Definition Classes

- **NodeDefinition**: Defines what a node does, its configuration, and input/output requirements
- **FlowDefinition**: Defines the structure of a flow, including its nodes and how they connect
- **AgentDefinition**: Defines the structure of an agent, including its flows and subagents

### Execution Classes

- **ExecutableNode**: Handles the execution of a node
- **Flow**: Handles the execution of a flow
- **Agent**: Handles the execution of an agent

This separation enables flexible composition and customization while maintaining consistent execution behaviors.

## Component Connections

Components connect in different ways depending on their level in the hierarchy:

### Node Connections

Nodes within a flow can be connected in several ways:

```python
# Sequential connection (default)
flow.sequence(["node1", "node2", "node3"])

# Conditional connections
flow.conditional(
    "condition_check",
    statement=ObjectTemplate(expression="$hier{node1}.outcome.structured.success == True"),
    true_branch=true_branch_flow,
    false_branch=false_branch_flow
)

# Loop connections
flow.for_each(
    "process_items",
    statement=ObjectTemplate(expression="$hier{node1}.outcome.structured.items"),
    body=item_processor_flow,
    max_iterations=10
)
```

### Flow and Agent Connections

Flows within an agent can be connected in similar ways:

```python
# Sequential flows
agent.sequence(["flow1", "flow2", "flow3"])

# Conditional flow execution
agent.conditional(
    "condition_check",
    statement=ObjectTemplate(expression="$hier{flow1.node1}.outcome.structured.requires_processing"),
    true_branch=processing_agent,
    false_branch=skip_processing_agent
)
```

## Component Reusability

The component model is designed for reusability at every level:

- **Node Reusability**: The same node definition can be used in multiple flows
- **Flow Reusability**: The same flow definition can be used in multiple agents
- **Agent Reusability**: Agents can be composed into larger, more complex agent systems

This reusability enables the creation of component libraries that can be shared across projects.

## Benefits of the Component Model

1. **Modularity**: Break complex behaviors into manageable pieces
2. **Reusability**: Build a library of components to use across projects
3. **Maintainability**: Isolate changes and updates to specific components
4. **Scalability**: Grow agent capabilities by adding new components
5. **Clarity**: Clear structure makes it easier to understand agent behavior

By leveraging this hierarchical component model, DAD enables the construction of complex, reusable agent systems with
clear separation of concerns and predictable behavior.
