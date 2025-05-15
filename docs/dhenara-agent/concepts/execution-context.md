---
title: Execution Context
---

# Execution Context

## Overview

The Execution Context in Dhenara Agent DSL (DAD) is a crucial component that manages state, scoping, and data flow
during the execution of agents, flows, and nodes. It serves as a central mechanism for communication between components
and provides access to resources, artifact management, and hierarchical data structures.

## Core Concepts

The Execution Context system revolves around these key concepts:

1. **State Management**: Tracking execution state (pending, running, completed, failed)
2. **Result Storage**: Storing and retrieving the outputs of executed nodes
3. **Hierarchical Structure**: Maintaining parent-child relationships between contexts
4. **Variable Scoping**: Managing variable access across different execution scopes
5. **Resource Access**: Providing access to configured resources like AI models
6. **Component Communication**: Enabling data flow between different components through references

## Execution Context Hierarchy

Context objects form a hierarchy that mirrors the component hierarchy:

```
AgentExecutionContext
 ├── FlowExecutionContext 1
 │    ├── NodeExecutionContext A
 │    ├── NodeExecutionContext B
 │    └── SubflowExecutionContext
 │         ├── NodeExecutionContext C
 │         └── NodeExecutionContext D
 ├── FlowExecutionContext 2
 │    ├── NodeExecutionContext E
 │    └── NodeExecutionContext F
 └── SubagentExecutionContext
      └── FlowExecutionContext 3
           ├── NodeExecutionContext G
           └── NodeExecutionContext H
```

This hierarchy allows components to access data from their parent contexts, enabling data flow across the component
tree.

## ExecutionContext Class

The `ExecutionContext` is the base class for all context types:

```python
class ExecutionContext:
    executable_type: ExecutableTypeEnum
    component_id: str
    component_definition: Any
    context_id: uuid.UUID
    parent: Optional["ExecutionContext"]
    execution_status: ExecutionStatusEnum
    execution_results: dict[str, NodeExecutionResult]
    run_context: RunContext
```

### Key Properties

- **executable_type**: Type of the executable (agent, flow, node)
- **component_id**: ID of the component being executed
- **parent**: Reference to the parent context (if any)
- **execution_status**: Current status of execution
- **execution_results**: Dictionary mapping node IDs to execution results
- **run_context**: Reference to the global run context

## Component Communication through Execution Context

One of the most powerful features of the Execution Context is enabling communication between components. This is done
through referencing previous node results using the `$hier{}` syntax in templates and expressions:

```python
# In an AIModelNode prompt template
prompt=Prompt.with_dad_text(
    text=(
        "## Repository Context\n"
        "$expr{$hier{dynamic_repo_analysis}.outcome.results}\n\n"
        "## Previous Analysis\n"
        "$expr{$hier{code_generator}.outcome.structured.file_operations}"
    ),
)

# In a FileOperationNode settings
operations_template=ObjectTemplate(
    expression="$expr{$hier{code_generator}.outcome.structured.file_operations}",
)
```

This pattern allows nodes to access outputs from previous executions and use them as inputs, creating a data flow
pipeline.

## Data Access

ExecutionContext provides methods for accessing data across the hierarchy:

```python
# Get a result from a specific node in the current context
result = execution_context.get_result("node_id")

# Get a variable from the context hierarchy (local or from parent contexts)
value = execution_context.get_context_variable("variable_name")

# Get a reference to a node in the hierarchy by path
node_context = execution_context.get_context_by_path("flow1.node3")
```

## Component Variables

Component variables provide a way to share data across all nodes within a component:

```python
# Define variables at the flow level
implementation_flow = FlowDefinition()
implementation_flow.vars(
    {
        "task_spec": task_spec,  # This variable is accessible to all nodes in the flow
    }
)

# Access component variables in node settings or templates
prompt=Prompt.with_dad_text(
    text=(
        "Task Specification\n"
        "Task ID: $expr{task_spec.task_id}\n"
        "Description: $expr{task_spec.description}\n\n"
    ),
)
```

Component variables improve code organization by centralizing configuration and enabling reusability.

## Hierarchical References

One of the most powerful features of the execution context is the ability to reference results from other nodes using
hierarchical paths:

```python
# In a template or expression
"$hier{flow_id.node_id.outcome.structured.property}"
```

This allows data to flow naturally between components without having to manually pass results around.

## Template Expressions

The Execution Context integrates with the template system to allow dynamic content based on context variables and node
results:

```python
# Basic variable substitution
"$var{task_description}"

# Expression evaluation
"$expr{task_spec.required_context}"

# Hierarchical reference to previous node result
"$expr{$hier{dynamic_repo_analysis}.outcome.results}"

# Combining multiple references
"$expr{$hier{code_generator}.outcome.structured.file_operations[$var{index}]}"
```

The template engine resolves these expressions at runtime using the current execution context.

## Result Management

Results from node executions are stored in the context:

```python
# Store a result
execution_context.set_result("node_id", node_execution_result)

# Retrieve a result
result = execution_context.get_result("node_id")

# Check if a result exists
has_result = execution_context.has_result("node_id")
```

## Integration with Template Engine

The Execution Context integrates deeply with the templating system, enabling dynamic content generation based on
execution results:

```python
# Render a template with context variables
result = TemplateEngine.render_template(
    template="Value from previous node: $hier{node_id.outcome.text}",
    variables={},
    execution_context=execution_context
)
```

## Creating and Using Execution Contexts

Contexts are typically created when executing components:

```python
# Create a context for a flow
flow_context = FlowExecutionContext(
    component_id="my_flow",
    component_definition=my_flow_definition,
    parent=parent_context,  # Optional
    run_context=run_context
)

# Execute a component with the context
result = await my_flow.execute(flow_context)
```

## Practical Example

Here's a practical example showing how Execution Context enables data flow in a multi-node workflow:

```python
# Folder analysis node that analyzes files
implementation_flow.node(
    "dynamic_repo_analysis",
    FolderAnalyzerNode(
        settings=FolderAnalyzerSettings(
            base_directory=global_data_directory,
            operations=folder_operations,
        ),
    ),
)

# Code generation node that uses the analysis results
implementation_flow.node(
    "code_generator",
    AIModelNode(
        settings=AIModelNodeSettings(
            prompt=Prompt.with_dad_text(
                text=(
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

# File operation node that uses the generated code operations
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

This pattern demonstrates how data flows between nodes through the Execution Context without requiring direct
connections.

## Best Practices

1. **Respect Scoping Rules**: Access only results that are in scope for your component
2. **Use Hierarchical References**: Leverage `$hier{}` syntax for cross-component references
3. **Keep Contexts Clean**: Avoid storing excessive data in context variables
4. **Cache Results When Appropriate**: For expensive operations, cache results in the context
5. **Be Careful with Circular References**: Avoid creating circular dependencies in hierarchical references
6. **Use Component Variables**: Use flow-level variables for configuration that needs to be shared across nodes
7. **Prefer Explicit References**: Be explicit in your references to make the data flow clear

## Conclusion

The Execution Context system in DAD provides a powerful mechanism for managing state, sharing data between components,
and coordinating complex workflows. By understanding and effectively using the execution context, you can create
sophisticated agent behaviors with clean, well-structured data flows.
