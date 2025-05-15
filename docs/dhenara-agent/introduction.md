# Introduction

## What is Dhenara Agent DSL?

Dhenara Agent DSL (DAD) is a powerful open-source framework for creating, orchestrating, and managing AI agents. It provides a type-safe, expressive Domain-Specific Language that makes building complex AI agent workflows as straightforward as writing code.


## Key Features

####  Component-Based Architecture
- **Modular Design**: Build agents from reusable components (nodes, flows, and agents)
- **Hierarchical Structure**: Organize complex logic with clear parent-child relationships
- **Mix & Match**: Combine different node types to create powerful workflows

####  Complete Agent Lifecycle Management
- **Create, Run, Rerun**: Manage the entire agent lifecycle from a single framework
- **Advanced Run Controls**: Resume execution from any node to save time and money
- **Artifact Management**: Automatically track all inputs, outputs, and intermediate results

####  Free Built-in Observability
- **OpenTelemetry Integration**: Get comprehensive tracing out of the box
- **Open Source Visualization**: Use Jaeger, Zipkin, or custom dashboards at no cost
- **Structured Logging**: Debug effectively with context-rich logs

####  Smart Cost Management
- **Test Mode**: Develop and test without making actual API calls
- **Rerun Capability**: Avoid repeating expensive LLM calls when resuming execution
- **Provider Switching**: Easily switch between different AI providers to optimize costs

####  Event-Driven Communication
- **Event System**: Enable loose coupling between components
- **Runtime Interaction**: Request and process user input during execution
- **Custom Event Handlers**: Implement specialized behaviors for different events

####  Built for Developers
- **Intuitive CLI**: Create and run agents with simple commands
- **VS Code + Git Workflow**: No proprietary platforms or subscriptions needed
- **Isolated Async Runs**: Run agents in isolated environments with a single command
## Core Concepts

### Basic Elements

DAD uses a hierarchical component model that allows for composition and reuse. It is built around three primary types of components:

- **Execution Nodes**: Atomic execution units that perform specific functions. Examples include:
  - **AIModelNode**: Makes calls to large language models with customizable settings
  - **FileOperationNode**: Performs file system operations like creating/updating/deleting files
  - **FolderAnalyzerNode**: Analyzes directories and files to provide context for LLMs
  - **CommandNode**: Executes shell commands

- **Execution Flows**: Collections of nodes or sub-flows with execution logic, supporting sequential execution, conditionals, and loops

- **Agents**: Higher-level abstractions that can contain flows and other agents, representing complete functional units

### Component Variables

DAD supports defining variables at the component level that can be accessed by all nodes within that component. This enables:
- Sharing configuration across multiple nodes
- Making flows more reusable with different variable values
- Clean separation of configuration from flow logic

### Powerful Template Engine

DAD includes a robust template engine that supports:
- Variable substitution using `$var{variable_name}` syntax
- Expressions with `$expr{...}` for dynamic content generation
- Hierarchical references with `$hier{node_id}` to access outputs from other nodes

### Execution Model

The execution follows a hierarchical structure:
1. Components (Agents or Flows) define the overall structure
2. Nodes within components perform specific tasks
3. A RunContext manages the execution environment, including:
   - Unique run IDs for each execution
   - Artifact storage for results and intermediary outputs
   - Support for rerunning flows from specific points
4. Tracing, logging, and metrics provide visibility into execution

## Example: A Simple Chatbot

```python
from dhenara.agent.dsl import (
    AIModelNode, AIModelNodeSettings,
    EventType, FlowDefinition,
)
from dhenara.ai.types import AIModelCallConfig, Prompt

# Create a flow
main_flow = FlowDefinition()

# Add a node that processes user input
main_flow.node(
    "user_query_processor",
    AIModelNode(
        pre_events=[EventType.node_input_required],  # Request input at runtime
        settings=AIModelNodeSettings(
            models=["claude-3-5-haiku", "gpt-4.1-nano"],  # Multiple model options
            system_instructions=["You are a helpful assistant."],
            prompt=Prompt.with_dad_text("$var{user_query}"),  # Dynamic prompt
            model_call_config=AIModelCallConfig(test_mode=False),
        ),
    ),
)

# Add a second node that generates a title
main_flow.node(
    "title_generator",
    AIModelNode(
        settings=AIModelNodeSettings(
            models=["gpt-4o-mini"],
            system_instructions=["You generate concise titles."],
            # Reference previous node's output
            prompt=Prompt.with_dad_text(
                "Summarize in plain text under 60 characters. $expr{ $hier{user_query_processor}.outcome.text }",
            ),
        ),
    ),
)
```

When you run this agent with `dhenara run agent chatbot`, you'll be prompted to select a model and enter your query. The system will handle execution, save all artifacts, and provide comprehensive tracing—all with minimal code.

## See DAD in Action

Explore our [Getting Started guide](./getting-started/installation.md) and check out the [Single-Shot Coding Assistant tutorial](./guides/tutorials/single-shot-coder/index.md) to see DAD's power in a practical application.

## Join the Community

- **GitHub**: Star us and contribute at [github.com/dhenara/dhenara-agent](https://github.com/dhenara/dhenara-agent)
- **Discord**: Join our community at [discord.gg/dhenara](https://discord.gg/dhenara)
- **Twitter**: Follow us [@DhenaraHQ](https://twitter.com/DhenaraHQ) for updates

Start building powerful AI agents today with Dhenara Agent DSL!
