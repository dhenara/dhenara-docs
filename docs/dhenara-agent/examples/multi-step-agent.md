---
title: Multi-Step Code Review Agent
---

# Multi-Step Code Review Agent

This example shows a more complex agent that performs multi-step code reviews by first analyzing the code, then generating improvement suggestions, and finally implementing selected improvements.

## Implementation

```python
from dhenara.agent.dsl import (
    AgentDefinition,
    AIModelNode,
    AIModelNodeSettings,
    EventType,
    FileOperationNode,
    FileOperationNodeSettings,
    FlowDefinition,
    FolderAnalyzerNode,
    FolderAnalyzerSettings,
)
from dhenara.ai.types import (
    AIModelCallConfig,
    ObjectTemplate,
    Prompt,
    ResourceConfigItem,
)

from src.agents.code_review.types import CodeReview, CodeImprovements

# Create the code review agent
code_review_agent = AgentDefinition()

# 1. Analysis flow - analyze the code
analysis_flow = FlowDefinition()

# Add a folder analyzer node
analysis_flow.node(
    "repo_analysis",
    FolderAnalyzerNode(
        pre_events=[EventType.node_input_required],
        settings=FolderAnalyzerSettings(
            base_directory="$var{repo_dir}",
            operations=[
                FolderAnalysisOperation(
                    operation_type="analyze_folder",
                    path="$var{target_directory}",
                    include_patterns=["*.py"],
                    exclude_patterns=["__pycache__"],
                    include_content=True
                )
            ]
        )
    )
)

# Add a code analysis node
analysis_flow.node(
    "code_analyzer",
    AIModelNode(
        resources=ResourceConfigItem.with_models("claude-3-opus"),
        settings=AIModelNodeSettings(
            system_instructions=[
                "You are a code review expert. Analyze the provided code for issues and improvement opportunities."
            ],
            prompt=Prompt.with_dad_text(
                text=(
                    "Perform a detailed code review on the following files:\n\n"
                    "$hier{repo_analysis}.outcome.structured\n\n"
                    "Analyze for:\n"
                    "- Code quality issues\n"
                    "- Performance improvements\n"
                    "- Security concerns\n"
                    "- Best practices\n\n"
                    "Return a structured CodeReview object with your findings."
                ),
            ),
            model_call_config=AIModelCallConfig(
                structured_output=CodeReview,
                max_output_tokens=16000,
            ),
        ),
    ),
)

# 2. Improvement flow - generate improvement suggestions
improvement_flow = FlowDefinition()

improvement_flow.node(
    "improvement_generator",
    AIModelNode(
        resources=ResourceConfigItem.with_models("claude-3-opus"),
        pre_events=[EventType.node_input_required],
        settings=AIModelNodeSettings(
            system_instructions=[
                "You are a code improvement expert. Generate specific improvements based on code review findings."
            ],
            prompt=Prompt.with_dad_text(
                text=(
                    "Based on the code review findings, generate specific improvements for the following issues:\n\n"
                    "Code Review: $hier{analysis_flow.code_analyzer}.outcome.structured\n\n"
                    "For each selected issue, provide:\n"
                    "- Detailed explanation of the change\n"
                    "- Specific file operations to implement the change\n\n"
                    "Focus on: $var{improvement_focus}\n\n"
                    "Return a CodeImprovements object with your suggestions."
                ),
            ),
            model_call_config=AIModelCallConfig(
                structured_output=CodeImprovements,
                max_output_tokens=16000,
            ),
        ),
    ),
)

# 3. Implementation flow - implement selected improvements
implementation_flow = FlowDefinition()

implementation_flow.node(
    "improvement_implementer",
    FileOperationNode(
        pre_events=[EventType.node_input_required],
        settings=FileOperationNodeSettings(
            base_directory="$var{repo_dir}",
            operations_template=ObjectTemplate(
                expression="$var{selected_improvements}"
            ),
            stage=True,
            commit=True,
            commit_message="Implemented code improvements based on review"
        )
    )
)

# Add flows to the agent
code_review_agent.flow("analysis", analysis_flow)
code_review_agent.flow("improvement", improvement_flow)
code_review_agent.flow("implementation", implementation_flow)

# Input handlers
async def handle_input_required(event: NodeInputRequiredEvent):
    if event.node_id == "repo_analysis":
        # Get repository and target directory from user
        repo_dir = await get_repo_directory()
        target_directory = await get_target_directory()

        event.input = FolderAnalyzerNodeInput(
            settings_override=FolderAnalyzerSettings(
                base_directory=repo_dir,
                operations=[
                    FolderAnalysisOperation(
                        operation_type="analyze_folder",
                        path=target_directory,
                        include_patterns=["*.py"],
                        exclude_patterns=["__pycache__"],
                        include_content=True
                    )
                ]
            )
        )
        event.handled = True
    elif event.node_id == "improvement_generator":
        # Get improvement focus from user
        improvement_focus = await get_improvement_focus()

        event.input = AIModelNodeInput(
            prompt_variables={
                "improvement_focus": improvement_focus
            }
        )
        event.handled = True
    elif event.node_id == "improvement_implementer":
        # Get selected improvements from user
        all_improvements = get_improvements_from_result(
            execution_context.execution_results["improvement_flow.improvement_generator"]
        )
        selected_improvements = await select_improvements(all_improvements)

        event.input = FileOperationNodeInput(
            settings_override=FileOperationNodeSettings(
                base_directory=repo_dir,
                operations=selected_improvements,
                stage=True,
                commit=True,
                commit_message="Implemented selected code improvements"
            )
        )
        event.handled = True

# Register the input handler
event_bus.register(EventType.node_input_required, handle_input_required)

# Execute the agent
result = await code_review_agent.execute(
    execution_context=AgentExecutionContext(
        component_id="code_review_agent",
        component_definition=code_review_agent,
        run_context=run_context
    )
)
```

## Key Concepts

### Multi-Flow Agent

The agent uses multiple flows for different stages of the process:

```python
# Create the code review agent
code_review_agent = AgentDefinition()

# Define separate flows for different stages
analysis_flow = FlowDefinition()
improvement_flow = FlowDefinition()
implementation_flow = FlowDefinition()

# Add flows to the agent
code_review_agent.flow("analysis", analysis_flow)
code_review_agent.flow("improvement", improvement_flow)
code_review_agent.flow("implementation", implementation_flow)
```

This structure separates concerns and makes the overall process more modular and maintainable.

### Flow Dependencies

Later flows depend on the results from earlier flows, accessed via hierarchical references:

```python
# Improvement flow uses results from analysis flow
Prompt.with_dad_text(
    text=(
        "...\n"
        "Code Review: $hier{analysis_flow.code_analyzer}.outcome.structured\n\n"
        "..."
    )
)
```

The hierarchical reference system (`$hier{...}`) enables connections between different flows.

### Interactive Selection

The user can review and select which improvements to implement:

```python
# In the input handler
all_improvements = get_improvements_from_result(
    execution_context.execution_results["improvement_flow.improvement_generator"]
)
selected_improvements = await select_improvements(all_improvements)
```

This adds a human-in-the-loop element to the automation process.

### Structured Outputs

Each AI model node produces structured outputs that are consumed by subsequent nodes:

```python
model_call_config=AIModelCallConfig(
    structured_output=CodeReview,  # Custom structured output type
    max_output_tokens=16000,
)
```

Structured outputs ensure consistent, predictable data flow between components.

## Use Cases

This multi-step code review agent pattern is useful for:

- Comprehensive code quality improvement processes
- Security vulnerability remediation
- Technical debt reduction campaigns
- Codebase standardization and consistency enforcement

## Extensions

This pattern can be extended in several ways:

- Add a prioritization flow to rank issues by importance
- Include automated testing to verify improvements
- Add a reporting flow to generate summaries of changes
- Implement iterative improvement cycles