---
title: Templating System
---

# Templating System

## Overview

The Dhenara Agent DSL (DAD) templating system is a powerful feature that enables dynamic content generation, variable
substitution, and complex expression evaluation within agent definitions. This document explains the capabilities of the
templating system and best practices for effective usage.

## Core Concepts

The DAD templating system operates on several key concepts:

1. **Variable Substitution**: Replace placeholders with variable values
2. **Expression Evaluation**: Evaluate expressions within templates
3. **Hierarchical References**: Access outputs from other nodes in the flow
4. **Component Variables**: Share configuration across all nodes in a flow
5. **Conditional Logic**: Include conditional sections based on expression results

## Template Syntax

The templating system uses a distinctive syntax for different operations:

### Variable Substitution

Variable substitution uses the `$var{name}` syntax to replace placeholders with values:

```
"Generate code in $var{language} to implement $var{feature}"
```

When rendered, this replaces `$var{language}` and `$var{feature}` with their respective values.

In the single-shot-coder tutorial, we see this pattern used for task descriptions:

```python
prompt=Prompt.with_dad_text(
    text=(
        "## Task Description\n"
        "$var{task_description}"
        "## Repository Context\n"
        # ... more content ...
    ),
)
```

And then in the handler providing the value:

```python
task_description = await async_input("Enter your query: ")
node_input.prompt_variables = {"task_description": task_description}
```

### Expression Evaluation

Expression evaluation uses the `$expr{expression}` syntax to compute values:

```
"This will take $expr{processing_time * 2} minutes to complete"
```

Expressions can include basic arithmetic, string operations, and more complex operations.

Expressions can also include dot notation for accessing object attributes or dictionary keys like
`$expr{task_spec.task_id}` or `$expr{task_spec.required_context[0].file_name}`.

In the tutorial, expressions are commonly used when accessing component variables or hierarchical references:

```python
operations_template=ObjectTemplate(
    expression="$expr{task_spec.required_context}",
)
```

:::note

Dot notation can only be used inside expressions (`$expr{}`), not with simple variable substitution. Even when accessing
an attribute or key within text (e.g., in a prompt), use `$expr{}` instead of `$var{}`. The `$var{}` syntax should be
reserved for simple variable substitution inside strings without any attribute or key access.

:::

### Hierarchical References

Hierarchical references use the `$hier{node_path.property}` syntax to access results from other nodes:

```
"Based on the analysis: $hier{analyzer_node.outcome.text}"
```

This allows nodes to reference outputs from previously executed nodes.

In the tutorial, hierarchical references are extensively used to pass data between nodes:

```python
prompt=Prompt.with_dad_text(
    text=(
        # ... other content ...
        "## Repository Context\n"
        "$expr{$hier{dynamic_repo_analysis}.outcome.results}\n\n"
        # ... more content ...
    ),
)
```

And in the file operation node:

```python
operations_template=ObjectTemplate(
    expression="$expr{ $hier{code_generator}.outcome.structured.file_operations }",
),
```

### Python Expressions

For more complex logic, Python expressions can be used with `$expr{py: python_code}`:

```
"Files found: $expr{py: len($hier{repo_analysis}.outcome.structured.files)}"
```

This enables the full power of Python within templates.

## Component Variables

Component variables are a powerful feature of the DAD framework that allow you to define variables at the component
level (like a flow) and access them from any node within that component. This promotes code reusability and cleaner
organization.

To define component variables for a flow:

```python
implementation_flow = FlowDefinition()

implementation_flow.vars(
    {
        "task_spec": task_spec,
    }
)
```

These variables can then be accessed in any node using expressions:

```python
prompt=Prompt.with_dad_text(
    text=(
        "Task Specification\n"
        "Task ID: $expr{task_spec.task_id}\n"
        "Description: $expr{task_spec.description}\n\n"
        # ... more content ...
    ),
)
```

Component variables help centralize configuration and make flows more reusable across different contexts.

## Using Templates in Nodes

### AIModelNode Templates

Templates are commonly used in AI model node prompts:

```python
AIModelNode(
    pre_events=[EventType.node_input_required],
    settings=AIModelNodeSettings(
        models=["claude-3-7-sonnet", "gpt-4.1"],
        system_instructions=[
            "You are a $var{role} specialized in $var{domain}.",
        ],
        prompt=Prompt.with_dad_text(
            text=(
                "## Task Description\n"
                "$var{task_description}\n\n"
                "## Repository Context\n"
                "$expr{$hier{dynamic_repo_analysis}.outcome.results}\n\n"
                "## Implementation Requirements\n"
                "1. Generate precise file operations that can be executed programmatically\n"
            ),
            variables={
                "task_description": "Generate a README file"
            }
        ),
    ),
)
```

### FileOperationNode Templates

Templates are used in file operation nodes to specify operations:

```python
FileOperationNode(
    settings=FileOperationNodeSettings(
        base_directory=global_data_directory,
        operations_template=ObjectTemplate(
            expression="$expr{ $hier{code_generator}.outcome.structured.file_operations }",
        ),
        stage=True,
        commit=True,
        commit_message="$var{run_id}: Auto generated.",
    ),
)
```

### FolderAnalyzerNode Templates

Templates can be used in folder analyzer settings:

```python
FolderAnalyzerNode(
    settings=FolderAnalyzerSettings(
        base_directory="$var{run_root}/global_data",
        operations_template=ObjectTemplate(
            expression="$expr{task_spec.required_context}",
        ),
    ),
)
```

## Advanced Templating Features

### Conditional Templates

Conditional logic can be implemented using Python expressions:

```python
"$expr{py: 'High priority' if priority > 8 else 'Normal priority'}"
```

### List Comprehensions

Lists can be manipulated using comprehensions:

```python
"Files: $expr{py: ', '.join([f.name for f in $hier{analysis}.outcome.structured.files if f.size > 1000])}"
```

### JSON Processing

JSON data can be extracted and manipulated:

```python
"$expr{py: json.loads($hier{api_call}.outcome.text)['results'][0]['title']}"
```

## Variable Resolution

When resolving variables, the templating system follows this order:

1. Variables explicitly provided in the template definition
2. Variables provided through input handlers
3. Component variables from the flow or agent
4. Variables from the execution context
5. Default values if specified

```python
# Variable with a default value
"$var{threshold:0.75}"

# Variable with type conversion
"$var{count:int}"
```

## Best Practices

### Template Organization

1. **Maintain Readability**: Format complex templates for readability
2. **Modularize**: Break complex templates into smaller pieces
3. **Document Variables**: Document expected variables and their formats
4. **Error Handling**: Include fallbacks for missing variables

### Performance Considerations

1. **Avoid Deep Nesting**: Deeply nested templates can be slower to render
2. **Lazy Evaluation**: Use `ObjectTemplate` for values that should be evaluated only when needed
3. **Caching**: Consider caching results of expensive template evaluations

### Security Considerations

1. **Sanitize Inputs**: Be careful with user-provided inputs in templates
2. **Limit Python Expressions**: Consider limiting Python expression capabilities in production
3. **Execution Boundaries**: Respect execution boundaries for hierarchical references

## Debugging Templates

The templating system supports debug mode for troubleshooting:

```python
# Enable debug mode
result = TemplateEngine.render_template(template, variables, debug_mode=True)
```

In debug mode, the engine will print detailed information about variable substitution and expression evaluation.

## Conclusion

The DAD templating system provides a powerful mechanism for creating dynamic, context-aware agent definitions. By
leveraging variable substitution, expression evaluation, hierarchical references, and component variables, templates
enable sophisticated data flow between components while maintaining readability and reusability.
