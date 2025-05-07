---
title: Introduction
---

# Introduction

## Overview

Dhenara Agent DSL (DAD) is an open-source framework built on top of the `dhenara-ai` Python package. It provides a powerful, expressive, and type-safe domain-specific language (DSL) for defining and executing AI agent workflows. DAD makes it easier to create, compose, and orchestrate AI agents with sophisticated behaviors, while maintaining robust observability and reproducibility.

## What is Dhenara Agent DSL?

At a high level, Dhenara Agent DSL (dhenara-agent) is an AI agent framework with a strong focus on:

1. **Expressive Agent Definition**: Create complex agent workflows using a straightforward, programming language-like approach
2. **Component-Based Architecture**: Compose reusable components to build sophisticated agent systems
3. **Out-of-the-box Support for Multiple LLMs**: Switch between different LLM models on the fly
4. **Comprehensive Observability**: Built-in logging, tracing, and metrics collection for all agent activities
5. **Reproducible Execution**: Track and replay agent execution through a run context system
6. **Extensible Node System**: Easily create custom node types to extend functionality
7. **Resource Management**: Flexible management of AI model resources and credentials

## Key Features

- **Expressive Agent Definition**: Create complex agent workflows using a straightforward, programming language-like approach
- **Component-Based Architecture**: Compose reusable components to build sophisticated agent systems
- **Comprehensive Observability**: Built-in logging, tracing, and metrics collection for all agent activities
- **Reproducible Execution**: Track and replay agent execution through a run context system
- **Extensible Node System**: Easily create custom node types to extend functionality
- **Resource Management**: Flexible management of AI model resources and credentials

### Hierarchical Component Model

DAD uses a hierarchical component model that allows for composition and reuse:

- **Nodes**: Atomic execution units that perform specific functions (e.g., making an LLM API call, analyzing a folder, performing file operations)
- **Flows**: Collections of nodes with execution logic, supporting sequential execution, conditionals, and loops
- **Agents**: Higher-level abstractions that can contain flows and other agents, representing complete functional units

### Event-Driven Architecture

An event system enables loose coupling between components, allowing agents to react to events, request inputs, and communicate with each other without tight coupling.

### Powerful Template Engine

A powerful template engine supports variable substitution, expressions, and hierarchical references, making it easy to build dynamic prompts and process responses:

## Core Concepts

DAD is built around three primary types of components:

### Components

- **Nodes**: Atomic units of execution that perform specific tasks like calling AI models, analyzing files, or performing file operations
- **Flows**: Collections of nodes with execution logic, supporting sequential execution, conditionals, and loops
- **Agents**: Higher-level components that coordinate multiple flows and other agents

### Execution Model

The execution follows a hierarchical structure:

1. Components (Agents or Flows) define the overall structure
2. Nodes within components perform specific tasks
3. A RunContext manages the execution environment
4. Tracing, logging, and metrics provide visibility into execution

### Resource Management

DAD provides a flexible system for managing AI model resources and API credentials, making it easier to work with different LLM providers and models.

## Basic Example

Here's a simple example of defining a flow using DAD:

```python
from dhenara.agent.dsl import (
    AIModelNode,
    AIModelNodeSettings,
    FlowDefinition,
    ResourceConfigItem,
)
from dhenara.ai.types import Prompt

# Define a flow
my_flow = FlowDefinition()

# Add an AI model node to the flow
my_flow.node(
    "question_answerer",
    AIModelNode(
        resources=ResourceConfigItem.with_model("claude-3-5-haiku"),
        settings=AIModelNodeSettings(
            system_instructions=["You are a helpful assistant."],
            prompt=Prompt.with_dad_text("Answer the following question: $var{question}"),
        ),
    ),
)
```

This example defines a simple flow with a single AI model node that uses Claude 3.5 Haiku to answer a question.
