---
title: Installation
---

# Installing Dhenara

Dhenara is available on PyPI and can be installed using `pip` or `uv`.

## Requirements

- Python 3.13

  Dhenara currently targets Python 3.13 to keep typing, providers, and structured-output support consistent.

## Basic Installation

```bash
pip install dhenara-ai
```

This installs the core Dhenara library with support for all available AI model providers.

## Using `uv` (Recommended)

`uv` supports two common workflows:

### A) You have a project (`pyproject.toml`)

```bash
# (optional) create a new project
uv init

# add dependency to pyproject.toml
uv add dhenara-ai

# create/update .venv and install from the lockfile
uv sync
```

Run without activating the venv:

```bash
uv run python -c "import dhenara.ai as dai; print(dai.__version__)"
```

### B) You just want a quick install into an existing venv

```bash
uv pip install dhenara-ai
```

## Using a Virtual Environment (Recommended)

It's best practice to use a virtual environment for Python projects:

```bash
# Create a virtual environment
python -m venv .venv

# Activate the environment (Linux/Mac)
source .venv/bin/activate

# Activate the environment (Windows)
.venv\Scripts\activate

# Install Dhenara
pip install dhenara-ai
```

Using `uv`:

```bash
# Create a virtual environment (creates .venv)
uv venv

# Option 1: activate + use normal python/pip
source .venv/bin/activate
pip install dhenara-ai

# Option 2: don't activate; run/install via uv
uv pip install dhenara-ai
uv run python -c "import dhenara.ai as dai; print(dai.__version__)"
```

## Installing from Source

```bash
git clone https://github.com/dhenara/dhenara-ai.git
cd dhenara-ai

# Editable install
pip install -e .

# Or with uv
uv sync --all-extras
```

## Provider-specific Dependencies

Dhenara automatically installs the necessary dependencies for all supported providers.


{/*
However, you can install provider-specific packages individually if needed:

```bash
# For OpenAI only
pip install "dhenara-ai[openai]"

# For Google AI only
pip install "dhenara-ai[google]"

# For Anthropic only
pip install "dhenara-ai[anthropic]"

# For development
pip install "dhenara-ai[dev]"
```
*/}

## Provider-specific Requirements

Different AI providers have specific requirements:

- **OpenAI**: Requires an OpenAI API key
- **Google Gemini AI**: Requires a Gemini API key or service account credentials
- **Google Vertex AI**: Requires service account credentials
- **Anthropic**: Requires an Anthropic API key
- **Microsoft Azure**: Requires Azure OpenAI or Azure AI services credentials
- **Amazon Bedrock**: Requires AWS credentials with Bedrock access
- **DeepSeek**: Accessible via Azure AI services

## Verifying Installation

You can verify your installation with:

```python
import dhenara.ai as dai

print(f"Dhenara version: {dai.__version__}")
```

## Troubleshooting

If you encounter issues with installation:

- Ensure you have the latest pip: `pip install --upgrade pip`
- Try installing with the `--verbose` flag: `pip install --verbose dhenara-ai`
- For provider-specific issues, check that you have the required credentials properly configured

## Next Steps

- Continue to [Quick Start](./quick-start) for your first Dhenara application

{/*
- Configure [authentication](../guides/authentication) for your AI providers
- Explore [foundation models](../foundation-models/overview)
*/}
