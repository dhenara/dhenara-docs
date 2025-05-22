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
# Import flows
from .flows.implementation import implementation_flow

# Add flows to the agent
my_agent = AgentDefinition()
my_agent.flow("main_flow", implementation_flow)
```

Each flow is assigned a unique ID within the agent, which can be used to reference the flow from other parts of the
agent.

## Single-Flow Agent Pattern

The simplest agent pattern uses a single flow, as shown in the single-shot-coder tutorial:

```python
from dhenara.agent.dsl import AgentDefinition
from .flows.implementation import implementation_flow

agent = AgentDefinition(root_id="autocoder_root")
agent.flow(
    "main_flow",
    implementation_flow,
)
```

This pattern is effective for straightforward tasks that follow a linear process, like the single-shot coding assistant.

## Multi-Flow Agent Pattern

More complex agents can coordinate multiple flows:

```python
# Create an agent with multiple flows
complex_agent = AgentDefinition()
complex_agent.flow("analyze", analysis_flow)
complex_agent.flow("process", process_flow)
complex_agent.flow("export", export_flow)

# Define sequential execution of flows
complex_agent.sequence(["analyze", "process", "export"])
```

This ensures that flows are executed in the specified order, with each flow starting after the previous one completes.

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

## Agent Execution

Agents are executed through a runner, which requires a run context:

```python
from dhenara.agent.run import RunContext
from dhenara.agent.runner import AgentRunner
from dhenara.agent.dsl.events import EventType
from dhenara.agent.utils.helpers.terminal import print_node_completion, print_component_completion

# Select the agent to run
from src.agents.autocoder.agent import agent
from src.agents.autocoder.handler import node_input_event_handler

# Set agent root_id
root_component_id = "autocoder_root"
agent.root_id = root_component_id

# Create run context
run_context = RunContext(
    root_component_id=root_component_id,
    project_root=project_root,
    observability_settings=None,
    run_root_subpath=None,
)

# Register event handlers
run_context.register_event_handlers({
    EventType.node_input_required: node_input_event_handler,
    EventType.node_execution_completed: print_node_completion,
    EventType.component_execution_completed: print_component_completion,
})

# Create and run the agent
runner = AgentRunner(agent, run_context)
# Run using: dad agent run <agent_name>
```

The run context provides the execution environment for the agent, including event handling and artifacts storage.

## Agent Artifacts

When an agent is executed, it generates artifacts in the run directory:

```
runs/run_<timestamp>_<id>/
├── .trace/
│   ├── dad_metadata.json
│   ├── logs.jsonl
│   ├── metrics.jsonl
│   └── trace.jsonl
├── <agent_root_id>/
│   └── <flow_id>/
│       ├── <node_id_1>/
│       │   ├── outcome.json
│       │   └── result.json
│       ├── <node_id_2>/
│       │   ├── outcome.json
│       │   ├── result.json
│       │   └── state.json  # For AIModelNode
└── static_inputs/
```

These artifacts provide valuable information for debugging and understanding the agent's execution:

- **result.json**: Contains the complete node execution result
- **outcome.json**: Contains just the outcome portion of the result
- **state.json**: For AIModelNode, contains the actual API call details

## Common Agent Patterns

### Single-Shot Coding Agent

A common pattern is a coding agent that implements tasks in a single pass:

```python
# Agent definition
agent = AgentDefinition(root_id="autocoder_root")
agent.flow(
    "main_flow",
    implementation_flow,  # Flow that analyzes code and makes changes
)
```

This pattern, demonstrated in the single-shot-coder tutorial, is effective for straightforward coding tasks.

### Multi-Stage Processing Agent

A multi-stage agent processes data in distinct stages:

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

## Best Practices

1. **Logical Decomposition**: Break complex tasks into logical agent components
2. **Clear Responsibility**: Each agent should have a clear, focused responsibility
3. **Appropriate Granularity**: Choose the right level of granularity for agents
4. **Explicit Coordination**: Make coordination between agents explicit
5. **Reuse Common Patterns**: Identify and reuse common agent patterns
6. **Event Handling**: Implement comprehensive event handling for user interaction
7. **Artifact Management**: Understand and leverage the artifacts system for debugging

By following these practices, you can create sophisticated agent systems that effectively solve complex problems while
maintaining clarity and maintainability.
