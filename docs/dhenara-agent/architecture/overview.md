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
|  |  |   Agent    | |   Agent    |   |  |
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
- **Component Variables**: Variables defined at the component level accessible to all nodes within that component

This DSL is expressed through Python classes and methods but maintains a clear, domain-specific structure.

### 2. Component System

The component system includes:

- **ComponentDefinition**: Base class for defining components
- **FlowDefinition**: Defines a directed flow of nodes
- **AgentDefinition**: Higher-level component that can coordinate multiple flows
- **Component Execution**: The runtime mechanisms for executing components
- **Component Variables**: Shared configuration and state accessible to all nodes within a component

### 3. Node System

Nodes are the fundamental execution units in DAD:

- **Node Types**: Pre-defined node types for common operations (AI models, file operations, folder analysis, etc.)
- **Node Settings**: Configuration options for each node type
- **Node Inputs/Outputs**: Typed data flowing between nodes
- **Node Execution**: Runtime execution of node operations
- **Node Events**: Triggers for node input and completion events

Common node types include:

- **AIModelNode**: For interacting with AI models through various providers
- **FileOperationNode**: For creating, deleting, or manipulating files
- **FolderAnalyzerNode**: For analyzing project directories to provide context
- **CommandNode**: For executing shell commands

### 4. Run System

The run system manages execution contexts and environments:

- **RunContext**: Tracks execution state, directories, and artifacts
- **ExecutionContext**: Manages the context of a specific execution
- **IsolatedExecution**: Provides isolation between different runs
- **RunEnvParams**: Encapsulates run environment parameters
- **Run Artifacts**: Stores inputs, outputs, and intermediate results for analysis and debugging

### 5. Template System

The template system allows for dynamic content generation:

- **Variable Substitution**: Replace `$var{name}` with variable values
- **Expression Evaluation**: Evaluate expressions with `$expr{...}`
- **Hierarchical References**: Access previous results with `$hier{node_id.property}`
- **Python Expressions**: Execute Python code with `$expr{py: ...}`
- **ObjectTemplate**: Create dynamic object structures based on templates

### 6. Event System

The event system enables component communication and user interaction:

- **Event Types**: Predefined event types like `node_input_required` and `node_execution_completed`
- **Event Handlers**: Functions that respond to specific events
- **Event Bus**: Routes events to appropriate handlers
- **User Interaction**: Allows for runtime input collection and decision-making

### 7. Observability Stack

A comprehensive observability system that includes:

- **Tracing**: End-to-end tracing of execution paths
- **Logging**: Detailed logging of operations
- **Metrics**: Collection of performance and operational metrics
- **Artifacts**: Storage of execution inputs, outputs, and intermediate results
- **Dashboards**: Integration with visualization tools (Jaeger, Zipkin)

### 8. Resource Management

Manages AI and computational resources:

- **ResourceConfig**: Configuration for AI models and APIs
- **ResourceRegistry**: Registry of available resources
- **Model Management**: Handling of AI model specifications
- **Multi-Provider Support**: Integration with various AI model providers

## Execution Flow

The overall flow of execution in DAD follows this pattern:

1. **Definition**: Components, flows, and nodes are defined using the DSL

   ```python
   agent = AgentDefinition()
   implementation_flow = FlowDefinition()
   implementation_flow.node("analyzer", FolderAnalyzerNode(...))
   implementation_flow.node("generator", AIModelNode(...))
   agent.flow("main_flow", implementation_flow)
   ```

2. **Initialization**: A RunContext is created to manage the execution environment

   ```python
   run_context = RunContext(
       root_component_id="agent_root",
       project_root=project_root,
   )
   ```

3. **Event Handler Registration**: Event handlers are registered to respond to runtime events

   ```python
   run_context.register_event_handlers(
       handlers_map={
           EventType.node_input_required: node_input_event_handler,
           EventType.node_execution_completed: print_node_completion,
       }
   )
   ```

4. **Execution**: ComponentRunner executes the defined components

   ```python
   runner = AgentRunner(agent, run_context)
   await runner.run()
   ```

5. **Node Processing**: Each node in the flow processes inputs and produces outputs

   - Folder analyzers scan files and extract context
   - AI model nodes make API calls to LLMs with structured prompts
   - File operation nodes apply changes to the file system

6. **Event Handling**: Events are triggered and handled throughout execution

   - Input events prompt for user interaction
   - Completion events signal when operations are finished

7. **Template Processing**: Templates are processed to generate dynamic content

   - Variable references are replaced with their values
   - Expressions are evaluated to produce results
   - Previous node results are accessed via hierarchical references

8. **Artifact Management**: Results and artifacts are stored in a structured format
   - Each run creates a unique run directory with all artifacts
   - Node results are stored for analysis and debugging
   - Tracing information captures the execution flow

## Practical Example: Single-Shot Coding Assistant

The architecture can be demonstrated through a simple single-shot coding assistant that:

1. **Analyzes Folders**: Uses FolderAnalyzerNode to provide code context

   ```python
   implementation_flow.node(
       "dynamic_repo_analysis",
       FolderAnalyzerNode(
           settings=FolderAnalyzerSettings(
               base_directory=global_data_directory,
               operations=[
                   FolderAnalysisOperation(
                       operation_type="analyze_folder",
                       path="project/src",
                       content_read_mode="full",
                   ),
               ],
           ),
       ),
   )
   ```

2. **Generates Code**: Uses AIModelNode to create implementation based on context

   ```python
   implementation_flow.node(
       "code_generator",
       AIModelNode(
           settings=AIModelNodeSettings(
               models=["claude-3-sonnet"],
               prompt=Prompt.with_dad_text(
                   text=(
                       "## Task Description\n"
                       "$var{task_description}"
                       "## Repository Context\n"
                       "$expr{$hier{dynamic_repo_analysis}.outcome.results}\n\n"
                   ),
               ),
               model_call_config=AIModelCallConfig(
                   structured_output=TaskImplementation,
               ),
           ),
       ),
   )
   ```

3. **Executes File Operations**: Uses FileOperationNode to implement changes
   ```python
   implementation_flow.node(
       "file_operations",
       FileOperationNode(
           settings=FileOperationNodeSettings(
               base_directory=global_data_directory,
               operations_template=ObjectTemplate(
                   expression="$expr{ $hier{code_generator}.outcome.structured.file_operations }",
               ),
           ),
       ),
   )
   ```

## Directory Structure

The DAD codebase is organized into these main directories:

- **dhenara/agent/dsl/**: Core DSL definitions and components
- **dhenara/agent/runner/**: Component and execution runners
- **dhenara/agent/run/**: Run context and execution environment
- **dhenara/agent/observability/**: Tracing, logging, and metrics
- **dhenara/agent/types/**: Type definitions
- **dhenara/agent/utils/**: Utility functions and helpers
- **dhenara/agent/config/**: Configuration management

## Integration with Dhenara AI

DAD builds on top of the core Dhenara AI package, which provides:

- **Unified API**: Consistent interface for different LLM providers (OpenAI, Anthropic, etc.)
- **Type-Safe Interfaces**: Strongly typed interactions with AI models
- **Structured Output**: Generation of structured data from LLM responses
- **Resource Configuration**: Simplified configuration for AI models
- **Streaming Support**: Handling of streaming responses from AI models
- **Error Handling**: Robust error handling for API calls

DAD extends these capabilities with the component model, execution system, and observability features to create a
complete agent development framework.

## Extensibility

The architecture is designed for extensibility at multiple levels:

- **Custom Node Types**: Implement new node types for specialized functionality
- **Custom Components**: Define new component types beyond flows and agents
- **Custom Observability**: Extend the observability system with additional collectors
- **Resource Extensions**: Add support for new AI model providers and resource types
- **Event Handlers**: Create custom event handlers for specialized behavior

This modular design allows DAD to grow and adapt to new requirements and use cases while maintaining a consistent
programming model.

## Next Steps

To dive deeper into the architecture, explore:

- [Component Model](component-model): Understand how components are defined and composed
- [Execution Model](execution-model): Learn how components are executed and managed
- [Core Components](../concepts/components/nodes): Explore the built-in node types and their capabilities
