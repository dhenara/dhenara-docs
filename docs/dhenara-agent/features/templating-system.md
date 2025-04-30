---
title: Templating System
---

# Templating System

## Overview

The Dhenara Agent DSL (DAD) templating system is a powerful feature that enables dynamic content generation, variable substitution, and complex expression evaluation within agent definitions. This document explains the capabilities of the templating system and best practices for effective usage.

## Core Concepts

The DAD templating system operates on several key concepts:

1. **Variable Substitution**: Replace placeholders with variable values
2. **Expression Evaluation**: Evaluate expressions within templates
3. **Hierarchical References**: Access outputs from other nodes in the flow
4. **Conditional Logic**: Include conditional sections based on expression results

## Template Syntax

The templating system uses a distinctive syntax for different operations:

### Variable Substitution

Variable substitution uses the `$var{name}` syntax to replace placeholders with values:

```
"Generate code in $var{language} to implement $var{feature}"
```

When rendered, this replaces `$var{language}` and `$var{feature}` with their respective values.

### Expression Evaluation

Expression evaluation uses the `$expr{expression}` syntax to compute values:

```
"This will take $expr{processing_time * 2} minutes to complete"
```

Expressions can include basic arithmetic, string operations, and more complex operations.

### Hierarchical References

Hierarchical references use the `$hier{node_path.property}` syntax to access results from other nodes:

```
"Based on the analysis: $hier{analyzer_node.outcome.text}"
```

This allows nodes to reference outputs from previously executed nodes.

### Python Expressions

For more complex logic, Python expressions can be used with `$expr{py: python_code}`:

```
"Files found: $expr{py: len($hier{repo_analysis}.outcome.structured.files)}"
```

This enables the full power of Python within templates.

## Using Templates in Nodes

### AIModelNode Templates

Templates are commonly used in AI model node prompts:

```python
AIModelNode(
    resources=ResourceConfigItem.with_models("claude-3-7-sonnet"),
    settings=AIModelNodeSettings(
        system_instructions=[
            "You are a $var{role} specialized in $var{domain}.",
        ],
        prompt=Prompt.with_dad_text(
            text=(
                "Based on the following repository analysis:\n\n"
                "$hier{repo_analysis}.outcome.structured\n\n"
                "Implement a $var{feature_type} feature for $var{target_component}"
            ),
            variables={
                "feature_type": "search",
                "target_component": "user dashboard"
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
        base_directory=repo_dir,
        operations_template=ObjectTemplate(
            expression="$hier{code_generator}.outcome.structured.file_operations"
        ),
        commit_message="$var{run_id}: Implemented $var{feature_name}",
    ),
)
```

### FolderAnalyzerNode Templates

Templates can be used in folder analyzer settings:

```python
FolderAnalyzerNode(
    settings=FolderAnalyzerSettings(
        base_directory="$var{repo_dir}",
        operations=[
            FolderAnalysisOperation(
                operation_type="analyze_folder",
                path="$var{target_dir}",
                include_patterns=["*.py", "*.md"],
                exclude_patterns=["__pycache__"],
            )
        ],
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
3. Variables from the execution context
4. Default values if specified

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

The DAD templating system provides a powerful mechanism for creating dynamic, context-aware agent definitions. By leveraging variable substitution, expression evaluation, and hierarchical references, templates enable sophisticated data flow between components while maintaining readability and reusability.