---
title: Extending the CLI
---

# Extending the CLI

## Introduction

The Dhenara Agent DSL CLI is designed to be highly extensible, allowing developers to add custom commands that integrate
seamlessly with the existing command structure. This guide will walk you through the process of extending the CLI with
your own commands.

## Extension Architecture

The DAD CLI follows a modular architecture where each set of related commands is encapsulated in a separate Python
module. These modules are automatically discovered and loaded when the CLI starts.

To extend the CLI, you'll create a new Python module that follows the established command registration pattern.

## Creating a Custom Command Module

### Step 1: Create a New Module

Start by creating a new Python module in the `dhenara/cli/commands/` directory. For example, to add custom analytics
commands, you might create a file named `analytics.py`:

```python
# dhenara/cli/commands/analytics.py
import click
from pathlib import Path
import asyncio

def register(cli):
    """Register the analytics commands with the CLI."""
    cli.add_command(analytics)

@click.group("analytics")
def analytics():
    """Commands for analyzing agent performance and behavior."""
    pass
```

### Step 2: Add Commands to Your Group

Next, add specific commands to your command group:

```python
@analytics.command("performance")
@click.argument("agent_id")
@click.option("--runs", default=5, help="Number of recent runs to analyze")
@click.option("--output", type=click.Path(), help="Path to save the report")
def analyze_performance(agent_id, runs, output):
    """Analyze the performance of an agent across recent runs."""
    click.echo(f"Analyzing performance for agent '{agent_id}' across {runs} runs...")
    # Implementation code here
    if output:
        click.echo(f"Report saved to {output}")
    else:
        click.echo("Performance analysis complete")

@analytics.command("patterns")
@click.argument("agent_id")
@click.option("--depth", default=3, help="Depth of pattern analysis")
def analyze_patterns(agent_id, depth):
    """Identify common patterns in agent behavior."""
    click.echo(f"Analyzing behavior patterns for agent '{agent_id}' with depth {depth}...")
    # Implementation code here
```

### Step 3: Implement Async Commands (Optional)

For commands that need to perform asynchronous operations, use an async implementation pattern:

```python
@analytics.command("realtime")
@click.argument("agent_id")
@click.option("--duration", default=60, help="Duration of monitoring in seconds")
def monitor_realtime(agent_id, duration):
    """Monitor agent performance in real-time."""
    click.echo(f"Starting real-time monitoring for agent '{agent_id}'...")
    asyncio.run(_monitor_realtime(agent_id, duration))

async def _monitor_realtime(agent_id, duration):
    """Async implementation of real-time monitoring."""
    # Async implementation code here
    for i in range(duration):
        # Simulate monitoring
        await asyncio.sleep(1)
        click.echo(f"Monitoring... {i+1}/{duration} seconds")
    click.echo("Monitoring complete")
```

## Best Practices for CLI Extensions

### 1. Follow Command Structure Conventions

Maintain consistency with existing commands by following these conventions:

- Use descriptive command and option names
- Provide helpful docstrings that appear in help text
- Group related commands under a common group
- Use appropriate option types and defaults

### 2. Provide Rich User Feedback

Ensure your commands provide appropriate feedback to users:

```python
@click.command()
def my_command():
    with click.progressbar(range(100), label="Processing") as bar:
        for i in bar:
            # Do work
            pass
    click.echo(click.style("Command completed successfully!", fg="green"))
```

### 3. Handle Errors Gracefully

Implement error handling that provides clear messages to users:

```python
import sys

@click.command()
def my_command():
    try:
        # Command implementation
        result = perform_operation()
        click.echo(f"Success: {result}")
    except Exception as e:
        click.echo(click.style(f"Error: {str(e)}", fg="red"), err=True)
        sys.exit(1)
```

### 4. Support Verbose Mode

Implement verbose output for debugging:

```python
@click.command()
@click.option("--verbose", "-v", is_flag=True, help="Enable verbose output")
def my_command(verbose):
    if verbose:
        click.echo("Detailed information: ...")
    # Command implementation
```

### 5. Include Documentation

Ensure your custom commands are well-documented with examples:

```python
@click.command()
@click.argument("input_file")
@click.option("--output", "-o", help="Output file path")
def process_file(input_file, output):
    """Process a file and generate output.

    Example usage:
        dhenara process-file data.json -o results.json
    """
    # Command implementation
```

## Integration with Run Context

Many DAD CLI commands need to interact with the run context. Here's how to access it in your custom commands:

```python
from dhenara.agent.run import RunContext
from pathlib import Path

@click.command()
@click.argument("agent_id")
@click.option("--project-root", help="Project root directory")
def my_command(agent_id, project_root):
    # Initialize run context
    if not project_root:
        project_root = find_project_root()

    run_context = RunContext(
        root_component_id=agent_id,
        project_root=Path(project_root),
    )

    # Use run context
    run_context.setup_run()
    # Command implementation
```

## Example: Creating a Visualization Command

Here's a complete example of adding a visualization command for agent runs:

```python
# dhenara/cli/commands/visualize.py
import click
import asyncio
from pathlib import Path
from dhenara.agent.run import RunContext
from dhenara.agent.observability.visualization import generate_flow_diagram

def register(cli):
    """Register visualization commands."""
    cli.add_command(visualize)

@click.group("visualize")
def visualize():
    """Commands for visualizing agent execution."""
    pass

@visualize.command("flow")
@click.argument("run_id")
@click.option("--project-root", help="Project root directory")
@click.option("--output", "-o", help="Output file path")
@click.option("--format", "-f", type=click.Choice(["svg", "png", "pdf"]), default="svg",
              help="Output format")
def visualize_flow(run_id, project_root, output, format):
    """Generate a visual diagram of a flow execution.

    Example:
        dhenara visualize flow run_20230517_123456 -o flow.svg
    """
    asyncio.run(_visualize_flow(run_id, project_root, output, format))

async def _visualize_flow(run_id, project_root, output, format):
    # Find project root if not specified
    if not project_root:
        project_root = find_project_root()
        if not project_root:
            click.echo("Error: Could not determine project root. Please specify with --project-root")
            return

    # Set default output path if not specified
    if not output:
        output = f"{run_id}_flow.{format}"

    click.echo(f"Generating flow diagram for run {run_id}...")

    try:
        # Generate the diagram
        run_context = RunContext(
            root_component_id="visualization",
            project_root=Path(project_root),
            previous_run_id=run_id
        )

        diagram_path = await generate_flow_diagram(run_context, output, format)
        click.echo(click.style(f"Flow diagram generated at: {diagram_path}", fg="green"))

    except Exception as e:
        click.echo(click.style(f"Error generating diagram: {str(e)}", fg="red"), err=True)

# Helper function to find project root
def find_project_root():
    # Implementation to find project root by looking for .dhenara directory
    current = Path.cwd()
    while current != current.parent:
        if (current / ".dhenara").exists():
            return current
        current = current.parent
    return None
```

## Publishing Your Extension

There are several ways to make your CLI extension available:

### 1. Include in Your Project

For project-specific commands, add your module to the project's command directory.

### 2. Installable Package

Create a separate Python package that developers can install alongside DAD:

```python
# setup.py example for a CLI extension package
from setuptools import setup, find_packages

setup(
    name="dhenara-cli-analytics",
    version="0.1.0",
    packages=find_packages(),
    entry_points={
        "dhenara.cli.plugins": [
            "analytics=dhenara_cli_analytics:register",
        ],
    },
    install_requires=[
        "dhenara",
        "click",
        # Other dependencies
    ],
)
```

### 3. Contribute to Core

For broadly useful commands, consider contributing them to the core DAD project by submitting a pull request.

## Conclusion

Extending the DAD CLI allows you to customize and enhance the functionality to meet your specific needs. By following
the established patterns and best practices, you can create seamless extensions that integrate with the existing command
structure while adding powerful new capabilities.
