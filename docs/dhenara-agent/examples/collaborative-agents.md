---
title: Collaborative Coding Agent
---

# Collaborative Coding Agent

This example demonstrates an agent that facilitates collaborative coding by using specialized subagents for different aspects of development.

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

from src.agents.collab.types import DesignSpec, ImplementationPlan, TestPlan

# Create specialized subagents

# 1. Design agent - creates a detailed design specification
design_agent = AgentDefinition()
design_flow = FlowDefinition()

design_flow.node(
    "requirement_analyzer",
    AIModelNode(
        pre_events=[EventType.node_input_required],
        resources=ResourceConfigItem.with_models("claude-3-opus"),
        settings=AIModelNodeSettings(
            system_instructions=[
                "You are a software design expert. Create detailed design specifications from requirements."
            ],
            prompt=Prompt.with_dad_text(
                text=(
                    "Create a detailed design specification for the following requirements:\n\n"
                    "$var{requirements}\n\n"
                    "The design should include:\n"
                    "- Architecture overview\n"
                    "- Component breakdown\n"
                    "- API definitions\n"
                    "- Data models\n\n"
                    "Return a structured DesignSpec object."
                ),
            ),
            model_call_config=AIModelCallConfig(
                structured_output=DesignSpec,
                max_output_tokens=16000,
            ),
        ),
    ),
)

design_agent.flow("main", design_flow)

# 2. Implementation agent - implements the design
implementation_agent = AgentDefinition()
implementation_flow = FlowDefinition()

implementation_flow.node(
    "repo_analyzer",
    FolderAnalyzerNode(
        settings=FolderAnalyzerSettings(
            base_directory="$var{repo_dir}",
            operations=[
                FolderAnalysisOperation(
                    operation_type="analyze_folder",
                    path="src",
                    include_patterns=["*.py"],
                    exclude_patterns=["__pycache__"],
                    include_content=True
                )
            ]
        )
    )
)

implementation_flow.node(
    "plan_creator",
    AIModelNode(
        resources=ResourceConfigItem.with_models("claude-3-7-sonnet"),
        settings=AIModelNodeSettings(
            system_instructions=[
                "You are an implementation planner. Create a detailed plan for implementing a design."
            ],
            prompt=Prompt.with_dad_text(
                text=(
                    "Create an implementation plan for the following design:\n\n"
                    "Design: $var{design_spec}\n\n"
                    "Repository structure: $hier{repo_analyzer}.outcome.structured\n\n"
                    "The plan should include:\n"
                    "- Files to create or modify\n"
                    "- Implementation order\n"
                    "- Key considerations\n\n"
                    "Return an ImplementationPlan object."
                ),
            ),
            model_call_config=AIModelCallConfig(
                structured_output=ImplementationPlan,
                max_output_tokens=16000,
            ),
        ),
    ),
)

implementation_flow.node(
    "code_implementer",
    FileOperationNode(
        settings=FileOperationNodeSettings(
            base_directory="$var{repo_dir}",
            operations_template=ObjectTemplate(
                expression="$hier{plan_creator}.outcome.structured.file_operations"
            ),
            stage=True,
            commit=True,
            commit_message="Implemented design according to plan"
        )
    )
)

implementation_agent.flow("main", implementation_flow)

# 3. Testing agent - creates and runs tests
testing_agent = AgentDefinition()
testing_flow = FlowDefinition()

testing_flow.node(
    "repo_analyzer",
    FolderAnalyzerNode(
        settings=FolderAnalyzerSettings(
            base_directory="$var{repo_dir}",
            operations=[
                FolderAnalysisOperation(
                    operation_type="analyze_folder",
                    path="src",
                    include_patterns=["*.py"],
                    exclude_patterns=["__pycache__"],
                    include_content=True
                )
            ]
        )
    )
)

testing_flow.node(
    "test_planner",
    AIModelNode(
        resources=ResourceConfigItem.with_models("claude-3-7-sonnet"),
        settings=AIModelNodeSettings(
            system_instructions=[
                "You are a testing expert. Create comprehensive test plans for software components."
            ],
            prompt=Prompt.with_dad_text(
                text=(
                    "Create a test plan for the following implementation:\n\n"
                    "Design: $var{design_spec}\n\n"
                    "Implementation: $var{implementation_plan}\n\n"
                    "Repository structure: $hier{repo_analyzer}.outcome.structured\n\n"
                    "The test plan should include:\n"
                    "- Unit tests\n"
                    "- Integration tests\n"
                    "- Test file structure\n\n"
                    "Return a TestPlan object."
                ),
            ),
            model_call_config=AIModelCallConfig(
                structured_output=TestPlan,
                max_output_tokens=16000,
            ),
        ),
    ),
)

testing_flow.node(
    "test_implementer",
    FileOperationNode(
        settings=FileOperationNodeSettings(
            base_directory="$var{repo_dir}",
            operations_template=ObjectTemplate(
                expression="$hier{test_planner}.outcome.structured.file_operations"
            ),
            stage=True,
            commit=True,
            commit_message="Implemented tests based on test plan"
        )
    )
)

testing_agent.flow("main", testing_flow)

# Main collaborative agent
collaborative_agent = AgentDefinition()

# Add subagents
collaborative_agent.subagent("designer", design_agent)
collaborative_agent.subagent("implementer", implementation_agent)
collaborative_agent.subagent("tester", testing_agent)

# Coordination flow to manage the collaboration
coordination_flow = FlowDefinition()

coordination_flow.node(
    "coordinator",
    AIModelNode(
        pre_events=[EventType.node_input_required],
        resources=ResourceConfigItem.with_models("claude-3-5-haiku"),
        settings=AIModelNodeSettings(
            system_instructions=[
                "You are a project coordinator. Manage the collaboration between design, implementation, and testing teams."
            ],
            prompt=Prompt.with_dad_text(
                text=(
                    "Coordinate the development process for the following project:\n\n"
                    "Project: $var{project_name}\n\n"
                    "Requirements: $var{requirements}\n\n"
                    "Design: $hier{designer.main.requirement_analyzer}.outcome.structured\n\n"
                    "Implementation: $hier{implementer.main.plan_creator}.outcome.structured\n\n"
                    "Tests: $hier{tester.main.test_planner}.outcome.structured\n\n"
                    "Provide a summary of the development process and coordination efforts."
                ),
            ),
        ),
    ),
)

collaborative_agent.flow("coordination", coordination_flow)

# Execute the agent
result = await collaborative_agent.execute(
    execution_context=AgentExecutionContext(
        component_id="collaborative_agent",
        component_definition=collaborative_agent,
        run_context=run_context
    )
)
```

## Key Concepts

### Specialized Subagents

Different aspects of development are handled by specialized subagents:

```python
# Create specialized subagents
design_agent = AgentDefinition()
implementation_agent = AgentDefinition()
testing_agent = AgentDefinition()

# Main collaborative agent
collaborative_agent = AgentDefinition()

# Add subagents
collaborative_agent.subagent("designer", design_agent)
collaborative_agent.subagent("implementer", implementation_agent)
collaborative_agent.subagent("tester", testing_agent)
```

This separation of concerns allows each subagent to focus on its specific responsibility.

### Agent Coordination

The main agent coordinates the work of the subagents, ensuring proper information flow:

```python
# Coordination flow to manage the collaboration
coordination_flow = FlowDefinition()
coordination_flow.node(
    "coordinator",
    AIModelNode(...)
)
collaborative_agent.flow("coordination", coordination_flow)
```

The coordination flow collects and integrates outputs from all subagents.

### Hierarchical References

Results from subagents are referenced using the hierarchical reference system:

```python
Prompt.with_dad_text(
    text=(
        "...\n"
        "Design: $hier{designer.main.requirement_analyzer}.outcome.structured\n\n"
        "Implementation: $hier{implementer.main.plan_creator}.outcome.structured\n\n"
        "Tests: $hier{tester.main.test_planner}.outcome.structured\n\n"
        "..."
    )
)
```

The `$hier{...}` syntax provides access to outputs from any component in the hierarchy.

### Progressive Refinement

The process flows from high-level design to detailed implementation to comprehensive testing:

1. Design agent creates specifications from requirements
2. Implementation agent creates a plan based on the design
3. Testing agent creates tests based on the implementation

This progressive refinement ensures that each stage builds upon the outputs of previous stages.

## Use Cases

This collaborative agent pattern is useful for:

- Full-stack feature development with multiple components
- Complex systems requiring specialized expertise
- Projects with well-defined development phases
- Teams adopting a separation of concerns approach

## Extensions

This pattern can be extended in several ways:

- Add a UX design subagent for frontend components
- Include a documentation subagent to generate technical docs
- Add a DevOps subagent for deployment configuration
- Implement feedback loops for iterative refinement