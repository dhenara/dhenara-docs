---
sidebar_position: 2
---

# Quick Start

This guide will help you create and run your first agent using Dhenara Agent DSL (DAD). You'll build a simple
question-answering agent that can respond to user queries using an AI model.

Make sure you have installed `dhenara-agent` as described in the
[installation guide](/dhenara-agent/getting-started/installation.md).

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install dhenara-agent
dhenara --help
```

## Start a project

Start a new project using the CLI with a project name. We'll use _dev_agents_ as the project name in this example.

```bash
dhenara startproject dev_agents
```

This will create a git repository with the following folder structure:

```plaintext
dev_agents
├── .dhenara
│   ├── .secrets
│   │   └── .credentials.yaml
│   └── config.yaml
├── .gitignore
├── .git
├── pyproject.toml
├── README.md
└── src
    ├── agents
    └── runners
        ├── __init__.py
        └── defs.py
```

Before you start running an agent, you need to update the `.dhenara/.secrets/.credentials.yaml` file with your API keys
from Anthropic, OpenAI, Google, etc.

```yaml
openai:
  api_key: <YOUR_OPENAI_API_KEY>

google_gemini_api:
  api_key: <YOUR_GOOGLE_GEMINI_API_API_KEY>

anthropic:
  api_key: <YOUR_ANTHROPIC_API_KEY>

google_vertex_ai:
  credentials: ...
```

## Create a Simple Agent

Next, let's create an agent. When you use the CLI command, a simple chatbot flow will be included in the flow.py file so
that you can easily start updating it. Let's name the agent _chatbot_:

```bash
cd dev_agents  # Go inside the project repo
dhenara create agent chatbot
```

This will create a _chatbot_ agent directory inside _agents_, and a _chatbot.py_ runner inside the _runners_ directory:

```plaintext
.
├── pyproject.toml
├── README.md
└── src
    ├── agents
    │   └── chatbot
    │       ├── __init__.py
    │       ├── agent.py
    │       ├── flow.py
    │       └── handler.py
    └── runners
        ├── __init__.py
        ├── chatbot.py
        └── defs.py
```

The flow inside the chatbot will be as follows:

```python
from dhenara.agent.dsl import (
    AIModelNode,
    AIModelNodeSettings,
    EventType,
    FlowDefinition,
)
from dhenara.ai.types import AIModelCallConfig, Prompt

main_flow = FlowDefinition()
main_flow.node(
    "user_query_processor",
    AIModelNode(
        pre_events=[EventType.node_input_required],
        settings=AIModelNodeSettings(
            models=[
                "claude-3-5-haiku",
                "gpt-4.1-nano",
                "gemini-2.0-flash-lite",
            ],
            system_instructions=[
                "You are an AI assistant in a general purpose chatbot",
                "Always respond in plaintext format.",
            ],
            prompt=Prompt.with_dad_text("$var{user_query}"),
            model_call_config=AIModelCallConfig(
                test_mode=False,
            ),
        ),
    ),
)
main_flow.node(
    "title_generator",
    AIModelNode(
        settings=AIModelNodeSettings(
            models=["gpt-4o-mini"],
            system_instructions=[
                "You are a summarizer which generate a title.",
            ],
            prompt=Prompt.with_dad_text(
                "Summarize in plain text under 60 characters. $expr{ $hier{ai_model_call_1}.outcome.text }",
            ),
        ),
    ),
)

```

There is a handler.py file which will handle input request events:

```python
from dhenara.agent.dsl import (
    FlowNodeTypeEnum,
    NodeInputRequiredEvent,
)
from dhenara.agent.utils.helpers.terminal import async_input, get_ai_model_node_input


async def node_input_event_handler(event: NodeInputRequiredEvent):
    node_input = None
    if event.node_type == FlowNodeTypeEnum.ai_model_call:
        if event.node_id == "ai_model_call_1":
            node_input = await get_ai_model_node_input(
                node_def_settings=event.node_def_settings,
            )
            user_query = await async_input("Enter your query: ")
            node_input.prompt_variables = {"user_query": user_query}

        event.input = node_input
        event.handled = True

```

And finally, there is a runner to run this flow:

dev_agents/src/runners/chatbot.py

```python
from dhenara.agent.dsl.events import EventType
from dhenara.agent.run import RunContext
from dhenara.agent.runner import AgentRunner
from dhenara.agent.utils.helpers.terminal import (
    print_component_completion,
    print_node_completion,
)

# Select the agent to run, and import its definitions
from src.agents.chatbot.agent import agent
from src.agents.chatbot.handler import node_input_event_handler
from src.runners.defs import project_root

# Select an agent to run, assign it a root_id
root_component_id = "chatbot_root"
agent.root_id = root_component_id

# Create run context
run_context = RunContext(
    root_component_id=root_component_id,
    project_root=project_root,
    observability_settings=None,  # pass observability_settings to enable tracing
    run_root_subpath=None,  # "agent_chatbot" Useful to pass when you have multiple agents in the same projects.
)


# Register the event handlers
run_context.register_event_handlers(
    handlers_map={
        EventType.node_input_required: node_input_event_handler,
        # Optional Notification events
        EventType.node_execution_completed: print_node_completion,
        EventType.component_execution_completed: print_component_completion,
    }
)

# Create a runner
runner = AgentRunner(agent, run_context)

# Use dhenara cli to run this as in an isolated context
#  --  dhenara run agent <agent_name>

```

## Run the flow

Make sure you have configured API keys. (You can run in test mode without API keys by setting `test_mode=True` in all
AIModelNode configurations. In test mode, you will see a dummy response instead of a real response.)

```bash
dhenara run agent chatbot
```

You will be prompted to select an AI model, and then to enter your query. Once the run finishes, you can see the
location of the run directory. A `runs` directory will be created under the project root when you run it for the first
time, and all runs will be tracked there under timestamped directories. Inside the current run directory, you will see
the artifacts per node, as shown below:

```plaintext
└── run_20250512_115947_4eb85d
    ├── chatbot_root
    │   └── main_flow
    │       ├── title_generator
    │       │   ├── outcome.json
    │       │   ├── result.json
    │       │   └── state.json
    │       └── user_query_processor
    │           ├── outcome.json
    │           ├── result.json
    │           └── state.json
    └── static_inputs
```

You can examine the `outcome.json` file inside each node to see the result of execution.

You might wonder why you need to open a file to see what happened. But remember, DAD isn't just for creating fancy
workflows - it's designed for building real, complex agent workflows.

This simple workflow serves as a foundation for more advanced implementations. We'll explore how all these files work
together in a subsequent tutorial. For now, let's focus on understanding the basic structure explained below.

## Explanation

Let's examine how this simple flow works step by step:

1. **User Input Handling**:

   - The `user_query_processor` node is configured with `pre_events=[EventType.node_input_required]`, which triggers an
     input request event before execution.
   - When this event is triggered, our `node_input_event_handler` function catches it and prompts the user for input.
   - The handler then attaches the user's query as a variable (`user_query`) to the node's input.

2. **Dynamic Prompt Generation**:

   - The prompt in the `user_query_processor` node uses `$var{user_query}` for variable substitution.
   - This allows the prompt to include the user's input dynamically at runtime.

3. **Context Sharing Between Nodes**:

   - The `title_generator` node references the output of the previous node using `$hier{ai_model_call_1}.outcome.text`.
   - The `$hier` expression allows access to the hierarchical context, where previous node results are stored.

4. **Node Execution Flow**:

   - Nodes execute in the order they're added to the flow using `.node()` fn.
   - The `user_query_processor` runs first, generating an AI response to the user query.
   - The `title_generator` runs second, creating a title based on the response from the first node.

5. **Run Artifacts**:
   - Each node generates artifacts (outcome.json, result.json, state.json) that capture the execution details.
   - These artifacts provide transparency and traceability for debugging and analysis.

## Next Steps

Now that you've created your first agent, you can:

- Go through [Tutorials](../guides/tutorials/command-line-coder) and more complex [Examples](../guides/examples) to see what you can
  build
- Learn more about the [Core Concepts](../concepts/core-concepts) of DAD
- Explore the different [Node Types](../concepts/components/nodes) and how to use them
- Understand the [Architecture](../architecture/overview) of DAD
