---
sidebar_position: 1
---

# Architecture Overview

Dhenara Agent DSL (DAD) implements a sophisticated architecture designed for flexibility, observability, and
reproducibility in AI agent operations. This document provides a high-level overview of the architecture and its key
components.

## Architectural Principles

DAD's architecture is built around several key principles:

1. **Component-Based Design**: Everything is a component, allowing for modular composition
2. **Separation of Concerns**: Clear separation between definition and execution
3. **Hierarchical Composition**: Components can contain other components
4. **Event-Driven Communication**: Components communicate through events
5. **Observability First**: Built-in tracing, logging, and metrics
6. **Reproducibility**: Deterministic execution with proper isolation

## System Architecture

```
+----------------------------------------+
|   Dhenara Agent DSL (DAD)              |
+----------------------------------------+
|                                        |
|  +----------------------------------+  |
|  |          Agent Platform          |  |
|  |                                  |  |
|  |  +------------+ +------------+   |  |
|  |  |   Agent 1  | |   Agent 2  |   |  |
|  |  +------------+ +------------+   |  |
|  |          |            |          |  |
|  |  +------------+ +------------+   |  |
|  |  |   Flows    | |   Flows    |   |  |
|  |  +------------+ +------------+   |  |
|  |          |            |          |  |
|  |  +------------+ +------------+   |  |
|  |  |   Nodes    | |   Nodes    |   |  |
|  |  +------------+ +------------+   |  |
|  |                                  |  |
|  +----------------------------------+  |
|                    |                   |
|  +----------------------------------+  |
|  |           Event System           |  |
|  +----------------------------------+  |
|                    |                   |
|  +----------------------------------+  |
|  |        Execution Context         |  |
|  +----------------------------------+  |
|                    |                   |
|  +----------------------------------+  |
|  |       Template Processing        |  |
|  +----------------------------------+  |
|                    |                   |
|  +----------------------------------+  |
|  |           Core Dhenara-AI        |  |
|  +----------------------------------+  |
|                                        |
+----------------------------------------+
```

## Core Architectural Components

### 1. Domain-Specific Language (DSL)

The heart of DAD is a declarative DSL that allows you to define:

- **Components**: High-level constructs like agents and flows
- **Nodes**: Individual execution units with specific functionality
- **Connections**: How data flows between nodes
- **Settings**: Configuration for components and nodes

This DSL is expressed through Python classes and methods but maintains a clear, domain-specific structure.

### 2. Component System

The component system includes:

- **ComponentDefinition**: Base class for defining components
- **FlowDefinition**: Defines a directed flow of nodes
- **AgentDefinition**: Higher-level component that can coordinate multiple flows
- **Component Execution**: The runtime mechanisms for executing components

### 3. Node System

Nodes are the fundamental execution units in DAD:

- **Node Types**: Pre-defined node types for common operations (AI models, file operations, etc.)
- **Node Settings**: Configuration options for each node type
- **Node Inputs/Outputs**: Typed data flowing between nodes
- **Node Execution**: Runtime execution of node operations

### 4. Run System

The run system manages execution contexts and environments:

- **RunContext**: Tracks execution state, directories, and artifacts
- **ExecutionContext**: Manages the context of a specific execution
- **IsolatedExecution**: Provides isolation between different runs
- **RunEnvParams**: Encapsulates run environment parameters

### 5. Observability Stack

A comprehensive observability system that includes:

- **Tracing**: End-to-end tracing of execution paths
- **Logging**: Detailed logging of operations
- **Metrics**: Collection of performance and operational metrics
- **Dashboards**: Integration with visualization tools (Jaeger, Zipkin)

### 6. Resource Management

Manages AI and computational resources:

- **ResourceConfig**: Configuration for AI models and APIs
- **ResourceRegistry**: Registry of available resources
- **Model Management**: Handling of AI model specifications

## Execution Flow

The overall flow of execution in DAD follows this pattern:

1. **Definition**: Components, flows, and nodes are defined using the DSL
2. **Initialization**: A RunContext is created to manage the execution environment
3. **Execution**: ComponentRunner executes the defined components
4. **Node Processing**: Each node in the flow processes inputs and produces outputs
5. **Observation**: All operations are traced, logged, and measured
6. **Artifact Management**: Results and artifacts are stored in a structured format

## Directory Structure

The DAD codebase is organized into these main directories:

- **dhenara/agent/dsl/**: Core DSL definitions
- **dhenara/agent/runner/**: Component and execution runners
- **dhenara/agent/run/**: Run context and execution environment
- **dhenara/agent/observability/**: Tracing, logging, and metrics
- **dhenara/agent/types/**: Type definitions
- **dhenara/agent/utils/**: Utility functions and helpers
- **dhenara/agent/config/**: Configuration management

## Integration with Dhenara AI

DAD builds on top of the core Dhenara AI package, which provides:

- Unified API for different LLM providers
- Type-safe interfaces for AI model interactions
- Resource configuration for AI models
- Streaming and async support

DAD extends these capabilities with the component model, execution system, and observability features to create a
complete agent development framework.

## Extensibility

The architecture is designed for extensibility at multiple levels:

- **Custom Node Types**: Implement new node types for specialized functionality
- **Custom Components**: Define new component types beyond flows and agents
- **Custom Observability**: Extend the observability system with additional collectors
- **Resource Extensions**: Add support for new AI model providers and resource types

This modular design allows DAD to grow and adapt to new requirements and use cases while maintaining a consistent
programming model.

## Next Steps

To dive deeper into the architecture, explore:

- [Component Model](component-model): Understand how components are defined and composed
- [Execution Model](execution-model): Learn how components are executed and managed
- [Core Components](../components/nodes): Explore the built-in node types and their capabilities
