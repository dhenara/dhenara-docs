---
sidebar_position: 2
---

# Quick Start

This guide will help you create and run your first agent using Dhenara Agent DSL (DAD). You'll build a simple
question-answering agent that can respond to user queries using an AI model.

Make sure you have installed `dhenara-agent` as described in
[installation](/dhenara-agent/getting-started/installation.md)

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install dhenara-agent
dhenara --help
```

## Start a project

Start a new project using CLI with a project name. We use _dev_agents_ as the project name here.

```bash
dhenara startproject dev_agents
```

This will create a git repo with below folder structure

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
from Anthropic,OpenAI,Google etx

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

Next, lets create an agent. When you use the CLI command, a simple chatbot flow will be included in the flow.py so that
you can easily start updaing it. Lets name the agent as _chatbot_

```bash
cd dev_agents  # Go inside the project repo
dhenara create agent chatbot
```

This will create a _chatbot_ agent dir inside _agents_, and a _chatbot.py_ runner inside the _runners_ dir

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

The flow inside chatbot will be as below.

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
                "Summarize in plane text under 60 characters. $expr{ $hier{ai_model_call_1}.outcome.text }",
            ),
        ),
    ),
)

```

There is a handler.py file which will handle input requeste events.

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

And finally,there is runner to run this flow.

dev_agents/src/runners/chatbot.py

```ipython
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

# Select an agent to run, assignt it a root_id
root_component_id = "chatbot_root"
agent.root_id = root_component_id

# Create run context
run_context = RunContext(
    root_component_id=root_component_id,
    project_root=project_root,
    observability_settings=None,  # pass observability_settings to enable tracing
    run_root_subpath=None,  # "agent_chatbot" Useful to pass when you have multipel agents in the same projects.
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

Make sure you have configured API keyes. ( You can run in a test mode without API keys, by setting `test_mode` in all
AIModelNode, you will see a dummy response instread of a real response )

```bash
dhenara run agent chatbot
```

You will be prompted to select an AI model ,and then to enter your querry. Once the run finhsed, you can see the
location of the run directory. A `runs` directory will be created under the project root when you run it for the first
time, and all runs will can be tracked there under timestamped dirctories. Inside the current run directory, you will
see the artifacts per node , like below

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

Look into the `outcome.json` file inside each node to see the resutl of execution.

You may think why I have to open a file to see what happened, but wait, DAD is not just for creating fancy workflows,
rather real complex flows. We will see how all these files will take effect in a different tutorial. Before that,
understand this simple workflow, as explained below.

## Explanation

TODO: Explain the flow step by step.

- Add details on how we use a $var to generate dymanic prompt.
- What is `pre_events=[EventType.node_input_required]` and how it taked to the input hander, and how the input hander
  identifed the requestong node, and override the definiton settings
- how did we pass the context between nodes via $hier

## Next Steps

Now that you've created your first agent, you can:

- Learn more about the [Core Concepts](core-concepts) of DAD
- Explore the different [Node Types](../components/nodes) and how to use them
- Understand the [Architecture](../architecture/overview) of DAD
- Check out more complex [Examples](../examples/basic-agent) to see what you can build
