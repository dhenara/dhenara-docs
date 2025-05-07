---
sidebar_position: 1
---

# Installation

This guide will help you install the Dhenara Agent DSL (DAD) package and set up your development environment.


:::note

DAD is the name of this agent framework and the name of the python package is `dhenara-agent`, there is no package named `dad` or `dhenara-dad`.

:::


## Prerequisites

Before installing Dhenara Agent DSL, make sure you have the following prerequisites:

- Python 3.10 or later
- pip (Python package installer)
- virtualenv or conda (recommended for managing environments)

## Installation Steps

### 1. Create a Virtual Environment (Recommended)

It's recommended to install DAD in a virtual environment to avoid conflicts with other packages:

```bash
# Using virtualenv
python -m venv dhenara-env
source dhenara-env/bin/activate  # On Windows: dhenara-env\Scripts\activate

# Or using conda
conda create -n dhenara-env python=3.10
conda activate dhenara-env
```

### 2. Install the Dhenara Package

DAD is built on top of the core `dhenara-ai` package. Below will install both packages using pip:

```bash
pip install dhenara-agent
```

### 3. Install Optional Dependencies

Depending on your use case, you might want to install additional dependencies:

```bash
# For visualization features
pip install dhenara-agent[visualization]

# For observability features (recommended for production)
pip install dhenara-agent[observability]

# For all optional dependencies
pip install dhenara-agent[all]
```

## Development Installation

If you want to contribute to DAD or run the latest development version, you can install from the source code:

```bash
git clone https://github.com/dhenara/dhenara-agent.git
cd dhenara-agent
pip install -e .
```

## Configuration

After installation, you'll need to configure the credentials for the AI models you want to use with DAD.

### Setting up API Keys

It's recommended to use environment variables for API keys:

```bash
# For OpenAI models
export OPENAI_API_KEY=your_openai_api_key

# For Anthropic models
export ANTHROPIC_API_KEY=your_anthropic_api_key

# For Google models
export GOOGLE_API_KEY=your_google_api_key
```

Alternatively, you can create a credentials file at `~/.dhenara/credentials.yaml`:

```yaml
api_keys:
  openai: ${OPENAI_API_KEY}
  anthropic: ${ANTHROPIC_API_KEY}
  google: ${GOOGLE_API_KEY}

endpoints:
  openai: "https://api.openai.com/v1"
  anthropic: "https://api.anthropic.com/v1"
  google: "https://generativelanguage.googleapis.com/v1"

resource_paths:
  models: "~/.dhenara/models"
```

## Verify Installation

Verify your installation by running a simple test script:

```python
from dhenara.agent.dsl import FlowDefinition

# Create a simple flow definition
flow = FlowDefinition()

# If no errors, installation is successful
print("Dhenara Agent DSL installed successfully!")
```

## Next Steps

Now that you have installed DAD, you can proceed to the [Quick Start](quick-start) guide to create your first agent, or explore the [Core Concepts](core-concepts) to understand the fundamental building blocks of DAD.
