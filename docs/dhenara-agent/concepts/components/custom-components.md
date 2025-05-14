---
title: Custom Components
---

# Custom Components

## Overview

Dhenara Agent DSL (DAD) is designed to be extensible, allowing you to create custom components that address specific
needs beyond what's provided by the built-in components. This extensibility enables you to tailor DAD to your unique use
cases while maintaining the benefits of the framework's architecture and execution model.

## Why Create Custom Components

There are several reasons to create custom components:

1. **Domain-Specific Functionality**: Implement components that understand your specific domain
2. **Integration with External Systems**: Create nodes that interact with your existing systems
3. **Specialized Processing**: Implement optimized components for specific types of data processing
4. **Unique Workflows**: Define custom flow patterns that match your organization's processes
5. **Enhanced Capabilities**: Add new capabilities to the DAD ecosystem

## Types of Custom Components

You can extend DAD at multiple levels:

### Custom Nodes

Custom nodes are the most common extension point, allowing you to implement new atomic operations.

### Custom Flows

Custom flows enable you to create reusable flow patterns with specialized logic.

### Custom Agents

Custom agents can implement specialized coordination patterns for complex workflows.

## Creating Custom Nodes

To create a custom node, you need to define several components:

### 1. Node Settings Class

Define a settings class that inherits from `NodeSettings`:

```python
from dhenara.agent.dsl.base import NodeSettings
from pydantic import Field

class DatabaseQueryNodeSettings(NodeSettings):
    connection_string: str
    query_template: str
    timeout: int = Field(default=30, description="Query timeout in seconds")
    max_rows: int = Field(default=1000, description="Maximum rows to return")
```

### 2. Node Input/Output Classes

Define input and output classes for your node:

```python
from dhenara.agent.dsl.base import NodeInput, NodeOutput
from typing import Any, Dict, List

class DatabaseQueryNodeInput(NodeInput):
    query_parameters: Dict[str, Any] = Field(default_factory=dict)
    settings_override: DatabaseQueryNodeSettings | None = None

class DatabaseQueryNodeOutput(NodeOutput):
    rows: List[Dict[str, Any]]
    row_count: int
    execution_time: float
```

### 3. Node Definition Class

Create a node definition class that inherits from `NodeDefinition`:

```python
from dhenara.agent.dsl.base import NodeDefinition

class DatabaseQueryNode(NodeDefinition):
    node_type: str = "database_query"  # Unique identifier for this node type
    settings: DatabaseQueryNodeSettings | None = None

    def __init__(self,
                settings: DatabaseQueryNodeSettings | None = None,
                pre_events: list[str] | None = None,
                post_events: list[str] | None = None):
        super().__init__(settings=settings, pre_events=pre_events, post_events=post_events)
```

### 4. Node Executor

Implement a node executor that performs the actual work:

```python
from dhenara.agent.dsl.base import NodeExecutor
import asyncio
import time
import aiosqlite  # Or any async database library

class DatabaseQueryNodeExecutor(NodeExecutor):
    async def execute(self,
                     node_id: str,
                     execution_context: ExecutionContext,
                     node_input: DatabaseQueryNodeInput | None = None) -> NodeExecutionResult:
        # Get settings, merging with overrides if provided
        settings = self.get_settings(execution_context, node_input)

        # Prepare the query with parameters
        query = self.prepare_query(settings.query_template, node_input.query_parameters)

        # Execute the query
        start_time = time.time()
        try:
            async with aiosqlite.connect(settings.connection_string) as db:
                db.row_factory = lambda cursor, row: {col[0]: row[idx] for idx, col in enumerate(cursor.description)}
                async with db.execute(query) as cursor:
                    rows = await cursor.fetchmany(settings.max_rows)
                    row_count = len(rows)
        except Exception as e:
            return NodeExecutionResult.failure(f"Database query failed: {str(e)}")

        execution_time = time.time() - start_time

        # Create output
        output = DatabaseQueryNodeOutput(
            rows=rows,
            row_count=row_count,
            execution_time=execution_time
        )

        # Create outcome for easy access
        outcome = NodeOutcome(
            structured={
                "rows": rows,
                "row_count": row_count,
                "execution_time": execution_time
            }
        )

        return NodeExecutionResult.success(output, outcome)

    def prepare_query(self, query_template: str, parameters: Dict[str, Any]) -> str:
        # Simple parameter replacement - in practice, use proper SQL parameter binding
        result = query_template
        for key, value in parameters.items():
            result = result.replace(f"${key}", str(value))
        return result
```

### 5. Register the Node Type

Register your custom node type with the node executor registry:

```python
from dhenara.agent.dsl.registry import node_executor_registry

# Register the executor for the node type
node_executor_registry.register("database_query", DatabaseQueryNodeExecutor)
```

## Using Custom Nodes

Once registered, you can use your custom node like any built-in node:

```python
# Create a flow with the custom node
data_flow = FlowDefinition()
data_flow.node(
    "user_query",
    DatabaseQueryNode(
        settings=DatabaseQueryNodeSettings(
            connection_string="sqlite:///my_database.db",
            query_template="SELECT * FROM users WHERE age > $min_age LIMIT $limit",
            timeout=60,
            max_rows=500
        ),
        pre_events=[EventType.node_input_required]
    )
)
data_flow.node("result_processor", result_processor_node)

# Create an input handler for the custom node
async def handle_database_input(event: NodeInputRequiredEvent):
    if event.node_id == "user_query":
        event.input = DatabaseQueryNodeInput(
            query_parameters={
                "min_age": 25,
                "limit": 100
            }
        )
        event.handled = True

# Register the handler
run_context.register_node_input_handler(handle_database_input)
```

## Creating Custom Flow Patterns

You can create reusable flow patterns by defining factory functions:

```python
def create_data_processing_flow(data_source: str, processing_type: str) -> FlowDefinition:
    """Create a standardized data processing flow."""
    flow = FlowDefinition()

    # Add data source node based on source type
    if data_source == "database":
        flow.node("data_source", DatabaseQueryNode(...))
    elif data_source == "api":
        flow.node("data_source", APIRequestNode(...))
    elif data_source == "file":
        flow.node("data_source", FileReaderNode(...))

    # Add processing nodes based on processing type
    if processing_type == "transform":
        flow.node("processor", DataTransformNode(...))
    elif processing_type == "filter":
        flow.node("processor", DataFilterNode(...))
    elif processing_type == "aggregate":
        flow.node("processor", DataAggregationNode(...))

    # Common result handling
    flow.node("result_formatter", ResultFormatterNode(...))

    return flow

# Use the factory function
db_transform_flow = create_data_processing_flow("database", "transform")
api_filter_flow = create_data_processing_flow("api", "filter")
```

## Creating Custom Agent Patterns

Similarly, you can create factory functions for specialized agent patterns:

```python
def create_etl_agent(source_config: dict, transform_config: dict, load_config: dict) -> AgentDefinition:
    """Create an ETL (Extract, Transform, Load) agent."""
    agent = AgentDefinition()

    # Create extraction flow
    extract_flow = create_extraction_flow(source_config)
    agent.flow("extract", extract_flow)

    # Create transformation flow
    transform_flow = create_transformation_flow(transform_config)
    agent.flow("transform", transform_flow)

    # Create loading flow
    load_flow = create_loading_flow(load_config)
    agent.flow("load", load_flow)

    # Sequence the flows
    agent.sequence(["extract", "transform", "load"])

    return agent

# Use the factory function
etl_agent = create_etl_agent(
    source_config={"type": "postgres", "connection_string": "..."},
    transform_config={"operations": ["clean", "normalize", "enrich"]},
    load_config={"destination": "data_warehouse", "mode": "incremental"}
)
```

## Best Practices for Custom Components

1. **Follow the Single Responsibility Principle**: Each component should do one thing well
2. **Document Thoroughly**: Provide clear documentation for your custom components
3. **Ensure Type Safety**: Use Pydantic models to ensure type safety and validation
4. **Handle Errors Gracefully**: Implement proper error handling in custom executors
5. **Write Tests**: Create tests to verify the behavior of your custom components
6. **Consider Reusability**: Design components to be reusable across different contexts
7. **Respect the DAD Component Model**: Follow the same patterns as built-in components

## Advanced Extensions

For advanced use cases, you can extend deeper parts of the DAD framework:

### Custom Template Functions

Extend the template engine with custom functions:

```python
from dhenara.agent.dsl.templates import DADTemplateEngine

# Register a custom function
DADTemplateEngine.register_function(
    "encrypt",
    lambda text, key: some_encryption_function(text, key)
)

# Use in templates
"Encrypted value: $expr{encrypt(value, 'my-key')}"
```

### Custom Event Types

Define custom event types for specialized communication:

```python
from dhenara.agent.dsl.events import BaseEvent, EventType

# Define a custom event type
EventType.custom_approval_required = "custom_approval_required"

# Define the event class
class ApprovalRequiredEvent(BaseEvent):
    event_type: str = EventType.custom_approval_required
    approver: str
    request_details: dict
    approval_status: bool | None = None
    notes: str | None = None

# Register a handler
async def handle_approval(event: ApprovalRequiredEvent):
    # Get approval through UI or API
    approval_result = await get_approval_from_user(event.approver, event.request_details)
    event.approval_status = approval_result.status
    event.notes = approval_result.notes
    event.handled = True

# Register the handler
event_bus.register(EventType.custom_approval_required, handle_approval)
```

By extending DAD with custom components, you can adapt the framework to your specific needs while maintaining the
benefits of its architecture and execution model.
