---
title: CLI Commands
---

# CLI Commands

## Introduction

This document provides a comprehensive reference for the Dhenara Agent DSL CLI commands, including their options,
arguments, and usage examples. The DAD CLI offers a wide range of commands for working with agents, from project
creation to execution and monitoring.

## Command Categories

DAD CLI commands are organized into several categories:

- **Project Commands**: For creating and managing projects
- **Agent Commands**: For creating and running agents
- **Output Commands**: For managing execution outputs
- **Observability Commands**: For monitoring and debugging
- **Deployment Commands**: For deploying agents to different environments

## Project Commands

### `startproject`

Creates a new DAD project with the necessary directory structure and configuration files.

```bash
dhenara startproject [OPTIONS] PROJECT_NAME
```

**Arguments:**

- `PROJECT_NAME`: Name of the project to create

**Options:**

- `--directory, -d TEXT`: Directory where the project should be created (default: current directory)
- `--template TEXT`: Template to use for the project (default: standard)

**Example:**

```bash
dhenara startproject my-agent-project --directory ~/projects
```

## Agent Commands

### `create agent`

Creates a new agent within an existing DAD project.

```bash
dhenara create agent [OPTIONS] IDENTIFIER [NAME]
```

**Arguments:**

- `IDENTIFIER`: Unique identifier for the agent (used in code)
- `NAME`: Human-readable name for the agent (optional)

**Options:**

- `--template TEXT`: Template to use for the agent (default: standard)
- `--project-root TEXT`: Root directory of the project (default: auto-detected)

**Example:**

```bash
dhenara create agent code-reviewer "Code Review Assistant"
```

### `run agent`

Executes an agent in an isolated environment.

```bash
dhenara run agent [OPTIONS] IDENTIFIER
```

**Arguments:**

- `IDENTIFIER`: Identifier of the agent to run

**Options:**

- `--project-root TEXT`: Root directory of the project (default: auto-detected)
- `--previous-run-id TEXT`: ID of a previous run to use as a base
- `--start-path TEXT`: Hierarchical path to start execution from (e.g., 'agent_id/flow_id/node_id')

**Example:**

```bash
dhenara run agent code-reviewer --previous-run-id run_20230615_123456
```

## Output Commands

### `outputs list`

Lists all available run outputs for a project.

```bash
dhenara outputs list [OPTIONS]
```

**Options:**

- `--project-root TEXT`: Root directory of the project (default: auto-detected)
- `--agent-id TEXT`: Filter outputs by agent ID
- `--limit INTEGER`: Maximum number of outputs to list (default: 10)

**Example:**

```bash
dhenara outputs list --agent-id code-reviewer --limit 5
```

### `outputs compare`

Compares outputs from different runs.

```bash
dhenara outputs compare [OPTIONS] RUN_ID_1 RUN_ID_2
```

**Arguments:**

- `RUN_ID_1`: ID of the first run to compare
- `RUN_ID_2`: ID of the second run to compare

**Options:**

- `--project-root TEXT`: Root directory of the project (default: auto-detected)
- `--output-format [text|html|json]`: Format for comparison output (default: text)

**Example:**

```bash
dhenara outputs compare run_20230615_123456 run_20230616_234567 --output-format html
```

### `outputs checkout`

Checks out a specific run output, allowing for inspection or reuse.

```bash
dhenara outputs checkout [OPTIONS] RUN_ID
```

**Arguments:**

- `RUN_ID`: ID of the run to checkout

**Options:**

- `--project-root TEXT`: Root directory of the project (default: auto-detected)
- `--output-dir TEXT`: Directory to checkout the output to (default: ./run_output)

**Example:**

```bash
dhenara outputs checkout run_20230615_123456 --output-dir ./analysis
```

## Implementation Commands

### `run agent implementation`

Runs a specialized implementation flow for code generation and changes.

```bash
dhenara run agent implementation [OPTIONS] TASK_FILE
```

**Arguments:**

- `TASK_FILE`: Path to a file containing the task description

**Options:**

- `--project-root TEXT`: Root directory of the project (default: auto-detected)
- `--model TEXT`: AI model to use for implementation (default: claude-3-7-sonnet)
- `--no-commit`: Don't commit changes to version control

**Example:**

```bash
dhenara run agent implementation tasks/feature-123.md --model gpt-4.1
```

## Command Implementation Examples

Here's an example of how a command is implemented in the DAD CLI:

```python
@run.command("agent")
@click.argument("identifier")
@click.option("--project-root", default=None, help="Project repo root")
@click.option(
    "--previous-run-id",
    default=None,
    help="ID of a previous run to use as a base for this run",
)
@click.option(
    "--start-path",
    default=None,
    help="Hierarchical path to start execution from (e.g., 'agent_id/flow_id/node_id')",
)
def run_agent(identifier, project_root, previous_run_id, start_path):
    """Run an agent with the specified identifier."""
    # Uses asyncio to run the async implementation
    asyncio.run(
        _run_agent(
            identifier=identifier,
            project_root=project_root,
            previous_run_id=previous_run_id,
            start_hierarchy_path=start_path,
        )
    )
```

The pattern typically includes:

1. Command declaration with Click decorators
2. Arguments and options with help text
3. Synchronous wrapper function that calls into async implementation
4. Detailed implementation in a separate async function

## Getting Help

For any command, you can append `--help` to see detailed information about its usage:

```bash
dhenara run agent --help
```

This will display all available options, arguments, and a brief description of what the command does.
