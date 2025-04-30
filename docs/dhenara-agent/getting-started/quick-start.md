---
sidebar_position: 2
---

# Quick Start

This guide will help you create and run your first agent using Dhenara Agent DSL (DAD). You'll build a simple question-answering agent that can respond to user queries using an AI model.

## Create a Simple Agent

Let's create a simple flow with an AI model node that answers questions:

```python
from dhenara.agent.dsl import (
    AIModelNode,
    AIModelNodeSettings,
    FlowDefinition,
)
from dhenara.ai.types import (
    ResourceConfigItem,
    Prompt,
)
from dhenara.agent.runner import FlowRunner
from dhenara.agent.run import RunContext
from pathlib import Path
import asyncio

# Define a simple flow
my_flow = FlowDefinition(root_id="simple_flow")

# Add an AI model node
my_flow.node(
    "assistant",
    AIModelNode(
        resources=ResourceConfigItem.with_model("claude-3-5-sonnet"),
        settings=AIModelNodeSettings(
            system_instructions=["You are a helpful assistant."],
            prompt=Prompt.with_dad_text("Answer the following question: $var{question}"),
        ),
    ),
)

# Create run context and runner
run_context = RunContext(
    root_component_id="simple_flow",
    project_root=Path("."),
)

# Register static input for the node
from dhenara.agent.dsl.inbuilt.flow_nodes.defs.types import AIModelNodeInput
run_context.register_node_static_input(
    "assistant",
    AIModelNodeInput(prompt_variables={"question": "What is Dhenara Agent DSL?"})
)

# Run the flow
async def run_flow():
    run_context.setup_run()
    runner = FlowRunner(my_flow, run_context)
    result = await runner.run()
    return result

# Execute the flow
result = asyncio.run(run_flow())
print(f"Flow execution result: {result}")
print(f"AI response: {result.outcome.text}")
```

Save this code to a file (e.g., `simple_agent.py`) and run it with Python:

```bash
python simple_agent.py
```

## Create an Interactive Agent

Now, let's create a more interactive agent that prompts the user for input:

```python
from dhenara.agent.dsl import (
    AIModelNode,
    AIModelNodeSettings,
    EventType,
    FlowDefinition,
)
from dhenara.ai.types import (
    ResourceConfigItem,
    Prompt,
)
from dhenara.agent.dsl.inbuilt.flow_nodes.defs.types import AIModelNodeInput
from dhenara.agent.dsl.events import NodeInputRequiredEvent
from dhenara.agent.runner import FlowRunner
from dhenara.agent.run import RunContext, IsolatedExecution
from pathlib import Path
import asyncio

# Define a flow
interactive_flow = FlowDefinition(root_id="interactive_flow")

# Add an AI model node that will require input
interactive_flow.node(
    "interactive_assistant",
    AIModelNode(
        pre_events=[EventType.node_input_required],  # This tells the node to request input
        resources=ResourceConfigItem.with_model("claude-3-5-sonnet"),
        settings=AIModelNodeSettings(
            system_instructions=["You are a helpful assistant."],
            prompt=Prompt.with_dad_text("Answer the following question: $var{question}"),
        ),
    ),
)

# Create a run context
run_context = RunContext(
    root_component_id="interactive_flow",
    project_root=Path("."),
)

# Define an input handler
async def handle_input_required(event: NodeInputRequiredEvent):
    if event.node_id == "interactive_assistant":
        # Get input from the user
        question = input("Enter your question: ")
        
        # Create the input object with the user's question
        event.input = AIModelNodeInput(
            prompt_variables={"question": question}
        )
        event.handled = True

# Main function to run the agent
async def main():
    # Set up the run context
    run_context.setup_run()
    
    # Register the input handler
    run_context.register_node_input_handler(handle_input_required)
    
    # Create a runner
    runner = FlowRunner(interactive_flow, run_context)
    
    # Run in isolated execution context
    async with IsolatedExecution(run_context) as execution:
        result = await execution.run(runner)
        
        # Print the result
        print("\nAssistant's response:")
        print(result.outcome.text)

# Run the agent
if __name__ == "__main__":
    asyncio.run(main())
```

Save this code to a file (e.g., `interactive_agent.py`) and run it with Python:

```bash
python interactive_agent.py
```

## Multi-Node Flow

Let's create a more complex flow that analyzes a folder and generates a report:

```python
from dhenara.agent.dsl import (
    AIModelNode,
    AIModelNodeSettings,
    EventType,
    FlowDefinition,
    FolderAnalyzerNode,
    FolderAnalyzerSettings,
)
from dhenara.agent.dsl.inbuilt.flow_nodes.defs.types import FolderAnalysisOperation
from dhenara.ai.types import (
    ResourceConfigItem,
    Prompt,
)
from dhenara.agent.runner import FlowRunner
from dhenara.agent.run import RunContext
from pathlib import Path
import asyncio

# Define a flow for folder analysis
analysis_flow = FlowDefinition(root_id="analysis_flow")

# Add a folder analyzer node
analysis_flow.node(
    "folder_analyzer",
    FolderAnalyzerNode(
        settings=FolderAnalyzerSettings(
            base_directory="./",
            operations=[
                FolderAnalysisOperation(
                    operation_type="analyze_folder",
                    path=".",  # Analyze the current directory
                    include_patterns=["*.py"],  # Look for Python files
                    exclude_patterns=["__pycache__", ".git"],
                    include_content=False,  # Don't include file contents
                )
            ],
        ),
    ),
)

# Add an AI model node to generate a report
analysis_flow.node(
    "report_generator",
    AIModelNode(
        resources=ResourceConfigItem.with_model("claude-3-5-sonnet"),
        settings=AIModelNodeSettings(
            system_instructions=[
                "You are a code analysis assistant that summarizes repository structure.",
            ],
            prompt=Prompt.with_dad_text(
                "Analyze the following repository structure and provide a brief summary:\n\n"
                "$hier{folder_analyzer}.outcome.structured\n\n"
                "Focus on the types of files, general organization, and potential purpose of the code."
            ),
        ),
    ),
)

# Create run context and runner
run_context = RunContext(
    root_component_id="analysis_flow",
    project_root=Path("."),
)

# Run the flow
async def run_analysis():
    run_context.setup_run()
    runner = FlowRunner(analysis_flow, run_context)
    result = await runner.run()
    return result

# Execute the flow
if __name__ == "__main__":
    result = asyncio.run(run_analysis())
    print("\nRepository Analysis:")
    print(result.outcome.text)
```

This example demonstrates how nodes can work together in a flow, with the output of one node feeding into the next.

## Next Steps

Now that you've created your first agent, you can:

- Learn more about the [Core Concepts](core-concepts) of DAD
- Explore the different [Node Types](../components/nodes) and how to use them
- Understand the [Architecture](../architecture/overview) of DAD
- Check out more complex [Examples](../examples/basic-agent) to see what you can build
