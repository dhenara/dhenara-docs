---
title: Event System
---

# Event System

## Overview

The Event System in Dhenara Agent DSL (DAD) provides a robust mechanism for communication between components. It enables
loose coupling, dynamic interactions, and event-driven programming patterns within your agent workflows.

## Core Concepts

The event system is built around several key concepts:

1. **Events**: Typed messages that carry information about occurrences in the system
2. **Event Bus**: Central mechanism for publishing events and routing them to handlers
3. **Event Handlers**: Functions that respond to specific types of events
4. **Event Types**: Categorization of events for proper routing
5. **Event Propagation**: Control over how events flow through the component hierarchy

## Event Types

DAD defines several standard event types:

```python
class EventType:
    # Standard event types
    node_input_required = "node_input_required"  # Node needs input before execution
    node_execution_started = "node_execution_started"  # Node has started execution
    node_execution_completed = "node_execution_completed"  # Node execution completed
    node_execution_failed = "node_execution_failed"  # Node execution failed
    component_execution_started = "component_execution_started"  # Component started
    component_execution_completed = "component_execution_completed"  # Component completed
    component_execution_failed = "component_execution_failed"  # Component failed
    # ... and more
```

You can also define custom event types for specific application needs.

## Event Structure

Events are represented by class instances derived from `BaseEvent`:

```python
class BaseEvent:
    event_type: str  # Type identifier for the event
    # Additional properties depending on event type

class NodeInputRequiredEvent(BaseEvent):
    event_type: str = EventType.node_input_required
    node_id: str  # ID of the node requesting input
    node_type: str  # Type of the node
    execution_context: ExecutionContext  # Current execution context
    input: NodeInput | None = None  # Input to be provided by handler
    handled: bool = False  # Whether the event has been handled
```

## Using the Event Bus

### Registering Handlers

Handlers can be registered to respond to specific event types:

```python
from dhenara.agent.dsl.events import EventType

# Define a handler for node input required events
async def input_handler(event: NodeInputRequiredEvent):
    if event.node_id == "my_node":
        # Provide input for the node
        event.input = MyNodeInput(param="value")
        event.handled = True

# Register the handler with the event bus
event_bus.register(EventType.node_input_required, input_handler)

# Register a wildcard handler for all events
async def logging_handler(event: BaseEvent):
    print(f"Event received: {event.event_type}")

event_bus.register_wildcard(logging_handler)
```

### Publishing Events

Components can publish events to the event bus:

```python
from dhenara.agent.dsl.events import BaseEvent

# Create a custom event
class MyCustomEvent(BaseEvent):
    event_type: str = "my_custom_event"
    data: dict

# Publish the event
event = MyCustomEvent(data={"key": "value"})
await event_bus.publish(event)
```

## Event Handling Patterns

### Sequential Handling

By default, events are processed sequentially by each registered handler:

```python
async def handler1(event):
    print("Handler 1 processing event")
    # Process event

async def handler2(event):
    print("Handler 2 processing event")
    # Process event

event_bus.register("my_event_type", handler1)
event_bus.register("my_event_type", handler2)
```

When a `my_event_type` event is published, both handlers will process it in registration order.

### Cancellation

Some events can be canceled by setting a flag in the event:

```python
async def cancellation_handler(event: CancellableEvent):
    if should_cancel(event):
        event.cancelled = True
        print("Event cancelled")

event_bus.register("cancellable_event", cancellation_handler)
```

### Waiting for Events

You can wait for specific events to occur:

```python
# Create a future to resolve when the event occurs
completion_future = asyncio.Future()

async def completion_handler(event: ComponentExecutionCompletedEvent):
    if event.component_id == "target_component":
        completion_future.set_result(event)

event_bus.register(EventType.component_execution_completed, completion_handler)

# Wait for the event
try:
    event = await asyncio.wait_for(completion_future, timeout=30.0)
    print(f"Component completed with status: {event.status}")
except asyncio.TimeoutError:
    print("Timed out waiting for component completion")
```

## Node Events

Nodes can specify events they want to receive or emit:

```python
# Node that requires input before execution
ai_node = AIModelNode(
    pre_events=[EventType.node_input_required],  # Events before execution
    post_events=[EventType.custom_completion_notification],  # Events after execution
    resources=ResourceConfigItem.with_model("claude-3-7-sonnet"),
    settings=AIModelNodeSettings(...),
)
```

The node executor will automatically emit the specified pre-events before execution and post-events after execution.

## Event Handling in the Run Context

The `RunContext` provides a simplified interface for registering common event handlers:

```python
# Register an input handler in the run context
async def my_input_handler(event: NodeInputRequiredEvent):
    # Handle node input requirements
    ...

run_context.register_node_input_handler(my_input_handler)

# Register a completion handler
async def my_completion_handler(event: NodeExecutionCompletedEvent):
    # Handle node completion
    ...

run_context.register_node_completion_handler(my_completion_handler)
```

## Custom Event Definitions

You can define custom events for your specific application needs:

```python
from dhenara.agent.dsl.events import BaseEvent
from pydantic import BaseModel

# Define a custom event type
MY_CUSTOM_EVENT = "my_app.custom_event"

# Define custom event data model
class CustomEventData(BaseModel):
    user_id: str
    action: str
    timestamp: datetime

# Define the custom event class
class CustomAppEvent(BaseEvent):
    event_type: str = MY_CUSTOM_EVENT
    data: CustomEventData

# Create and publish a custom event
event = CustomAppEvent(
    data=CustomEventData(
        user_id="user123",
        action="login",
        timestamp=datetime.now()
    )
)
await event_bus.publish(event)
```

## Best Practices

1. **Event Type Specificity**: Use specific event types for better routing and clarity
2. **Loose Coupling**: Use events to maintain loose coupling between components
3. **Handler Focus**: Keep event handlers focused on a single responsibility
4. **Error Handling**: Implement proper error handling in event handlers
5. **Debugging**: Use the observability system to trace event flow
6. **Performance**: Consider performance implications of slow event handlers

## Conclusion

The Event System in DAD provides a powerful mechanism for component communication and coordination. By leveraging the
event-driven architecture, you can create flexible, loosely coupled agents that can adapt to dynamic requirements and
respond to various stimuli during execution.
