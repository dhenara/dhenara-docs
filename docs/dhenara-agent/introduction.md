---
title: Introduction
---

# Introduction

## Overview

Dhenara Agent DSL (DAD) is an open-source framework built on top of the `dhenara-ai` Python package. It provides a
powerful, expressive, and type-safe domain-specific language (DSL) for defining and executing AI agent workflows. DAD
makes it easier to create, compose, and orchestrate AI agents with sophisticated behaviors, while maintaining robust
observability and reproducibility.

## What is Dhenara Agent DSL?

Dhenara Agent DSL or DAD (available as a Python package named `dhenara-agent`) is an AI agent framework with a strong
focus on:

1. **Expressive Agent Definition**: Create complex agent workflows using a straightforward, programming language-like
   approach
2. **Component-Based Architecture**: Compose reusable components (nodes, flows, agents) to build sophisticated agent
   systems
3. **Out-of-the-box Support for Multiple LLMs**: Switch between different LLM models on the fly with easy model
   selection capabilities at runtime
4. **Comprehensive Observability**: Built-in logging, tracing, and metrics collection for all agent activities using
   OpenTelemetry and open-source exporters like Zipkin and Jaeger
5. **Reproducible Execution**: Track and replay agent execution through a run context system, reducing costs by
   rerunning failed flows without additional AI Model API calls
6. **Extensible Node System**: Easily create custom node types to extend functionality beyond the built-in nodes
7. **Resource Management**: Flexible management of AI model resources and credentials
8. **Powerful Template Engine**: Dynamic prompt generation with variable substitution, expressions, and hierarchical
   references
9. **Event-Driven Architecture**: Enables loose coupling between components with support for event handling
10. **Structured Output Handling**: Seamless integration with Pydantic models for type-safe structured outputs from LLMs

## Core Concepts

### Basic Elements

DAD uses a hierarchical component model that allows for composition and reuse. It is built around three primary types of
components:

- **Execution Nodes**: Atomic execution units that perform specific functions. Examples include:

  - **AIModelNode**: Makes calls to large language models with customizable settings
  - **FileOperationNode**: Performs file system operations like creating/updating/deleting files
  - **FolderAnalyzerNode**: Analyzes directories and files to provide context for LLMs
  - **CommandNode**: Executes shell commands

- **Execution Flows**: Collections of nodes or sub-flows with execution logic, supporting sequential execution,
  conditionals, and loops

- **Agents**: Higher-level abstractions that can contain flows and other agents, representing complete functional units

### Component Variables

DAD supports defining variables at the component level that can be accessed by all nodes within that component. This
enables:

- Sharing configuration across multiple nodes
- Making flows more reusable with different variable values
- Clean separation of configuration from flow logic

### Event-Driven Architecture

An event system enables loose coupling between components, allowing agents to react to events, request inputs, and
communicate with each other without tight coupling. Common events include:

- **node_input_required**: Used when a node needs user input before execution
- **node_execution_completed**: Triggered when a node completes execution

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

### Resource Management

DAD provides a flexible system for managing AI model resources and API credentials, making it easier to work with
different LLM providers and models. It supports:

- Test mode for development without making actual API calls
- Easy switching between models at runtime
- Credential management with environment variables or configuration files

## Basic Example

Here's a simple example of defining a flow using DAD:

```python
from dhenara.agent.dsl import (
    AIModelNode,
    AIModelNodeSettings,
    FlowDefinition,
    EventType,
)
from dhenara.ai.types import Prompt, AIModelCallConfig
from pydantic import BaseModel, Field

# Define a structured output type
class QuestionAnswer(BaseModel):
    answer: str = Field(..., description="The answer to the user's question")
    confidence: float = Field(..., description="Confidence score between 0 and 1")

# Define a flow
my_flow = FlowDefinition()

# Add an AI model node to the flow
my_flow.node(
    "question_answerer",
    AIModelNode(
        pre_events=[EventType.node_input_required],  # Allow runtime input
        settings=AIModelNodeSettings(
            models=["claude-3-5-haiku", "gpt-4"],  # Support any models
            system_instructions=["You are a helpful assistant."],
            prompt=Prompt.with_dad_text("Answer the following question: $var{question}"),
            model_call_config=AIModelCallConfig(
                structured_output=QuestionAnswer,
                reasoning=True,
            ),
        ),
    ),
)
```

With this definition, you can create a simple question-answering agent that allows the user to input a question at
runtime and select from available models. The LLM will return a structured response with an answer and confidence score.

## Learn More

To learn more about using DAD, check out our [Getting Started guide](./getting-started/installation.md) and explore the
[Tutorials](./guides/tutorials/index.md), including the
[Single-Shot Coding Assistant](./guides/tutorials/single-shot-coder/index.md) which demonstrates building a practical
agent that can generate and implement code changes.
