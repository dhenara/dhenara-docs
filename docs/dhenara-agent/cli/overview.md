---
title: CLI Overview
---

# CLI Overview

## Introduction

The Dhenara Agent DSL Command Line Interface (CLI) provides a robust and extensible system for interacting with DAD
agents and projects. It offers an intuitive way to create, run, and manage agents through simple terminal commands.

The CLI is designed with a focus on developer experience, offering rich features while maintaining simplicity and
discoverability. It's an essential tool for developers working with Dhenara Agent DSL, streamlining common workflows and
enabling efficient agent management.

## Architecture

The DAD CLI is built using [Click](https://click.palletsprojects.com/), a Python package for creating beautiful command
line interfaces. The architecture follows a modular design pattern with several key components:

### Main Entry Point

The CLI system is initialized through a main entry point that dynamically discovers and loads command modules:

```python
@click.group()
def cli():
    """Dhenara Agent DSL (DAD) CLI."""
    pass

# Dynamically import all command modules
def load_commands():
    commands_path = Path(__file__).parent / "commands"
    observability_commands_path = Path(__file__).parent.parent / "agent" / "observability" / "cli"

    # Load regular commands
    for _, name, _is_pkg in pkgutil.iter_modules([str(commands_path)]):
        if not name.startswith("_"):  # Skip private modules
            module = importlib.import_module(f"dhenara.cli.commands.{name}")
            if hasattr(module, "register"):
                module.register(cli)

    # Load observability commands
    for _, name, _is_pkg in pkgutil.iter_modules([str(observability_commands_path)]):
        if not name.startswith("_"):  # Skip private modules
            module = importlib.import_module(f"dhenara.agent.observability.cli.{name}")
            if hasattr(module, "register"):
                module.register(cli)
```

### Command Registration Pattern

Each command module implements a `register` function that adds its commands to the main CLI group:

```python
def register(cli):
    cli.add_command(my_command)

@click.command("my-command")
@click.argument("argument")
@click.option("--option", help="Description of the option")
def my_command(argument, option):
    """Command description that appears in the help text."""
    # Command implementation
```

This pattern allows for modular addition of new commands without modifying the core CLI code.

## Command Structure

The DAD CLI organizes commands into logical groups based on functionality:

### Project Initialization

- `startproject`: Creates a new DAD project with the necessary directory structure and configuration files

### Agent Management

- `create agent`: Creates a new agent within an existing project
- `run agent`: Executes an agent in an isolated environment

### Deployment

- `deploy`: Deploys an agent or application to various environments (dev, staging, prod)

### Output Management

- `outputs list`: Lists all available run outputs
- `outputs compare`: Compares outputs from different runs
- `outputs checkout`: Checks out a specific run output

### Observability

- Various commands for viewing and analyzing traces, logs, and metrics

For detailed information about available commands, their options, and usage examples, see the
[Commands Reference](./commands.md).

## Project Structure

The DAD CLI expects projects to follow a specific structure:

```
project-name/
├─ .dhenara/             # Dhenara configuration directory
│  ├─ config.yaml        # Project configuration
│  └─ credentials/       # Credentials for AI models and services
├─ src/                  # Source code directory
│  ├─ agents/            # Agent definitions
│  │  └─ my_agent/       # Individual agent directory
│  │     ├─ agent.py     # Main agent definition
│  │     ├─ flow.py      # Agent flow definitions
│  │     └─ inputs/      # Agent input handlers
│  │        └─ handler.py
│  ├─ common/            # Shared code
│  │  └─ prompts/        # Reusable prompts
│  └─ runners/           # Agent runners
│     ├─ defs.py         # Common runner definitions
│     └─ my_agent.py     # Agent-specific runner
└─ README.md             # Project documentation
```

This structure is automatically created by the `startproject` command and expanded by the `create agent` command.

## Templates System

The CLI utilizes a templates system for generating boilerplate code when creating projects and agents:

```python
template_dir = Path(__file__).parent.parent / "templates" / "agent"
runner_template_dir = Path(__file__).parent.parent / "templates" / "runner"

# Copy and customize templates
for template_file in template_dir.glob("*"):
    if template_file.is_file():
        target_file = agent_dir / template_file.name
        with open(template_file) as src, open(target_file, "w") as dst:
            content = src.read()
            # Replace placeholders
            content = content.replace("{{agent_identifier}}", agent_identifier)
            content = content.replace("{{agent_name}}", name)
            dst.write(content)
```

The templates include:

1. **Agent Templates**: Basic agent structure with flow definitions and input handlers
2. **Runner Templates**: Runner configurations for executing agents

## Best Practices

1. **Consistent Command Structure**: Follow the established pattern of command registration
2. **Descriptive Help Text**: Provide clear, concise help for all commands and options
3. **Isolated Async Execution**: Use the `IsolatedExecution` context for running agents
4. **Error Handling**: Implement proper error handling and reporting
5. **User Feedback**: Provide clear feedback about command progress and results

To learn more about extending the CLI with custom commands, see the [Extending the CLI](./extending.md) guide.
