# Installation

### TL;DR

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install dhenara-agent
dhenara --help
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

## Installation Steps

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

If you want to contribute to DAD or run the latest development version, you can install from the source code. You can
even install it in editable mode during development, allowing you to add custom debug and print messages:

```bash
git clone https://github.com/dhenara/dhenara-agent.git
cd dhenara-agent
pip install -e .
```

Alternatively:

```bash
pip install -e "git+https://github.com/dhenara/dhenara-agent.git"
```

## Verify Installation

Verify your installation by running a simple CLI command:

```bash
# Make sure your virtualenv is activated
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
dhenara --help
```

You should see the available CLI commands:

```bash
(.venv) $ dhenara --help
Usage: dhenara [OPTIONS] COMMAND [ARGS]...

  Dhenara Agent DSL (DAD) development toolkit.

Options:
  --help  Show this message and exit.

Commands:
  create        Create new Dhenara components.
  run           Run DAD components.
  startproject  Create a new agent project with folder structure.
(.venv) $
```

## Next Steps

Now that you have installed DAD, you can proceed to the [Quick Start](quick-start) guide to create your first agent, or
explore the [Core Concepts](core-concepts) to understand the fundamental building blocks of DAD.
