---
sidebar_position: 5
---

# Part 4: Coordinator Flow

In the previous parts, we built a planning flow and an enhanced implementation flow. Now we'll create a coordinator flow
that brings everything together to create a complete command-line coding assistant.

The coordinator flow will:

1. Run the planner to generate a structured plan
2. Iterate through each task in the plan
3. Run the implementation flow for each task in sequence
4. Handle errors and track progress

## Creating the Coordinator Flow

Let's create a coordinator flow that orchestrates the entire process:

```python
# src/agents/planner_coder/flows/coordinator.py
from dhenara.agent.dsl import FlowDefinition
from dhenara.agent.dsl.inbuilt.flow_nodes.command import CommandNode, CommandNodeSettings
from dhenara.ai.types import ObjectTemplate

from .implementation import implementation_flow
from .planner import planner_flow

# Create the coordinator flow
coordinator_flow = FlowDefinition()

# 1. Run the planner to generate tasks
coordinator_flow.subflow(
    "planner",
    planner_flow,
    # No variables needed as planner_flow will prompt the user for the task description
)

# 2. Check if planning was successful
coordinator_flow.conditional(
    id="plan_executor",
    statement=ObjectTemplate(
        expression="$expr{py: $hier{planner.plan_generator}.outcome.structured is not None}",
    ),
    # If planning was successful, iterate through each task
    true_branch=FlowDefinition().for_each(
        id="implementation_loop",
        statement=ObjectTemplate(
            expression="$expr{py: $hier{planner.plan_generator}.outcome.structured.implementation_tasks}",
        ),
        item_var="task_spec",
        index_var="task_index",
        max_iterations=20,  # Limit to 20 tasks for safety
        body=implementation_flow,  # Use our implementation flow for each task
    ),
    # If planning failed, show an error message
    false_branch=FlowDefinition().node(
        "no_plan_generated",
        CommandNode(
            settings=CommandNodeSettings(
                commands=[
                    "echo 'Planning was unsuccessful. Please check the logs and try again.'",
                ],
            )
        ),
    ),
)

# 3. Final summary (optional)
coordinator_flow.node(
    "implementation_summary",
    CommandNode(
        settings=CommandNodeSettings(
            commands=[
                "echo '\n--- Implementation Summary ---'",
                "echo 'Plan: $expr{py: $hier{planner.plan_generator}.outcome.structured.title}'",
                "echo 'Tasks completed: $expr{py: len($hier{implementation_loop}.outcome.iterations)}'",
                "echo 'Validation steps:'",
                "echo '$expr{py: "\n".join([f"- {step}" for step in $hier{planner.plan_generator}.outcome.structured.validation_steps])}'",
                "echo '\nImplementation completed. Check the run directory for results.'",
            ],
        )
    ),
)
```

## Updating the Agent Definition

Now let's update the main agent.py file to use our coordinator flow:

```python
# src/agents/planner_coder/agent.py
from dhenara.agent.dsl import AgentDefinition

from .flows.coordinator import coordinator_flow

# Main Agent Definition
agent = AgentDefinition()
agent.flow(
    "coordinator_flow",
    coordinator_flow,
)
```

## Setting Up the Runner

In our runner file, make sure we're using the updated agent:

```python
# src/runners/planner_coder.py
from dhenara.agent.dsl.events import EventType
from dhenara.agent.run import RunContext
from dhenara.agent.runner import AgentRunner
from dhenara.agent.utils.helpers.terminal import (
    print_component_completion,
    print_node_completion,
)

# Import our agent and handler
from src.agents.planner_coder.agent import agent
from src.agents.planner_coder.handler import planner_coder_input_handler
from src.runners.defs import observability_settings, project_root

# Configure the agent with a root ID
root_component_id = "planner_coder_root"
agent.root_id = root_component_id

# Create run context
run_context = RunContext(
    root_component_id=root_component_id,
    observability_settings=observability_settings,
    project_root=project_root,
    run_root_subpath="agent_planner_coder",
)

# Register event handlers
run_context.register_event_handlers(
    handlers_map={
        EventType.node_input_required: planner_coder_input_handler,
        # Optional notification events
        EventType.node_execution_completed: print_node_completion,
        EventType.component_execution_completed: print_component_completion,
    }
)

# Create a runner
runner = AgentRunner(agent, run_context)

# This enables command line execution
async def main():
    runner.setup_run()
    await runner.run()


if __name__ == "__main__":
    import asyncio

    asyncio.run(main())
```

## Running the Complete Coding Assistant

Now you can run your complete coding assistant:

```bash
dad agent run planner_coder
```

When you run this command, the following will happen:

1. The planner flow will prompt you for a task description
2. The planner will analyze your codebase and generate a structured plan with multiple tasks
3. The coordinator will iterate through each task in the plan
4. For each task, the implementation flow will:
   - Analyze the specific files needed for that task
   - Generate code to implement the task
   - Execute the file operations
5. After all tasks are completed, a summary will be displayed

## Understanding the Flow Execution

Let's understand the flow of execution in our coding assistant:

1. **Coordinator Flow**: Orchestrates the entire process

   - Runs the planner flow
   - Checks if planning was successful
   - Iterates through each task
   - Displays a summary

2. **Planner Flow**: Breaks down complex tasks

   - Analyzes the codebase
   - Creates a structured plan with tasks
   - Returns the plan to the coordinator

3. **Implementation Flow**: Implements each task
   - Analyzes task-specific context
   - Generates implementation code
   - Executes file operations
   - Returns the result to the coordinator

## Enhancing the Coding Assistant

There are many ways to enhance our coding assistant further:

1. **Error Handling**: Add better error handling to recover from failures in specific tasks

2. **Parallel Execution**: Implement parallel execution for independent tasks

3. **User Feedback**: Add user feedback prompts at key points in the process

4. **Git Integration**: Add automatic Git commits after each task or at the end

5. **Testing**: Add automated testing of the implemented code

6. **Progress Tracking**: Implement a progress tracking UI

## Conclusion

Congratulations! You've built a complete command-line coding assistant using the Dhenara Agent DSL framework. This
assistant can:

1. Accept complex coding tasks from users
2. Break them down into manageable steps
3. Implement each step with precise file operations
4. Track progress and provide a summary

This tutorial has demonstrated the power of the DAD framework for building complex AI agents. The modular design allows
you to add new capabilities or modify existing ones as needed.

## Next Steps

Now that you've built your coding assistant, here are some ways to explore further:

1. **Try Different Tasks**: Test your assistant with different types of coding tasks

2. **Customize for Specific Languages**: Optimize your assistant for specific programming languages

3. **Add Visualization**: Implement visualization for the planning and implementation process

4. **Explore Advanced Features**: Check out the advanced guides in the DAD documentation

5. **Connect to Dhenara Hub**: Integrate your agent with Dhenara Hub for monitoring and management

Thank you for following this tutorial! We hope you've gained a deeper understanding of how to build practical AI agents
using the Dhenara Agent DSL framework.
