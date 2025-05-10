---
title: Best Practices
---

# Best Practices and Tips

This guide covers best practices and practical tips for building effective agents with Dhenara Agent DSL (DAD).

## Dynamic Configuration

Make your agents more flexible by using variables for configuration:

```python
# Configuration through variables
repo_dir = "/path/to/repo"
models = ["claude-3-7-sonnet", "gpt-4.1-nano"]
temperature = 0.7

# Use variables in node definitions
ai_node = AIModelNode(
    resources=ResourceConfigItem.with_models(*models),
    settings=AIModelNodeSettings(
        model_call_config=AIModelCallConfig(
            options={"temperature": temperature}
        )
    )
)
```

Configuring your agent with variables makes it easier to adapt to different environments and use cases.

## Error Handling

Implement comprehensive error handling to make your agents robust:

```python
# Add error handling to your flows
error_flow = FlowDefinition()

# Regular processing branch
normal_branch = FlowDefinition()
normal_branch.node("processor", processor_node)

# Error handling branch
error_branch = FlowDefinition()
error_branch.node("error_handler", error_handler_node)

# Add conditional to check for errors
main_flow.conditional(
    "error_check",
    statement=ObjectTemplate(expression="$hier{previous_node}.execution_status == 'FAILED'"),
    true_branch=error_branch,
    false_branch=normal_branch
)
```

Proper error handling ensures that your agents can recover from failures and provide meaningful feedback.

## Incremental Development

Start simple and add complexity incrementally:

1. **Build a basic flow** with a single node
2. **Test thoroughly** to ensure it works as expected
3. **Add additional nodes** to handle more complex functionality
4. **Refactor into reusable components** to improve maintainability
5. **Build agents** that coordinate multiple flows

This approach helps you manage complexity and identify issues early in the development process.

## Testing Strategies

Develop effective testing strategies for your agents:

1. **Unit test individual nodes** with mock inputs

   ```python
   async def test_code_generator():
       # Create a mock execution context
       mock_context = create_mock_execution_context()

       # Create a mock input
       mock_input = AIModelNodeInput(prompt_variables={"task": "Test task"})

       # Execute the node with mocks
       node = AIModelNode(...)
       result = await node.execute("test_node", mock_context, mock_input)

       # Verify the result
       assert result.status == ExecutionStatusEnum.COMPLETED
       assert result.output.response is not None
   ```

2. **Create test flows** to verify node interactions

   ```python
   test_flow = FlowDefinition()
   test_flow.node("test_input", TestInputNode(...))
   test_flow.node("node_under_test", NodeUnderTest(...))
   test_flow.node("result_validator", ValidationNode(...))
   ```

3. **Use simplified test environments**

   ```python
   test_run_context = RunContext(
       root_component_id="test_flow",
       project_root=Path("./test_dir"),
       observability_settings=ObservabilitySettings(enable_tracing=False)
   )
   ```

4. **Log execution details** for debugging

   ```python
   run_context.register_event_handler(EventType.node_execution_completed, log_execution_result)
   ```

5. **Implement observability** to track agent behavior
   ```python
   observability_settings = ObservabilitySettings(
       service_name="test-agent",
       tracing_exporter_type="console",
       root_log_level=logging.DEBUG
   )
   ```

## Component Organization

Organize your components for maximum reusability and maintainability:

```python
# Create a function that returns a configured node
def create_code_analyzer(language: str) -> AIModelNode:
    return AIModelNode(
        resources=ResourceConfigItem.with_model("claude-3-5-sonnet"),
        settings=AIModelNodeSettings(
            system_instructions=[f"You are a {language} code analysis expert."],
            prompt=Prompt.with_text("Analyze the following {language} code: $var{code}"),
        )
    )

# Create a function that returns a flow
def create_analysis_flow(language: str) -> FlowDefinition:
    flow = FlowDefinition()
    flow.node("file_reader", FileReaderNode())
    flow.node("code_analyzer", create_code_analyzer(language))
    flow.node("results_processor", ResultsProcessorNode())
    return flow

# Use the factory functions
python_analyzer = create_analysis_flow("Python")
java_analyzer = create_analysis_flow("Java")
```

Factory functions make it easy to create consistent, reusable components.

## Resource Management

Implement efficient resource management:

```python
# Define a model pool with fallbacks
model_pool = ["claude-3-7-sonnet", "gpt-4-turbo", "claude-3-5-haiku"]

# Use it in nodes
ai_node = AIModelNode(
    resources=ResourceConfigItem.with_models(model_pool),
    # The system will try models in order until one succeeds
)
```

Using model pools provides resilience against API availability issues and allows for model fallbacks.

## Input Handling

Create clear, reusable input handlers:

```python
# General purpose menu selection function
async def get_menu_choice(options: list[str], prompt: str = "Select an option:") -> int:
    print(f"\n{prompt}")
    for i, option in enumerate(options):
        print(f"  {i+1}. {option}")

    while True:
        try:
            choice = await async_input("Enter number: ")
            idx = int(choice) - 1
            if 0 <= idx < len(options):
                return idx
            print(f"Please enter a number between 1 and {len(options)}")
        except ValueError:
            print("Please enter a valid number")

# Use in an input handler
async def handle_model_selection(event: NodeInputRequiredEvent):
    if event.node_id == "ai_processor":
        models = ["claude-3-7-sonnet", "gpt-4-turbo", "claude-3-5-haiku"]
        selected_idx = await get_menu_choice(models, "Select AI model:")
        event.input = AIModelNodeInput(
            resources_override=[ResourceConfigItem.with_model(models[selected_idx])]
        )
        event.handled = True
```

Well-designed input handlers improve the user experience and make your agents more interactive.

## Common Pitfalls to Avoid

1. **Large Inputs/Outputs**: Be careful with large data - use chunking or summarization

   ```python
   # Instead of passing the entire repo content
   FolderAnalyzerSettings(
       max_file_size=100000,  # 100KB limit
       max_total_size=10000000,  # 10MB total limit
   )
   ```

2. **Event Handler Leaks**: Ensure event handlers don't persist beyond their needed lifetime

   ```python
   # Store handler registration for later cleanup
   handler_id = run_context.register_node_input_handler(my_handler)

   # Clean up when done
   run_context.unregister_handler(handler_id)
   ```

3. **Resource Exhaustion**: Implement rate limiting and fallbacks for API calls

   ```python
   # Use retries with backoff
   AIModelNodeSettings(
       retry_config=RetryConfig(
           max_retries=3,
           backoff_factor=2.0,
           initial_delay=1.0
       )
   )
   ```

4. **Non-Deterministic Flows**: Seed random factors when reproducibility is important

   ```python
   # Set seed for reproducibility
   AIModelCallConfig(
       options={"seed": 42}
   )
   ```

5. **Incomplete Error Handling**: Always handle errors at both node and flow levels

   ```python
   # Node-level error handling
   try:
       # Node operation
   except Exception as e:
       log_error(f"Node {node_id} failed: {str(e)}")
       raise NodeExecutionError(node_id, str(e))

   # Flow-level error handling
   flow.connect("processor", "success_handler", on_success=True)
   flow.connect("processor", "error_handler", on_error=True)
   ```

## Deployment Considerations

1. **Environment Configuration**: Use resource profiles for different environments

   ```python
   # Get environment-specific configuration
   config = run_context.get_resource_config(os.environ.get("ENV", "development"))
   ```

2. **Observability Setup**: Ensure proper logging and tracing in production

   ```python
   # Production observability settings
   ObservabilitySettings(
       service_name="my-agent-prod",
       tracing_exporter_type="otlp",
       otlp_endpoint="https://monitoring.example.com/v1/traces"
   )
   ```

3. **Scaling**: Consider how multiple agent instances will interact

   ```python
   # Use a shared resource registry
   resource_config_registry.register("shared", shared_resource_config)
   ```

4. **Security**: Properly manage credentials and sensitive inputs/outputs

   ```python
   # Use environment variables for credentials
   ResourceConfig().load_from_env()
   ```

5. **Monitoring**: Implement health checks and monitoring for production agents
   ```python
   # Register health check handler
   run_context.register_event_handler(EventType.health_check, health_check_handler)
   ```

By following these best practices, you can build robust, maintainable agent applications with DAD that solve real-world
problems effectively.
