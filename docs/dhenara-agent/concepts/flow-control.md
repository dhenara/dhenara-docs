# Loops and Conditions

## Overview

Dhenara Agent DSL (DAD) provides powerful flow control mechanisms that allow you to create dynamic, responsive agent
workflows. The two primary flow control structures are conditionals and loops, enabling branching logic and iterative
processing within your flows.

This document explains how to use these control structures effectively with practical examples.

## Conditional Execution

Conditional execution allows your flow to take different paths based on the evaluation of expressions. This enables
creating flexible agents that can make decisions based on previous results, user input, or other data.

### Basic Conditional Syntax

```python
from dhenara.agent.dsl import FlowDefinition
from dhenara.ai.types import ObjectTemplate

# Create a flow
my_flow = FlowDefinition()

# Add some nodes
my_flow.node("analyzer", analyzer_node)

# Add a conditional
my_flow.conditional(
    id="decision_point",  # Unique identifier for this conditional
    statement=ObjectTemplate(
        expression="$expr{$hier{analyzer}.outcome.structured.success == True}"
    ),
    true_branch=success_flow,  # Flow to execute if the condition is true
    false_branch=failure_flow  # Flow to execute if the condition is false
)
```

The `statement` parameter takes an `ObjectTemplate` with an expression that evaluates to a boolean value. If the
expression evaluates to `True`, the `true_branch` flow is executed; otherwise, the `false_branch` flow is executed.

### Expression Syntax

Conditional expressions can use different syntaxes:

#### Direct Expression

```python
statement=ObjectTemplate(
    expression="$expr{child.word_count > 20}"
)
```

#### Python Expression

```python
statement=ObjectTemplate(
    expression="$expr{py: len($hier{initial_repo_analysis}.outcome.results) >= 1}"
)
```

#### Complex Boolean Logic

```python
statement=ObjectTemplate(
    expression="$expr{(child.word_count > 20) && (child.word_count < 40)}"
)
```

#### Advanced Python Logic

```python
statement=ObjectTemplate(
    expression="$expr{py: len($hier{initial_repo_analysis}.outcome.results) >= 1 and \
               all(child.word_count > 10 for result in $hier{initial_repo_analysis}.outcome.results \
               for child in result.analysis.children)}"
)
```

### Practical Example

Here's a complete example of a conditional that checks if a file analysis has a certain word count and takes different
actions based on the result:

```python
my_flow.conditional(
    id="complexity_check",
    statement=ObjectTemplate(
        expression="$expr{$hier{file_analyzer}.outcome.structured.word_count > 1000}"
    ),
    true_branch=FlowDefinition().node(
        "complex_processor",
        AIModelNode(
            settings=AIModelNodeSettings(
                models=["claude-3-7-sonnet"],
                system_instructions=["You are processing a complex document."],
                prompt=Prompt.with_dad_text("Process this complex document: $hier{file_analyzer}.outcome.text"),
            )
        )
    ),
    false_branch=FlowDefinition().node(
        "simple_processor",
        AIModelNode(
            settings=AIModelNodeSettings(
                models=["claude-3-5-haiku"],
                system_instructions=["You are processing a simple document."],
                prompt=Prompt.with_dad_text("Process this simple document: $hier{file_analyzer}.outcome.text"),
            )
        )
    )
)
```

## Loop Execution (ForEach)

The `for_each` method allows you to iterate over a collection of items, executing a "body" flow for each item. This is
particularly useful for processing lists of files, API results, or other collections.

### Basic Loop Syntax

```python
from dhenara.agent.dsl import FlowDefinition
from dhenara.ai.types import ObjectTemplate

my_flow = FlowDefinition()
my_flow.node("data_collector", collector_node)

# Define a loop
my_flow.for_each(
    id="item_processor",               # Unique identifier for this loop
    statement=ObjectTemplate(
        expression="$expr{$hier{data_collector}.outcome.structured.items}"
    ),
    item_var="current_item",          # Variable name for the current item
    index_var="item_index",           # Variable name for the current index
    max_iterations=10,                # Maximum number of iterations
    body=item_processing_flow         # Flow to execute for each item
)
```

For each iteration of the loop:

1. The current item is assigned to the variable named by `item_var`
2. The current index is assigned to the variable named by `index_var`
3. The `body` flow is executed with these variables available

### Accessing Loop Variables

Within the body flow, you can access the loop variables using the `$expr{}` syntax:

```python
# In the body flow
item_processing_flow = FlowDefinition()
item_processing_flow.node(
    "processor",
    AIModelNode(
        settings=AIModelNodeSettings(
            prompt=Prompt.with_dad_text(
                "Processing item $expr{item_index + 1}: $expr{current_item.name}"
            )
        )
    )
)
```

### Nested Loops

You can nest loops for more complex processing patterns:

```python
outer_loop_flow = FlowDefinition()

# Outer loop
outer_loop_flow.for_each(
    id="category_processor",
    statement=ObjectTemplate(expression="$expr{$hier{categories}.outcome.structured.categories}"),
    item_var="category",
    index_var="category_index",
    max_iterations=10,
    body=FlowDefinition().for_each(
        # Inner loop
        id="item_processor",
        statement=ObjectTemplate(expression="$expr{category.items}"),
        item_var="item",
        index_var="item_index",
        max_iterations=20,
        body=item_processing_flow
    )
)
```

### Practical Example

Here's a complete example of using a loop to process files from a folder analysis:

```python
my_flow = FlowDefinition()

# Folder analysis node
my_flow.node(
    "folder_analyzer",
    FolderAnalyzerNode(
        settings=FolderAnalyzerSettings(
            base_directory="$var{run_root}/global_data",
            operations=[
                FolderAnalysisOperation(
                    operation_type="analyze_folder",
                    path="project/src",
                    content_read_mode="structure",
                )
            ]
        )
    )
)

# Process each file using a loop
my_flow.for_each(
    id="file_processor",
    statement=ObjectTemplate(
        expression="$expr{$hier{folder_analyzer}.outcome.results[0].analysis.children}"
    ),
    item_var="file",
    index_var="file_index",
    max_iterations=50,
    body=FlowDefinition().node(
        "file_processor",
        AIModelNode(
            settings=AIModelNodeSettings(
                models=["claude-3-5-haiku"],
                system_instructions=["You analyze code files."],
                prompt=Prompt.with_dad_text(
                    "Analyzing file $expr{file_index + 1}: $expr{file.path}\n"
                    "File type: $expr{file.extension}\n"
                    "Content: $expr{file.content}\n"
                    "Please provide a brief analysis of this file."
                ),
            )
        )
    )
)
```

## Real-World Example

Here's a more complex example showing nested loops and conditionals together, similar to what's used in actual DAD
agents:

```python
# Analyze repository structure
flow.node(
    "repo_analysis",
    FolderAnalyzerNode(
        settings=FolderAnalyzerSettings(
            base_directory=global_data_directory,
            operations=[...]
        )
    )
)

# Process each analysis result
flow.for_each(
    id="analysis_processor",
    statement=ObjectTemplate(expression="$expr{$hier{repo_analysis}.outcome.results}"),
    item_var="analysis_result",
    index_var="result_index",
    max_iterations=10,
    body=FlowDefinition()
        # Process each file in this analysis result
        .for_each(
            id="file_processor",
            statement=ObjectTemplate(expression="$expr{analysis_result.analysis.children}"),
            item_var="file",
            index_var="file_index",
            max_iterations=100,
            body=FlowDefinition()
                # Apply different processing based on file size
                .conditional(
                    id="file_size_check",
                    statement=ObjectTemplate(
                        expression="$expr{file.word_count > 500}"
                    ),
                    true_branch=FlowDefinition().node(
                        "large_file_processor",
                        AIModelNode(settings=large_file_settings)
                    ),
                    false_branch=FlowDefinition().node(
                        "small_file_processor",
                        AIModelNode(settings=small_file_settings)
                    )
                )
        )
)
```

## Implementation in the Flow Coordinator

The control flow structures are also useful in the main flow coordinator for high-level orchestration:

```python
coordinator_flow = FlowDefinition()

# Run planning phase
coordinator_flow.subflow("planner", planner_flow)

# Conditionally execute implementation based on planning success
coordinator_flow.conditional(
    id="plan_executor",
    statement=ObjectTemplate(
        expression="$expr{py: $hier{planner.plan_generator}.outcome.structured is not None}"
    ),
    # If planning was successful, iterate through each task
    true_branch=FlowDefinition().for_each(
        id="implementation_loop",
        statement=ObjectTemplate(
            expression="$expr{py: $hier{planner.plan_generator}.outcome.structured.implementation_tasks}"
        ),
        item_var="task_spec",
        index_var="task_index",
        max_iterations=20,
        body=implementation_flow
    ),
    # If planning failed, show an error message
    false_branch=FlowDefinition().node(
        "no_plan_generated",
        CommandNode(
            settings=CommandNodeSettings(
                commands=["echo 'Planning was unsuccessful.'"]
            )
        )
    )
)
```

## Important Considerations

### Loop Limitations

- Always set a reasonable `max_iterations` value to prevent infinite loops
- Be mindful of the performance impact when processing large collections
- Consider the memory usage when dealing with large datasets in loops

### Conditional Branching Complexity

- Avoid overly complex conditional expressions that are hard to understand
- Consider breaking complex logic into separate variables for clarity
- Remember that the entire branch flow is defined before execution, so both branches are defined regardless of which one
  executes

### Variable Scope

- Loop variables (`item_var`, `index_var`) are only available within the body flow
- Component variables defined with `flow.vars({...})` are available to all nodes in the flow, including conditional
  branches and loop bodies
- Use hierarchical references (`$hier{}`) to access results from nodes in parent flows

## Best Practices

1. **Use Clear Identifiers**: Give meaningful names to loops and conditionals for better readability
2. **Set Reasonable Limits**: Always specify `max_iterations` for loops
3. **Break Down Complex Logic**: Use multiple simple conditionals rather than a single complex one
4. **Component Variables**: Use component variables for shared configuration
5. **Consistent Patterns**: Follow consistent patterns for loop and conditional structures
6. **Error Handling**: Include conditional branches for handling errors
7. **Documentation**: Document the purpose of complex control structures

By effectively using flow control mechanisms, you can build sophisticated, adaptive agents that respond intelligently to
various conditions and process complex data structures efficiently.
