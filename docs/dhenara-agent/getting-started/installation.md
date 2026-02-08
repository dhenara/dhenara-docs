# Installation

:::caution Deprecated

This page describes the legacy Agent DSL package (`dhenara-agent`). It is no longer actively developed.

For new projects, install **Dhenara AI** instead: https://docs.dhenara.com/dhenara-ai/getting-started/installation

:::

## Quick Install

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install dhenara-agent
dad --help
```

## Prerequisites

This guide will help you install the Dhenara Agent DSL (DAD) package and set up your development environment.

:::note

DAD is the name of the agent framework and is available as a Python package named `dhenara-agent`. There is no package
named `dhenara-dad`.

:::

Before installing Dhenara Agent DSL, make sure you have the following prerequisites:

- Python 3.10 or later
- pip or your preferred Python package installer
- virtualenv or conda (recommended for managing environments)

## Standard Installation

### 1. Create a Virtual Environment (Recommended)

It's recommended to install DAD in a virtual environment as you would with any standard Python project:

```bash
# Using virtualenv
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
```

### 2. Install the Dhenara Package

DAD is available as a Python package named `dhenara-agent` and is built on top of the core `dhenara` package. Install
`dhenara-agent` using pip (or your preferred installer):

```bash
pip install dhenara-agent
```

## Development Installation

If you want to contribute to DAD or run the latest development version, you can install from the source code:

### Option 1: Install from Local Repository

```bash
git clone https://github.com/dhenara/dhenara-agent.git
cd dhenara-agent
pip install -e .
```

### Option 2: Install Directly from GitHub

```bash
pip install -e "git+https://github.com/dhenara/dhenara-agent.git"
```

Installing in editable mode (`-e` flag) allows you to modify the source code and see changes immediately without
reinstalling the package.

## Verify Installation

Verify your installation by running a simple CLI command:

```bash
# Make sure your virtualenv is activated
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
dad --help
```

You should see the available CLI commands:

```
(.venv) $ dad --help
Usage: dad [OPTIONS] COMMAND [ARGS]...

  Dhenara Agent DSL (DAD) development toolkit.

Options:
  --version  Show the version and exit.
  --help     Show this message and exit.

Commands:
  agent         Agent-related commands.
  startproject  Create a DAD project with folder structure.
(.venv) $
```

## Setting Up API Keys

Most DAD agents use AI models that require API keys. After creating a project with `dad startproject`, you'll need
to configure these keys in `.dhenara/.secrets/.credentials.yaml`:

```yaml
openai:
  api_key: <YOUR_OPENAI_API_KEY>

google_gemini_api:
  api_key: <YOUR_GOOGLE_GEMINI_API_API_KEY>

anthropic:
  api_key: <YOUR_ANTHROPIC_API_KEY>

# For Google Cloud Vertex AI
google_vertex_ai:
  credentials: <PATH_TO_YOUR_SERVICE_ACCOUNT_JSON_OR_CONTENTS>
```

You can also run agents in test mode by setting `test_mode=True` in AIModelNode configurations, which returns dummy
responses instead of making actual API calls.

## Next Steps

Now that you have installed DAD, proceed to the [Quick Start](quick-start) guide to create your first agent, or explore
the [Core Concepts](../concepts/core-concepts) to understand the fundamental building blocks of DAD.
