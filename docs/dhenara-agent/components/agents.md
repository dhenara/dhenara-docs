---
title: Agents
---

# Agents

## Overview

Agents are the top-level components in Dhenara Agent DSL (DAD). They coordinate multiple flows and subagents to
implement complex behaviors and solve sophisticated problems. Agents act as the primary entry points for executing
AI-powered workflows, offering a high-level abstraction for organizing and managing flows.

## Core Concepts

Agents in DAD are built around these key concepts:

- **Coordination**: Agents coordinate multiple flows and subagents
- **Composition**: Agents can contain other agents (subagents) for complex behaviors
- **Orchestration**: Agents define the execution order and conditions
- **Reusability**: Agents can be composed and reused in different contexts
- **Hierarchy**: Agents form the top level of the DAD component hierarchy

## Creating Agents

Agents are created using the `AgentDefinition` class:

```python
from dhenara.agent.dsl import AgentDefinition

# Create an agent definition
my_agent = AgentDefinition(root_id="my_agent")
```

The optional `root_id` parameter sets a unique identifier for the agent, which is useful when referencing the agent from
other components.

## Adding Flows to Agents

Flows are added to agents using the `flow` method:

```python
# Create flows
analysis_flow = FlowDefinition()
# Define analysis flow nodes...

process_flow = FlowDefinition()
# Define process flow nodes...

export_flow = FlowDefinition()
# Define export flow nodes...

# Add flows to the agent
my_agent.flow("analyze", analysis_flow)
my_agent.flow("process", process_flow)
my_agent.flow("export", export_flow)
```

Each flow is assigned a unique ID within the agent, which can be used to reference the flow from other parts of the
agent.

## Agent Execution Patterns

DAD supports several execution patterns for agents:

### Sequential Execution

By default, flows in an agent are executed sequentially:

```python
# Define sequential execution of flows
my_agent.sequence(["analyze", "process", "export"])
```

This ensures that flows are executed in the specified order, with each flow starting after the previous one completes.

### Conditional Execution

Conditional execution allows for different execution paths based on conditions:

```python
# Create agent branches
true_branch_agent = AgentDefinition()
true_branch_agent.flow("deep_process", deep_process_flow)

false_branch_agent = AgentDefinition()
false_branch_agent.flow("light_process", light_process_flow)

# Add conditional to the main agent
main_agent = AgentDefinition()
main_agent.flow("analyze", analysis_flow)
main_agent.conditional(
    "complexity_check",
    statement=ObjectTemplate(expression="$hier{analyze.complexity_detector}.outcome.structured.is_complex"),
    true_branch=true_branch_agent,
    false_branch=false_branch_agent
)
main_agent.flow("export", export_flow)
```

The condition is evaluated using the template engine, which can access results from previous flows and nodes.

### Loop Execution

Loops allow for iterative processing over collections of items:

```python
# Create a loop body agent
loop_body_agent = AgentDefinition()
loop_body_agent.flow("process_item", process_item_flow)

# Add loop to the main agent
main_agent = AgentDefinition()
main_agent.flow("data_collection", collection_flow)
main_agent.for_each(
    "item_processor",
    statement=ObjectTemplate(expression="$hier{data_collection.collector}.outcome.structured.items"),
    body=loop_body_agent,
    max_iterations=50
)
main_agent.flow("aggregation", aggregation_flow)
```

The loop iterates over each item in the collection, executing the loop body agent for each item.

## Working with Subagents

Agents can include other agents as subagents, enabling complex hierarchical designs:

```python
# Create subagents
data_collection_agent = AgentDefinition()
# Define data collection flows...

data_processing_agent = AgentDefinition()
# Define data processing flows...

data_analysis_agent = AgentDefinition()
# Define data analysis flows...

# Create a parent agent with subagents
main_agent = AgentDefinition()
main_agent.subagent("collector", data_collection_agent)
main_agent.subagent("processor", data_processing_agent)
main_agent.subagent("analyzer", data_analysis_agent)
main_agent.flow("coordination", coordination_flow)
```

Subagents are executed as part of the parent agent, and their results are accessible using hierarchical references.

## Accessing Agent Results

Results from flows and nodes within an agent can be accessed using hierarchical references:

```python
# Access a node result from a flow in the same agent
"$hier{flow_id.node_id}.outcome.text"

# Access a node result from a specific subagent
"$hier{subagent_id.flow_id.node_id}.outcome.structured.property"
```

These references can be used in templates to dynamically generate content based on previous results.

## Agent Execution Context

When an agent is executed, it creates an `AgentExecutionContext` that manages the agent's state and results:

```python
# Execute an agent with a specific context
result = await agent.execute(
    execution_context=AgentExecutionContext(
        component_id="my_agent",
        component_definition=agent,
        run_context=run_context
    )
)
```

The execution context keeps track of all flow and node results and provides access to them throughout execution.

## Common Agent Patterns

### Multi-Stage Processing Agent

A common pattern is to create an agent that processes data in distinct stages:

```python
# Create a multi-stage processing agent
processing_agent = AgentDefinition()
processing_agent.flow("data_collection", collection_flow)
processing_agent.flow("data_cleaning", cleaning_flow)
processing_agent.flow("data_analysis", analysis_flow)
processing_agent.flow("report_generation", report_flow)
processing_agent.sequence(["data_collection", "data_cleaning", "data_analysis", "report_generation"])
```

### Collaborative Agent System

Another pattern is creating agents that collaborate on complex tasks:

```python
# Create specialized agents
planner_agent = AgentDefinition()
# Define planning flows...

executor_agent = AgentDefinition()
# Define execution flows...

verifier_agent = AgentDefinition()
# Define verification flows...

# Create a coordinating agent
coordinator_agent = AgentDefinition()
coordinator_agent.subagent("planner", planner_agent)
coordinator_agent.subagent("executor", executor_agent)
coordinator_agent.subagent("verifier", verifier_agent)
coordinator_agent.flow("coordination", coordination_flow)
```

This pattern enables delegation of specialized tasks to appropriate subagents.

### Adaptive Decision-Making Agent

Adaptive agents can change their behavior based on analysis results:

```python
# Create an adaptive agent
adaptive_agent = AgentDefinition()
adaptive_agent.flow("initial_analysis", analysis_flow)

# Define behavior branches
simple_case_agent = AgentDefinition().flow("simple_process", simple_flow)
complex_case_agent = AgentDefinition().flow("complex_process", complex_flow)
extreme_case_agent = AgentDefinition().flow("extreme_process", extreme_flow)

# Add conditional for first decision
adaptive_agent.conditional(
    "complexity_check",
    statement=ObjectTemplate(expression="$hier{initial_analysis.analyzer}.outcome.structured.complexity > 0.7"),
    true_branch=complex_branch_agent,
    false_branch=simple_branch_agent
)

# Complex branch agent has its own conditional
complex_branch_agent = AgentDefinition()
complex_branch_agent.conditional(
    "extreme_check",
    statement=ObjectTemplate(expression="$hier{initial_analysis.analyzer}.outcome.structured.complexity > 0.9"),
    true_branch=extreme_case_agent,
    false_branch=complex_case_agent
)
```

This pattern enables sophisticated decision trees for processing.

## Best Practices

1. **Logical Decomposition**: Break complex tasks into logical agent components
2. **Clear Responsibility**: Each agent should have a clear, focused responsibility
3. **Appropriate Granularity**: Choose the right level of granularity for agents
4. **Explicit Coordination**: Make coordination between agents explicit
5. **Reuse Common Patterns**: Identify and reuse common agent patterns

By following these practices, you can create sophisticated agent systems that effectively solve complex problems while
maintaining clarity and maintainability.
