---
sidebar_position: 4
---

# Key Concepts in Dhenara

Understanding the core concepts of Dhenara will help you use the library effectively. Here are the fundamental concepts you should be familiar with:

## AIModelClient

The primary interface for interacting with AI models. It handles:

- Connection management
- Request formatting
- Response parsing
- Error handling
- Retries and timeouts

Available in both synchronous (`AIModelClientSync`) and asynchronous (`AIModelClient`) versions.

## AIModelEndpoint

Represents a specific AI model accessible through a specific API provider. It combines:

- An `AIModel` definition (capabilities, parameters, costs)
- An `AIModelAPI` configuration (authentication, provider settings)

This separation allows reusing the same model with different API providers or the same API with different models.

## Foundation Models

Pre-configured model definitions for popular AI models from various providers, including:

- OpenAI models (GPT-4o, DALL-E, etc.)
- Google AI models (Gemini Pro, Gemini Flash, etc.)
- Anthropic models (Claude 3, Claude Sonnet, etc.)
- DeepSeek models

These provide sensible defaults and proper configuration for each model, including:
- Context window sizes
- Token limits
- Cost information
- Model capabilities

## Response Types

Dhenara uses a consistent response format across providers:

- `AIModelCallResponse`: The top-level response container
- `ChatResponse`: For text generation responses
- `ImageResponse`: For image generation responses
- Streaming variants of these responses

## Providers

Provider-specific implementations that handle:

- Authentication
- API formatting
- Response parsing
- Error handling

Dhenara supports multiple providers through a unified interface:
- OpenAI
- Google AI
- Anthropic
- DeepSeek
- Microsoft Azure
- Amazon Bedrock

## Streaming

First-class support for streaming responses, allowing for:

- Token-by-token processing
- Progress updates
- Early termination
- Efficient resource usage

## Configuration

Various configuration options to control behavior:

- `AIModelCallConfig`: Control timeouts, retries, and other call parameters
- Global settings via `dhenara.ai.config.settings`
- Model-specific options

## Next Steps

- Read the [installation guide](./installation) if you haven't already
- Try the [quick start examples](./quick-start) to see these concepts in action

{/*
<!--
- Explore the [basic usage guide](../guides/basic-usage) for more practical examples
-->
 */}