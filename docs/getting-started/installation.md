---
sidebar_position: 2
---

# Installing Dhenara

Dhenara is available on PyPI and can be installed using pip.

## Requirements

- Python 3.9 or higher
- Dependencies for specific providers (see Provider-specific Requirements)

## Basic Installation

```bash
pip install dhenara
```

This installs the core Dhenara library with support for all available AI model providers.

## Provider-specific Installation

If you only need certain providers, you can install just those dependencies:

```bash
# For OpenAI support only
pip install "dhenara[openai]"

# For Google AI support only
pip install "dhenara[google]"

# For Anthropic support only
pip install "dhenara[anthropic]"

# For multiple specific providers
pip install "dhenara[openai,google]"
```

## Installing from Source

```bash
git clone https://github.com/dhenara/dhenara.git
cd dhenara
pip install -e .
```

## Provider-specific Requirements

Different AI providers may have specific requirements:

- **OpenAI**: Requires an OpenAI API key
- **Google AI**: Requires a Google API key or service account credentials
- **Anthropic**: Requires an Anthropic API key
- **Microsoft Azure**: Requires Azure OpenAI or Azure AI services credentials
- **Amazon Bedrock**: Requires AWS credentials with Bedrock access

## Verifying Installation

You can verify your installation with:

```python
import dhenara

print(f"Dhenara version: {dhenara.__version__}")
```

## Next Steps

- Continue to [Quick Start](./quick-start) for your first Dhenara application

{/*
- Configure [authentication](../guides/authentication) for your AI providers
- Explore [foundation models](../foundation-models/overview)
*/}
