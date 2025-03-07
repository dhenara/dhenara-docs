---
title: Installation
---

# Installing Dhenara

Dhenara is available on PyPI and can be installed using pip.

## Requirements

- Python 3.10 or higher

## Basic Installation

```bash
pip install dhenara
```

This installs the core Dhenara library with support for all available AI model providers.

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
pip install dhenara
```

## Installing from Source

```bash
git clone https://github.com/dhenara/dhenara.git
cd dhenara
pip install -e .
```

## Provider-specific Dependencies

Dhenara automatically installs the necessary dependencies for all supported providers.


{/*
However, you can install provider-specific packages individually if needed:

```bash
# For OpenAI only
pip install "dhenara[openai]"

# For Google AI only
pip install "dhenara[google]"

# For Anthropic only
pip install "dhenara[anthropic]"

# For development
pip install "dhenara[dev]"
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
import dhenara

print(f"Dhenara version: {dhenara.ai.__version__}")
```

## Troubleshooting

If you encounter issues with installation:

- Ensure you have the latest pip: `pip install --upgrade pip`
- Try installing with the `--verbose` flag: `pip install --verbose dhenara`
- For provider-specific issues, check that you have the required credentials properly configured

## Next Steps

- Continue to [Quick Start](./quick-start) for your first Dhenara application

{/*
- Configure [authentication](../guides/authentication) for your AI providers
- Explore [foundation models](../foundation-models/overview)
*/}
