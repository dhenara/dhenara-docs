# Observability

Observability is a core feature of Dhenara Agent DSL (DAD), providing comprehensive tracking, logging, and metrics for
all agent activities. DAD includes built-in observability capabilities at no additional cost, leveraging the open-source
[OpenTelemetry](https://opentelemetry.io/) framework. **Yes, its truly free**. You can configure observability with a
few simple steps and connect to your preferred observability services.

Free OpenTelemetry-compatible visualization tools such as Jaeger and Zipkin can be easily integrated with DAD (as
detailed in later sections).

We are also developing our own platform `Dhenara-Hub` which will offer not just observability features, but a broader
set of agent management capabilities.

## Observability Configuration

Observability is configured through `ObservabilitySettings`:

```python
from dhenara.agent.observability.types import ObservabilitySettings
from dhenara.agent.observability import configure_observability
import logging

# Create settings
settings = ObservabilitySettings(
    service_name="my-agent-app",
    tracing_exporter_type="file",  # "console", "file", "otlp", "jaeger", "zipkin"
    metrics_exporter_type="file",
    logging_exporter_type="file",
    trace_file_path="/path/to/trace.jsonl",
    metrics_file_path="/path/to/metrics.jsonl",
    log_file_path="/path/to/logs.jsonl",
    root_log_level=logging.INFO,
)

# Apply configuration
configure_observability(settings)
```

The `RunContext` automatically configures observability based on run parameters. By default, when you use the
`dad agent run` command, each run creates a unique directory under the `runs` folder with comprehensive artifacts
including logs, traces, and metrics.

## Run Directory Structure and Artifacts

When you run an agent using the `dad agent run <agent_name>` command, DAD automatically creates a directory
structure for observability artifacts. For example:

```text
run_20240514_225955_98cb96      # Unique run ID with timestamp
├── .trace                      # Observability data
│   ├── dad_metadata.json       # Metadata about the run
│   ├── logs.jsonl              # Structured logs
│   ├── metrics.jsonl           # Metrics data
│   └── trace.jsonl             # Trace events
├── autocoder_root              # Component hierarchy (your root component ID)
│   └── main_flow               # Flow ID
│       ├── dynamic_repo_analysis    # Node ID
│       │   ├── outcome.json         # Node outcome
│       │   └── result.json          # Complete node execution result
│       ├── code_generator
│       │   ├── outcome.json
│       │   ├── result.json
│       │   └── state.json           # AIModelNode state and prompt
│       └── code_generator_file_ops
│           ├── outcome.json
│           └── result.json
└── static_inputs
```

Each folder in the component hierarchy corresponds to the IDs defined in your agent definition:

- Root component ID (defined in the runner)
- Flow ID (defined in the agent)
- Node ID (defined in the flow)

This hierarchical structure is particularly valuable for troubleshooting, analyzing execution flows, and enabling the
rerun functionality.

## Enabling and Disabling Tracing

The tracing system can be enabled or disabled through the `ObservabilitySettings` configuration. Disabling tracing is
helpful in production environments where performance is critical or in testing scenarios where full observability is not
needed.

### Disabling Tracing

To disable tracing, set the `enable_tracing` flag to `False` in your `ObservabilitySettings`:

```python
from dhenara.agent.observability.types import ObservabilitySettings
from dhenara.agent.observability import configure_observability

# Disable tracing while keeping other observability features enabled
settings = ObservabilitySettings(
    service_name="my-agent-app",
    enable_tracing=False,  # Disable tracing
    enable_metrics=True,   # Keep metrics enabled
    enable_logging=True,   # Keep logging enabled
)

configure_observability(settings)
```

When tracing is disabled, the `is_tracing_disabled()` function will return `True`, and any code guarded by this check
will be skipped:

```python
from dhenara.agent.observability.tracing import is_tracing_disabled, get_tracer

# Check if tracing is disabled before performing trace operations
if not is_tracing_disabled():
    tracer = get_tracer("my_component")
    with tracer.start_as_current_span("my_operation") as span:
        # Add trace details
        span.set_attribute("key", "value")
```

### Test Mode and Observability

DAD integrates with the `dhenara-ai` package's test mode feature, which allows you to develop and test your agent flows
without making actual API calls. This is useful for verifying your observability setup without incurring costs.


```python
model_call_config=AIModelCallConfig(
    structured_output=TaskImplementation,
    test_mode=True,  # Enable test mode to avoid actual API calls
    max_output_tokens=64000,
    max_reasoning_tokens=4000,
    reasoning=True,
    timeout=1800.0,  # 30 minutes
),
```

Even when using test mode, all observability features (traces, logs, metrics) continue to function, allowing you to
validate your implementation's structure and flow without sending actual requests to AI providers.

### Enabling Tracing with Different Exporters

DAD supports multiple exporters for sending trace data to different visualization and analysis systems:

1. **Console Exporter**: Outputs traces to the console (good for development)
2. **File Exporter**: Writes traces to JSON line format files (default)
3. **OTLP Exporter**: Sends traces using OpenTelemetry Protocol
4. **Jaeger Exporter**: Sends traces directly to Jaeger
5. **Zipkin Exporter**: Sends traces directly to Zipkin

To configure a specific exporter:

```python
# Configure for Jaeger export
settings = ObservabilitySettings(
    service_name="my-agent-app",
    tracing_exporter_type="jaeger",  # Use Jaeger exporter
    jaeger_endpoint="http://localhost:14268/api/traces",
)

# Or for Zipkin
settings = ObservabilitySettings(
    service_name="my-agent-app",
    tracing_exporter_type="zipkin",  # Use Zipkin exporter
    zipkin_endpoint="http://localhost:9411/api/v2/spans",
)

configure_observability(settings)
```

## Analyzing Logs and Traces

DAD provides structured logs and traces that are valuable for troubleshooting and understanding agent execution.

### Analyzing Log Files

All logs are stored in the `.trace/logs.jsonl` file in JSONL format. Here's how to effectively analyze them:

```bash
# View the last 10 log entries
tail -10 runs/run_<run_id>/.trace/logs.jsonl

# Search for errors (the most common debugging scenario)
grep -i '"body": "ERROR' runs/run_<run_id>/.trace/logs.jsonl

# Follow logs in real-time during execution
tail -f runs/run_<run_id>/.trace/logs.jsonl
```

Common error patterns to look for include:

- API initialization errors (credentials issues)
- Node execution failures
- Parsing or schema validation errors

### Analyzing Node Artifacts

Each node in your flow generates two key artifacts:

1. **result.json**: Contains the complete node execution result with:
   - Input: What was provided to the node
   - Output: The direct output from the node execution
   - Outcome: The processed result used by subsequent nodes
   - Error information (if any)
2. **outcome.json**: A convenience file containing just the outcome field extracted from result.json

In AIModelNodes, you'll also find a **state.json** file containing the actual prompt sent to the AI provider, which is
invaluable for debugging AI interactions.

```python
# When referencing node results in templates:
"$expr{ $hier{node_id}.outcome.structured.some_field }"

# This refers to the outcome field in result.json, not the separate outcome.json file
```

## Using Tracing Visualization Tools with Docker

DAD includes built-in support for launching trace visualization tools using Docker, making it easy to analyze your
agent's execution in detail without complex setup.

### Docker Installation Tips

Before using the Docker-based visualization tools, you need to have Docker installed on your system:

- **Windows/Mac**: Install [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- **Linux**: Install Docker Engine using your distribution's package manager or follow the
  [official installation guide](https://docs.docker.com/engine/install/)

To verify Docker is installed correctly, run:

```bash
docker --version
```

### Using Jaeger for Trace Visualization

[Jaeger](https://www.jaegertracing.io/) is a popular open-source distributed tracing system that's well-suited for
visualizing DAD agent traces.

#### Running Jaeger with Docker Compose

DAD includes a pre-configured Docker Compose file for Jaeger:

##### Jaeger Docker Compose File

Copy this to a file named `jaeger-docker-compose.yaml`:

```yaml
services:
  jaeger:
    image: jaegertracing/all-in-one:latest
    ports:
      - '16686:16686' # Jaeger UI
      - '14268:14268' # Collector HTTP endpoint
      - '6831:6831/udp' # Jaeger thrift compact
    environment:
      - COLLECTOR_ZIPKIN_HOST_PORT=:9411
```

You can start Jaeger using one of these methods:

1. **Using VS Code**: Open the file in VS Code and click on the "Run service" button in the editor
2. **Using command line**:

   ```bash
   # Navigate to the directory containing jaeger-docker-compose.yaml
   cd /path/to/directory

   # Start Jaeger using Docker Compose
   docker-compose -f jaeger-docker-compose.yaml up -d
   ```

This will start Jaeger with the following components:

- Jaeger UI on port 16686
- Collector HTTP endpoint on port 14268
- Jaeger Thrift compact on UDP port 6831

Then access the Jaeger UI at http://localhost:16686.

You can also launch Jaeger directly from your Python code:

```python
from dhenara.agent.observability.dashboards import run_jaeger_dashboard

# This launches Jaeger in a Docker container and opens the UI in your browser
run_jaeger_dashboard()
```

#### Sending Traces to Jaeger

To send traces to your running Jaeger instance, configure your observability settings:

```python
from dhenara.agent.observability.types import ObservabilitySettings
from dhenara.agent.observability import configure_observability

settings = ObservabilitySettings(
    service_name="my-agent-app",
    tracing_exporter_type="jaeger",
    jaeger_endpoint="http://localhost:14268/api/traces",
)

configure_observability(settings)
```

### Using Zipkin for Trace Visualization

[Zipkin](https://zipkin.io/) is another popular open-source distributed tracing system that can be used with DAD.

#### Running Zipkin with Docker Compose

DAD includes a pre-configured Docker Compose file for Zipkin:

##### Zipkin Docker Compose File

Copy this to a file named `zipkin-docker-compose.yaml`:

```yaml
services:
  zipkin:
    image: openzipkin/zipkin:latest
    ports:
      - '9411:9411' # Zipkin UI and API
    environment:
      - STORAGE_TYPE=mem # For simplicity, store traces in memory
```

You can start Zipkin using one of these methods:

1. **Using VS Code**: Open the file in VS Code and click on the "Run service" button in the editor
2. **Using command line**:

   ```bash
   # Navigate to the directory containing zipkin-docker-compose.yaml
   cd /path/to/directory

   # Start Zipkin using Docker Compose
   docker-compose -f zipkin-docker-compose.yaml up -d
   ```

This will start Zipkin with the UI and API available on port 9411.

You can access the Zipkin UI at http://localhost:9411.

You can also launch Zipkin directly from your Python code:

```python
from dhenara.agent.observability.dashboards import run_zipkin_dashboard

# This launches Zipkin in a Docker container and opens the UI in your browser
run_zipkin_dashboard()
```

#### Sending Traces to Zipkin

To send traces to your running Zipkin instance, configure your observability settings:

```python
from dhenara.agent.observability.types import ObservabilitySettings
from dhenara.agent.observability import configure_observability

settings = ObservabilitySettings(
    service_name="my-agent-app",
    tracing_exporter_type="zipkin",
    zipkin_endpoint="http://localhost:9411/api/v2/spans",
)

configure_observability(settings)
```

## Using the Simple Built-in Dashboard

For cases where you don't want to use Docker, DAD includes a simple built-in dashboard for viewing trace files:

```python
from dhenara.agent.observability.dashboards import run_dashboard

# Run the dashboard with a trace file
run_dashboard("/path/to/trace.jsonl", port=8080)
```

This will start a local web server and open a browser window with a simple trace viewer.

## Rerunning Agents from Specific Points

One major advantage of DAD's hierarchical artifact structure is the ability to rerun agents from specific points in the
execution flow. This is particularly useful for debugging, optimizing prompts, or resuming after failures.

```bash
# Rerun from a specific node in a previous run
dad agent run autocoder --previous-run-id run_20240514_225955_98cb96 --entry-point main_flow.code_generator
```

This command will:

1. Load the state from the previous run
2. Skip the execution of all nodes before `code_generator`
3. Start execution from the specified node

This feature saves time and costs, especially when working with large context models or complex flows.

## Core Observability Components

### 1. Tracing System

The tracing system tracks the execution path of components and nodes:

```python
from dhenara.agent.observability.tracing import setup_tracing, get_tracer, trace_method, trace_node

# Use decorators for automatic tracing
@trace_method("my_method")
async def my_method(self, param1):
    # Method implementation
    pass

@trace_node("my_custom_node_type")
async def execute_node(self, node_id, execution_context, node_input):
    # Node execution implementation
    pass
```

The tracing system creates hierarchical spans that capture:

- Execution path and hierarchies
- Timing information
- Input and output data
- Success/failure status
- Error information

### 2. Logging System

The logging system provides structured logging with context:

```python
from dhenara.agent.observability import log_with_context
import logging

# Log with trace context
log_with_context(
    logger,
    logging.INFO,
    "Processing completed successfully",
    {"items_processed": 42, "processing_time_ms": 1250}
)
```

This automatically associates logs with the current execution context and trace.

### 3. Metrics System

The metrics system collects numerical data about execution:

```python
from dhenara.agent.observability import record_metric

# Record a metric
record_metric(
    meter_name="dhenara.agent.processing",
    metric_name="items_processed",
    value=42,
    metric_type="counter",
    attributes={"node_id": "my_processor", "item_type": "document"}
)
```

Metrics can be aggregated and analyzed to monitor performance and behavior.

## Tracing Profiles

Tracing profiles define what data should be captured in traces:

```python
from dhenara.agent.observability.tracing.data import (
    NodeTracingProfile,
    TracingDataField,
    TracingDataCategory,
)

# Define a tracing profile for a custom node
my_node_profile = NodeTracingProfile(
    node_type="my_custom_node",
    input_fields=[
        TracingDataField(
            name="query",
            source_path="query",
            category=TracingDataCategory.primary,
            max_length=500,
            description="The search query",
        ),
        # More fields...
    ],
    output_fields=[
        # Output fields...
    ],
    result_fields=[
        # Result fields...
    ],
)
```

Profiles help control what data is captured in traces, balancing detail against volume.

## Complete Example: Running an Agent with Tracing and Visualization

Here's a complete example that sets up an agent with tracing enabled and visualization using Jaeger:

```python
from pathlib import Path
import logging

from dhenara.agent.observability import configure_observability
from dhenara.agent.observability.types import ObservabilitySettings
from dhenara.agent.observability.dashboards import run_jaeger_dashboard
from dhenara.agent.run import RunContext
from dhenara.agent.runner import AgentRunner

# Step 1: Start Jaeger in Docker
run_jaeger_dashboard()

# Step 2: Configure observability with Jaeger exporter
settings = ObservabilitySettings(
    service_name="my-agent-example",
    tracing_exporter_type="jaeger",
    jaeger_endpoint="http://localhost:14268/api/traces",
    root_log_level=logging.DEBUG,
)

configure_observability(settings)

# Step 3: Create and run your agent
agent = create_my_agent()  # Your agent creation function

run_context = RunContext(
    root_component_id="my_agent",
    project_root=Path("."),
)
run_context.setup_run()

# Execute the agent
runner = AgentRunner(agent, run_context)
result = await runner.run()
```

With this setup, you can view detailed traces of your agent's execution in the Jaeger UI, helping you understand its
behavior, identify bottlenecks, and diagnose issues.

## Troubleshooting Common Observability Issues

### Missing Node Artifacts

If you don't see artifacts for all nodes in your flow:

1. Check for API credential errors in logs (`grep -i "body": "ERROR" runs/run_<run_id>/.trace/logs.jsonl`)
2. Verify that event handlers are properly registered
3. Ensure all required node settings are properly configured

### AI Model Failures

Look for these common patterns in logs and AIModelNode state.json files:

1. **Content Length**: If you see `"finish_reason": "max_token"`, your context window is being exceeded
2. **Schema Issues**: Check for `parse_error` fields in the response indicating the model didn't follow your schema
3. **API Errors**: Look for HTTP error codes in the status field

## Best Practices

1. **Hierarchical Context**: Ensure proper nesting of traces through the component hierarchy
2. **Selective Tracing**: Be strategic about what data to capture, especially for large inputs/outputs
3. **Structured Logging**: Use log_with_context to maintain correlation with traces
4. **Meaningful Metrics**: Capture metrics that provide insights into performance and behavior
5. **Regular Analysis**: Use the dashboard tools to analyze execution and identify improvements
6. **Production Settings**: Consider disabling detailed tracing in production for performance-critical systems, or using
   sampling strategies
7. **Cleanup**: Remember to stop Docker containers when you're done analyzing traces to free up resources
8. **Test Mode First**: Use test_mode=True during initial development to validate flows without incurring API costs
9. **Artifact Management**: Periodically clean up old run directories to free disk space

By utilizing DAD's observability features, developers can gain deep insights into their agent systems, diagnose issues
more effectively, and optimize performance with the help of powerful visualization tools.
