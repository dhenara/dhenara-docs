---
sidebar_position: 2
---

# Part 1: Single-Shot Implementation Flow

In this first part of our tutorial, we'll build a simple "single-shot" coding assistant that can take a task
description, generate code, make the file changes and commit it. This will serve as the foundation for our more advanced
agent in later parts.

## What is a Single-Shot Implementation?

A single-shot implementation is the simplest form of a coding assistant. It takes a task description, analyzes the
relevant files/folders for code context, and generates code to implement the task in one go. Unlike more complex agents,
it doesn't break the task down into smaller steps or create a plan—it simply executes the implementation directly.

## Project Setup

Let's start by setting up our project structure:

1. Create a new project (or use an existing one):

```bash
python3 -m venv .venv
source .venv/bin/activate

(.venv) $ dhenara startproject dev_agents

Initializing Git.
✅ Project 'dev_agents' created successfully!
  - Project identifier: dev_agents
  - Location: <path>.../dev_agents

Next steps:
  1. cd dev_agents
  2. dhenara create agent <agent_name>
(.venv) $
```

2. Create a new agent for our CLI coder. Let's name it as _autocoder_:

```bash
(.venv) $ cd dev_agents
(.venv) $ dhenara create agent autocoder
✅ Agent 'autocoder' created successfully!
  - Identifier: autocoder
  - Location: /Users/ajithjose/Work/web_development/django/project_repos/20_agents/demos/dev_agents/src/agents/autocoder
  - Command to run:  dhenara run agent autocoder
(.venv) $
```

## Understanding the Project Structure

This will create the following structure:

```
src/
├── agents/
│   └── autocoder/
│       ├── __init__.py
│       ├── agent.py
│       ├── flow.py
│       └── handler.py
└── runners/
    ├── __init__.py
    ├── defs.py
    └── autocoder.py
```

The files come with a pre-built simple chatbot agent. We will update them one by one. To organize it better, let's
delete the `flow.py` and create a `flows` directory with an init file:

```bash
rm src/agents/autocoder/flow.py
mkdir src/agents/autocoder/flows
touch src/agents/autocoder/flows/__init__.py
```

## Creating the Types

Before we implement our flow, let's create a file to define the types our agent will use. DAD and Dhenara-AI come with
strong type checking using Pydantic, but we still need to define the types which need to be passed to AI model API calls
for structured output generation.

In the `autocoder` directory, create a `types.py` file:

```bash
touch src/agents/autocoder/types.py
```

and add below to this file.

```python
from dhenara.agent.dsl.inbuilt.flow_nodes.defs.types import FileOperation
from pydantic import BaseModel, Field

class TaskImplementation(BaseModel):
    """
    Contains the concrete file operations to implement a specific task of the plan.
    This is the output generated after analyzing the context specified in the TaskSpec.
    """

    task_id: str | None = Field(
        default=None,
        description=("ID of the corresponding TaskSpec that this implements if it was given in the inputs"),
    )
    file_operations: list[FileOperation] | None = Field(
        default_factory=list,
        description="Ordered list of file operations to execute for this implementation task",
    )
    execution_commands: list[dict] | None = Field(
        None,
        description="Optional shell commands to run after file operations (e.g., for build or setup)",
    )
    verification_commands: list[dict] | None = Field(
        None,
        description="Optional commands to verify the changes work as expected",
    )

```

We created this model so that we can configure this as the structured output from LLM API calls later. The dhenara-ai
package will take this Pydantic model and convert it to the schema/format required by the API provider you use in the
AIModelCallNode later.

If you are not familiar with structured outputs, don't worry. You only need to know that above _TaskImplementation_ is
the format in which we want the output from any LLM API calls. Say you asked a question, and LLM thinks you need to
create/delete few files, it will respond in below format.

```json
{
  "task_id": null,
  "file_operations": [
    {
      "type": "create_file",
      "path": "dhenara_fe_nextjs/src/components/common/ExternalLinkIcon.tsx",
      "content": "import React from 'react';.."
    },
    {
      "type": "delete_file",
      "path": "dhenara_fe_nextjs/src/components/common/SmartLink.tsx"
    },
    {
      "type": "create_file",
      "path": "dhenara_fe_nextjs/src/components/common/SmartLink.tsx",
      "paths": null,
      "content": "// INFO:\n//  Component that determines..."
    },
    {
      "type": "create_file",
      "path": "dhenara_fe_nextjs/src/components/home/ProductCard.tsx",
      "content": "import { SmartLink } from '@/components/common/SmartLink'..."
    }
  ],
  "execution_commands": null,
  "verification_commands": null
}
```

You are defining the structure of the output in which you expect the response, in a more convenient way than using JSON
schema by creating a Pydantic Model.

:::note

Here `FileOperation` is a built-in type in DAD. We need to use that instead of defining a custom type here, so that you
can use the LLM output directly inside a FileOperationNode later.

:::

## Setup the context repo/folders

We will use this autocoder agent to make changes in any project repo for any programming language. It can even create a
code repo from scratch. First, we will start with updating an existing repo.

We need to pass the relevant context to the LLM in order to respond with the right answers. Therefore, every time when
you ask to do a task on your project repo (not this DAD project, your actual work project), you will specify which files
need to be sent to the LLM. In a more sophisticated flow, you will use an additional LLM API call before the actual code
generation to decide which files/folders need to be read and sent to LLM so that it gets the right context. We will do
this later when we enhance this flow with a _Planner_ flow.

For now, each time you run this agent, you will specify which files/folders need to be read and sent to LLM, because you
know your repo better.

We will do this by using a `FolderAnalyzerNode` in our flow. In order to read selected files/folders of your project,
let's copy it in a directory inside our DAD project. The best place to do it is inside our `runs` directory. This is a
directory which is **not** tracked under DAD's git repo; it's our artifacts directory. This will be created when you run
an agent for the first time by using the `dhenara run agent` command, but in order to copy/clone your actual project,
let's create it right now and copy your project there.

```bash
mkdir runs
```

:::warning

Do not confuse the _runs_ directory with _runners_ directory inside src. The _runners_ dir contains the essential
settings to run agents and is git tracked, but the _runs_ dir is our artifact directory, sitting directly under the DAD
project root.

For every run command, a unique dir will be created inside _runs_ with artifacts, and you might want to clean up these
when you run many iterations.

:::

Let's create a global directory to store all your projects. The idea behind creating a global dir inside runs is that
you can clone/copy multiple repos (e.g., a front-end repo, backend repo, and a documentation repo) and pass context from
any of these in LLM calls. Here we are calling this as `global_data` and this will sit directly inside our runs
directory.

```bash
mkdir runs/global_data
cd runs/global_data
git clone <Your actual repo> <local_repo_name>
# OR
# Copy your project
```

In our example, we are cloning the DAD docs repo, as this agent is for making updates in that repo. So we will use it
like:

```bash
mkdir runs
cd runs
git clone https://github.com/dhenara/dhenara-docs.git dhenara_docs
```

## Implementing Flow

Now, we will create an _implementation flow_. It is nothing but our single shot agent flow. The reason we call it
implementation is, later in this tutorial, we will have additional flows like planner flow, and this single shot flow
will serve as implementation for the plan output.

```bash
touch src/agents/autocoder/flows/implementation.py
```

and update it with the code below:

:::tip

We have enabled the test mode in LLM API calls by setting `test_mode=True` inside the `AIModelNode`. This is a cool
feature that `dhenara-ai` offers so that you can bring up your AI projects without losing money. We will start with test
mode initially, and we will disable it later, when we know that our setup is completed correctly.

:::

```python
from dhenara.agent.dsl import (
    PLACEHOLDER,
    AIModelNode,
    AIModelNodeSettings,
    EventType,
    FileOperationNode,
    FileOperationNodeSettings,
    FlowDefinition,
    FolderAnalyzerNode,
    FolderAnalyzerSettings,
)
from dhenara.agent.dsl.inbuilt.flow_nodes.defs.types import FolderAnalysisOperation

from dhenara.ai.types import (
    AIModelCallConfig,
    ObjectTemplate,
    Prompt,
)

from src.agents.autocoder.types import TaskImplementation



# Initially, we will hard code the task_description,
# but later we will use DAD's strong template system to accept it live
task_description = "Update the README file with relevant content"
#task_description = "Your Task description"

# Directory path where we analyze the folders
global_data_directory = "$var{run_root}/global_data"

# Create a FlowDefinition
implementation_flow = FlowDefinition()


# 1. Dynamic Folder Analysis
implementation_flow.node(
    "dynamic_repo_analysis",
    FolderAnalyzerNode(
        # pre_events=[EventType.node_input_required],
        settings=FolderAnalyzerSettings(
            base_directory=global_data_directory,
            operations=[
                FolderAnalysisOperation(
                    operation_type="analyze_folder",
                    path="dhenara_docs/docs",
                    content_read_mode="none", # No content
                ),
                FolderAnalysisOperation(
                    operation_type="analyze_folder",
                    path="dhenara_docs/docs/dhenara-agent/getting-started",
                    content_read_mode="full", #With full content
                ),
                FolderAnalysisOperation(
                    operation_type="analyze_file",
                    path="dhenara_docs/docs/dhenara-ai/introduction.md",
                    content_read_mode="full", #With full content
                ),
                FolderAnalysisOperation(
                    operation_type="analyze_file",
                    path="dhenara_docs/docs/dhenara-agent/introduction.md",
                    content_read_mode="full", #With full content
                ),

            ],
        ),
    ),
)

# 2. Code Generation Node
implementation_flow.node(
    "code_generator",
    AIModelNode(
        settings=AIModelNodeSettings(
            models=["claude-3-7-sonnet"],
            system_instructions=[
                # Role and Purpose
                "You are a professional code implementation agent specialized in executing precise file operations.",
                "Your task is to generate the exact file operations necessary to implement requested code changes - nothing more, nothing less.",
                "Generate machine-executable operations that require zero human intervention.",
                # Supported Operations
                "ALLOWED OPERATIONS:",
                "- create_file(file_path, content)",
                "- delete_file(file_path)",
                "- create_directory(directory_path)",
                # Prohibited Operations
                "PROHIBITED OPERATIONS (do not use):",
                "- edit_file",
                "- list_directory",
                "- search_files",
                "- get_file_metadata",
                "- list_allowed_directories",
                # Best Practices
                "IMPLEMENTATION GUIDELINES:",
                "1. For complete file replacement, use delete_file followed by create_file instead of a single edit_file.",
                "2. Maintain the project's existing code style, indentation, and formatting conventions.",
            ],
            prompt=Prompt.with_dad_text(
                text=(
                    "## Task Description\n"
                    f"{task_description}"
                    "## Repository Context\n"
                    "$expr{$hier{dynamic_repo_analysis}.outcome.results}\n\n"
                    "## Implementation Requirements\n"
                    "1. Generate precise file operations that can be executed programmatically\n"
                    "2. Strictly follow instructions\n"
                    "3. Consider the entire context when making implementation decisions\n"
                    "## Output Format\n"
                    "Return a TaskImplementation object\n"
                ),
            ),
            model_call_config=AIModelCallConfig(
                structured_output=TaskImplementation,
                test_mode=True, # Start in test mode, and we will change this later
                max_output_tokens=64000,
                max_reasoning_tokens=4000,
                reasoning=True,
                timeout=1800.0,  # 30 minutes
            ),
        ),
    ),
)

# 3. File Operation Node
implementation_flow.node(
    "code_generator_file_ops",
    FileOperationNode(
        settings=FileOperationNodeSettings(
            base_directory=global_data_directory,
            operations_template=ObjectTemplate(
                expression="$expr{ $hier{code_generator}.outcome.structured.file_operations }",
            ),
            stage=True,
            commit=True,
            commit_message="$var{run_id}: Auto generated.",
        ),
    ),
)

```

The flow does three main things:

1. Read context files based on a predefined task specification
2. Generate code based on the task and context
3. Execute the generated file operations

## Agent update

Now you have defined the flow inside `src/agents/autocoder/flows/implementation.py`. Let's update the agent file in
`src/agents/autocoder/agent.py` with this flow:

```python
from dhenara.agent.dsl import AgentDefinition

from .flows.implementation import implementation_flow

agent = AgentDefinition()
agent.flow(
    "main_flow",
    implementation_flow,
)

```

## Update Runners

Now we have defined the flow and added it to the agent. Next we need to setup the runtime parameters before running the
agent. For now, you don't need to update anything in runners, as the pre-defined runner that was generated with the
`dhenara create agent` command works for us as is. It will be in the path `src/runners/autocoder.py`.

Here's what it contains for reference:

```python
from dhenara.agent.dsl.events import EventType
from dhenara.agent.run import RunContext
from dhenara.agent.runner import AgentRunner
from dhenara.agent.utils.helpers.terminal import (
    print_component_completion,
    print_node_completion,
)

# Select the agent to run, and import its definitions
from src.agents.autocoder.agent import agent
from src.agents.autocoder.handler import node_input_event_handler
from src.runners.defs import project_root

# Select an agent to run, assign it a root_id
root_component_id = "autocoder_root"
agent.root_id = root_component_id

# Create run context
run_context = RunContext(
    root_component_id=root_component_id,
    project_root=project_root,
    observability_settings=None,  # pass observability_settings to enable tracing
    run_root_subpath=None,  # "agent_autocoder" Useful to pass when you have multiple agents in the same projects.
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

## Running the agent

Let's run this agent now. Remember that we have set `test_mode=True` so the actual operations will not take place. But
we still want to make sure that we are sending the right context to the LLM.

```bash
dhenara run agent autocoder
```

This will show you a message like below:

```bash
(.venv) $ dhenara run agent autocoder
✓ Node dynamic_repo_analysis execution completed
✓ autocoder_root execution completed
Agent standard run completed successfully. Run ID: run_20250514_225955_98cb96


✅ RUN COMPLETED SUCCESSFULLY
────────────────────────────────────────────────────────────────────────────────
  Run ID: run_20250514_225955_98cb96
  Artifacts location: /Users/<dad_project_repo_path>/dev_agents/runs/run_20250514_225955_98cb96


Logs in /Users/<dad_project_repo_path>/dev_agents/runs/run_20250514_225955_98cb96/.trace/logs.jsonl

(.venv) $
```

Now let's look into the artifacts: Go to the artifacts directory inside the run dir. You will see a folder structure
like this:

```text
run_20240514_225955_98cb96
├── .trace
│   ├── dad_metadata.json
│   ├── logs.jsonl
│   ├── metrics.jsonl
│   └── trace.jsonl
├── autocoder_root
│   └── main_flow
│       └── dynamic_repo_analysis
│           ├── outcome.json
│           └── result.json
└── static_inputs
```

Understand the folder names here:

- _autocoder_root_: This is the _root_component_id_ defined inside the runner like
  `root_component_id = "autocoder_root"`
- _main_flow_: The element id added to _implementation_flow_ inside agent definition
  `agent.flow("main_flow", implementation_flow)`
- _dynamic_repo_analysis_: Node id of first node inside _implementation_flow_
  `implementation_flow.node("dynamic_repo_analysis", FolderAnalyzerNode(...`

But wait, where are the folders for the second and third nodes with ids _code_generator_ and _code_generator_file_ops_
inside _implementation_flow_? If you see them missing, it's because you haven't set credentials file correctly. Update
the `dev_agents/.dhenara/.secrets/.credentials.yaml`, and keep entries for only the providers you use.

### Debugging

All the logs from the runs are kept inside the `.trace/logs.jsonl` in a jsonl format. If you haven't set the credentials
correctly, when you open this log file, you will see error messages like below. The easiest way to search for errors is
to search for `"body": "ERROR`. The first error message will look like:

```text
{"body": "ERROR:dhenara.ai.types.resource._resource_config:Error initializing API for provider 'google_vertex_ai': 1 validation error for AIModelAPI\ncredentials\n  Value error ...}
```

### Fix and run

Once you update the credentials correctly, run the agent again:

```bash
dhenara run agent autocoder
```

```bash
(.venv) $ dhenara run agent autocoder
✓ Node dynamic_repo_analysis execution completed
✓ Node code_generator execution completed
✓ Node code_generator_file_ops execution completed
✓ main_flow execution completed
✓ autocoder_root execution completed
Agent standard run completed successfully. Run ID: run_20250514_233729_f3cd51


✅ RUN COMPLETED SUCCESSFULLY
────────────────────────────────────────────────────────────────────────────────
  Run ID: run_20250514_233729_f3cd51
  Artifacts location: .../dev_agents/runs/run_20250514_233729_f3cd51


Logs in .../dev_agents/runs/run_20250514_233729_f3cd51/.trace/logs.jsonl


(.venv) $
```

Now you will see folders for all nodes inside the new artifact directory. If you've set up everything correctly, you'll
see this folder structure inside the run directory:

```text
run_20250514_233729_f3cd51
├── .trace
│   ├── dad_metadata.json
│   ├── logs.jsonl
│   ├── metrics.jsonl
│   └── trace.jsonl
├── autocoder_root
│   └── main_flow
│       ├── code_generator
│       │   ├── outcome.json
│       │   ├── result.json
│       │   └── state.json
│       ├── code_generator_file_ops
│       │   ├── outcome.json
│       │   └── result.json
│       └── dynamic_repo_analysis
│           ├── outcome.json
│           └── result.json
└── static_inputs
```

## Understanding artifacts

We already saw logs in the above section. Similarly, if you enable tracing/metrics, you will see those inside the
`.trace` dir.

For each node, which is in fact doing some _operation_, there will be an artifacts directory within its component
hierarchy. We have kept this hierarchy for 2 reasons:

1. To do a `rerun` on any run, from any node in any hierarchy by passing a `--previous-run-id` and `--entry-point` to
   the run command. This might not look beneficial now, but when you create complex workflows, resuming a previous run
   from a specific node is quite useful as it saves money, time, and energy.

Here's the help output for the run command:

```bash
(.venv) $ dhenara run agent  --help
Usage: dhenara run agent [OPTIONS] IDENTIFIER

Options:
  --project-root TEXT     Root directory of the project repo
  --previous-run-id TEXT  ID of a previous execution to inherit context from
  --entry-point TEXT      Specific point in the execution graph to begin from.
                          Format can be a single element ID or a dot-notation
                          path (e.g., 'agent_id.flow_id.node_id')
  --help                  Show this message and exit.
(.venv) $
```

### Artifact files inside each node

Every node will have 2 artifact files:

- **result.json**: The result of the node execution. This is a model dump of:

  ```python
  class NodeExecutionResult:
      executable_type: ExecutableTypeEnum = Field(...)
      node_identifier: NodeID = Field(...)
      execution_status: ExecutionStatusEnum = Field(...)
      input: NodeInputT | None = Field(default=None)
      output: NodeOutputT | None = Field(default=None)
      outcome: NodeOutcomeT | None = Field(default=None)
      error: str | None = Field(default=None)
      errors: list[str] | None = Field(default=None)
      created_at: datetime = Field(...)
  ```

  where the input, output, and outcome are specific to nodes.

  This is the result we refer to when using a `$hier{node_id}` inside the DAD template.

- **outcome.json**: This is just a convenience file. This file extracts the `outcome` field of a node execution result
  and dumps it separately.

:::tip

Whenever we refer to the _outcome_ field of a node inside a template, like
`$expr{ $hier{code_generator}.outcome.structured.file_operations }`, it is the outcome field of `result.json`, not the
outcome saved inside the `outcome.json`.

In other words, on a rerun, if you edit the `outcome.json`, it will have NO effect, but if you edit the _outcome_ field
inside `result.json`, it will take effect in the next `$hier{}` reference.

:::

For an AIModelNode, there will be an extra file:

- **state.json**: Contains the actual LLM API call parameters including the final prompt (after processing DAD templates
  if any). This is quite useful for debugging LLM API calls.

## Enhancing the Single-Shot Implementation

There are several ways to enhance this basic implementation:

1. **Accept task description from user input**: Modify the handler to prompt the user for a task description
2. **Add error handling**: Implement error checking for AI model responses
3. **Support multiple task types**: Add capability to handle different kinds of coding tasks

## What's Next?

In [Part 2: Planning Flow](./planning.md), we'll enhance our coding assistant by adding a planning capability. This will
enable it to break down complex tasks into smaller, manageable steps before implementation.
