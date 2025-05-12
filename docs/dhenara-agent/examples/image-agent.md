---
sidebar_position: 5
---

# Image Generation Agent

This example demonstrates how to create an agent that generates images based on text prompts using Dhenara Agent DSL
(DAD). The Image Generation Agent showcases how DAD can integrate with different AI modalities beyond text.

## Agent Overview

The Image Generation Agent can:

1. Accept text prompts defining the images to generate
2. Select appropriate image generation models
3. Generate multiple images with different parameters
4. Save the generated images to a specified directory

This example demonstrates integrating with image generation models like DALL-E, Imagen, and Midjourney through their
respective API interfaces.

## Agent Structure

The Image Generation Agent consists of the following components:

```plaintext
src/agents/image_gen/
├── __init__.py
├── agent.py           # Main agent definition
├── handler.py         # Event handlers
└── flows/             # Flow definitions
    ├── coordinator.py     # Main coordinator flow
    └── image_generator.py # Image generation flow
```

## Agent Definition

The main agent definition connects the coordinator flow:

```python
from dhenara.agent.dsl import AgentDefinition

from .flows.coordinator import coordinator_flow

agent = AgentDefinition()
agent.flow(
    "imagegen_flow",
    coordinator_flow,
)
```

## Data Models

The agent uses structured data models to define image generation tasks:

```python
from dhenara.agent.types import BaseModel

class ImageTaskSpec(BaseModel):
    filename: str   # Base filename for the generated image
    prompt: str     # Text prompt describing the image to generate

class ImageTask(BaseModel):
    task_specifications: list[ImageTaskSpec]  # List of image specs to generate
```

## Image Generation Flow

The core image generation flow handles single image generation:

```python
from dhenara.agent.dsl import (
    PLACEHOLDER, AIModelNode, AIModelNodeSettings, EventType, FlowDefinition
)
from dhenara.ai.types import AIModelCallConfig, Prompt

# Define available models with their parameters
models_with_options = {
    "gpt-image-1": {
        "quality": "medium",
        "size": "1536x1024",
        "n": 2,
    },
    "imagen-3.0-generate": {
        "aspect_ratio": "16:9",
        "number_of_images": 1,
        "person_generation": "dont_allow",
    },
    "imagen-3.0-fast-generate": {
        "aspect_ratio": "16:9",
        "number_of_images": 1,
        "person_generation": "dont_allow",
    },
}

# Image directory configuration
global_image_directory = "$var{run_root}/global_images"

# Single image generation flow
single_img_flow = FlowDefinition()
single_img_flow.vars(
    {
        "task_spec": PLACEHOLDER,  # Will be populated by the multi-image flow
    }
)

# Image generation node
single_img_flow.node(
    "image_generator",
    AIModelNode(
        models=list(models_with_options.keys()),
        pre_events=[EventType.node_input_required],
        settings=AIModelNodeSettings(
            system_instructions=[
                "You are a professional image generation agent specialized in executing precise image operations.",
            ],
            prompt=Prompt.with_dad_text("$expr{task_spec.prompt}. \nCreate image\n"),
            model_call_config=AIModelCallConfig(
                test_mode=False,
                options={},  # Options will be set by the model handler
            ),
            save_generated_bytes=True,  # Save the images
            bytes_save_path=global_image_directory,
            bytes_save_filename_prefix="$expr{task_spec.filename}",
        ),
    ),
)

# Multi-image flow for batch processing
multi_image_flow = FlowDefinition()
multi_image_flow.vars(
    {
        "image_task": PLACEHOLDER,  # Will be populated by the coordinator
    }
)

# Process each image task specification
multi_image_flow.for_each(
    id="image_gen_loop",
    statement="$expr{image_task.task_specifications}",
    item_var="task_spec",
    max_iterations=20,
    body=single_img_flow,
)
```

## Coordinator Flow

The coordinator flow manages the overall process, including task planning and execution:

```python
from dhenara.agent.dsl import FlowDefinition
from dhenara.agent.dsl.inbuilt.flow_nodes.command import CommandNode, CommandNodeSettings
from dhenara.ai.types import ObjectTemplate

from ...autocoder.flows.planner import planner_flow
from .image_generator import multi_image_flow

# Load task information
task_background = read_background()
task_description = read_description()

# Coordinator flow definition
coordinator_flow = FlowDefinition()

# First, run the planner to generate the image task
coordinator_flow.subflow(
    "planner",
    planner_flow,
    variables={
        "task_background": task_background,
        "task_description": task_description,
    },
)

# Based on planning results, generate images
coordinator_flow.conditional(
    id="plan_executor",
    statement=ObjectTemplate(
        expression="$expr{py: $hier{planner.plan_generator}.outcome.structured is not None}",
    ),
    true_branch=multi_image_flow,
    true_branch_variables={
        "image_task": "$expr{$hier{planner.plan_generator}.outcome.structured}",
    },
    false_branch=FlowDefinition().node(
        "no_plan_generated",
        CommandNode(
            settings=CommandNodeSettings(
                commands=["echo 'Planner is unsuccessful.'"],
            )
        ),
    ),
)
```

## Event Handler

The event handler manages input for the AI model nodes, including model selection and options:

```python
from dhenara.agent.dsl import FlowNodeTypeEnum, NodeInputRequiredEvent
from dhenara.agent.utils.helpers.terminal import get_ai_model_node_input

from .flows.image_generator import ImageTask, models_with_options

async def image_gen_input_handler(event: NodeInputRequiredEvent):
    if event.node_type == FlowNodeTypeEnum.ai_model_call:
        node_input = None

        if event.node_id == "plan_generator":
            # For the planner, select from text generation models
            node_input = await get_ai_model_node_input(
                node_def_settings=event.node_def_settings,
                models=plan_gen_models,
                models_with_options=None,
                enable_option_update=False,
                structured_output=ImageTask,
            )

        elif event.node_id == "image_generator":
            # For image generation, select from image models with options
            node_input = await get_ai_model_node_input(
                node_def_settings=event.node_def_settings,
                models=None,
                models_with_options=models_with_options,
                enable_option_update=True,  # Allow updating model options
                structured_output=None,
            )

        else:
            print(f"WARNING: Unhandled ai_model_call input event for node {event.node_id}")

        event.input = node_input
        event.handled = True
```

## Image Task JSON

You can define image tasks in a JSON file for direct loading:

```json
{
  "task_specifications": [
    {
      "filename": "sunset_beach",
      "prompt": "A breathtaking sunset over a tropical beach with silhouettes of palm trees"
    },
    {
      "filename": "mountain_cabin",
      "prompt": "A cozy cabin in snow-covered mountains with smoke coming from the chimney"
    },
    {
      "filename": "futuristic_city",
      "prompt": "A futuristic city skyline with flying cars and holographic advertisements"
    }
  ]
}
```

## Running the Agent

To run the Image Generation Agent:

```python
from dhenara.agent.dsl.events import EventType
from dhenara.agent.run import RunContext
from dhenara.agent.runner import AgentRunner

from src.agents.image_gen.agent import agent
from src.agents.image_gen.handler import image_gen_input_handler
from src.runners.defs import observability_settings, project_root

root_component_id = "image_gen_root"
agent.root_id = root_component_id

run_context = RunContext(
    root_component_id=root_component_id,
    observability_settings=observability_settings,
    project_root=project_root,
    run_root_subpath="agent_image_gen",
)

run_context.register_event_handlers(
    handlers_map={
        EventType.node_input_required: image_gen_input_handler,
        # Additional event handlers...
    }
)

runner = AgentRunner(agent, run_context)
```

## Output and Artifacts

After running the agent, you'll find:

1. Generated images saved in the `global_images` directory with the specified filenames
2. Run artifacts showing the processing steps and model outputs
3. Context information in the run directory for debugging or analysis

## Customization Options

You can customize this agent in several ways:

- **Model Selection**: Add or modify the available image generation models
- **Model Parameters**: Adjust quality, size, and other model-specific parameters
- **Prompt Engineering**: Enhance prompt templates for better image generation
- **Post-Processing**: Add nodes for image processing after generation
- **Batching Logic**: Modify how image generation tasks are batched and processed

## Conclusion

The Image Generation Agent demonstrates how DAD can integrate with image generation models to create a flexible and
powerful workflow. This example showcases key DAD features like:

- **Multi-modal AI Integration**: Working with both text and image models
- **Structured Data Handling**: Using Pydantic models for task specifications
- **Parameter Customization**: Configuring model-specific parameters
- **Artifact Management**: Saving generated binary data (images)
- **Batch Processing**: Processing multiple image generation tasks

By understanding this example, you can create your own specialized agents that leverage visual AI capabilities within
the DAD framework.
