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
- `run agent implementation`: Specialized command for running implementation flows

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
│  │     ├─ __init__.py  # Python package marker
│  │     ├─ agent.py     # Main agent definition
│  │     ├─ handler.py   # Event handler for the agent
│  │     └─ flows/       # Flow definitions directory
│  │        ├─ __init__.py
│  │        └─ implementation.py
│  ├─ common/            # Shared code
│  │  └─ live_prompts/   # Runtime prompt templates
│  └─ runners/           # Agent runners
│     ├─ __init__.py     # Python package marker
│     ├─ defs.py         # Common runner definitions
│     └─ my_agent.py     # Agent-specific runner
├─ runs/                 # Generated artifacts directory (not tracked in git)
│  └─ global_data/       # Global data directory for context
│     └─ your_repo/      # Context repositories
└─ README.md             # Project documentation
```

This structure is automatically created by the `startproject` command and expanded by the `create agent` command. The
`runs` directory contains artifacts from agent executions and is not tracked in git.

## Run Artifacts Structure

When you run an agent, DAD generates a structured directory of artifacts under the `runs` directory:

```
runs/run_20240515_233729_f3cd51/
├── .trace/                      # Observability data
│   ├── dad_metadata.json        # Run metadata
│   ├── logs.jsonl               # Execution logs
│   ├── metrics.jsonl            # Performance metrics
│   └── trace.jsonl              # Execution trace
├── agent_root_id/               # Root component ID from runner
│   └── flow_id/                 # Flow ID from agent definition
│       ├── node_id_1/           # First node in the flow
│       │   ├── outcome.json     # Node outcome
│       │   └── result.json      # Complete execution result
│       └── node_id_2/           # Second node in the flow
│           ├── outcome.json
│           ├── result.json
│           └── state.json       # For AIModelNode, includes API call details
└── static_inputs/               # Static input files if any
```

This structure enables powerful features like:

1. **Run Resumption**: Using `--previous-run-id` and `--entry-point` to resume from any node
2. **Debugging**: Examining exactly what happened at each step
3. **Tracing**: Following the full execution path with input/output for each node

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

## Node Input Events and Handlers

The DAD CLI supports live user input through a handler system. This is demonstrated in the autocoder agent example where
the handler pattern is used to collect runtime inputs:

```python
from dhenara.agent.dsl import FlowNodeTypeEnum, NodeInputRequiredEvent
from dhenara.agent.utils.helpers.terminal import async_input, get_ai_model_node_input

async def node_input_event_handler(event: NodeInputRequiredEvent):
    if event.node_type == FlowNodeTypeEnum.ai_model_call:
        if event.node_id == "code_generator":
            node_input = await get_ai_model_node_input(node_def_settings=event.node_def_settings)
            task_description = await async_input("Enter your query: ")
            node_input.prompt_variables = {"task_description": task_description}

            event.input = node_input
            event.handled = True
```

This handler is registered in the runner to enable interactive terminal input:

```python
run_context.register_event_handlers(
    handlers_map={
        EventType.node_input_required: node_input_event_handler,
        # Optional Notification events
        EventType.node_execution_completed: print_node_completion,
        EventType.component_execution_completed: print_component_completion,
    }
)
```

## Best Practices

1. **Consistent Command Structure**: Follow the established pattern of command registration
2. **Descriptive Help Text**: Provide clear, concise help for all commands and options
3. **Isolated Async Execution**: Use the `IsolatedExecution` context for running agents
4. **Error Handling**: Implement proper error handling and reporting
5. **User Feedback**: Provide clear feedback about command progress and results
6. **Component Variables**: Use flow-level variables for better code organization
7. **Structured Task Specs**: Define structured task specifications for complex projects

To learn more about extending the CLI with custom commands, see the [Extending the CLI](./extending.md) guide.
