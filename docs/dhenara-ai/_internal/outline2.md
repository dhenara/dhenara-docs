# Dhenara AI Documentation Outline

Based on the code review, here's a comprehensive documentation outline for the Dhenara AI package. This structure follows the initial outline but has been expanded and reorganized to better reflect the actual code organization and functionality.

## Getting Started
- Introduction
  - What is Dhenara AI?
  - Key Features
  - Comparison to LangChain
- Installation
  - Requirements
  - Installation Steps
- Quick Start
  - Basic Chat Generation
  - Basic Image Generation
- Key Concepts
  - AI Models and Endpoints
  - Provider Architecture
  - Types System
  - Response Structure

## Core Components
- AIModelClient
  - Overview
  - Initialization
  - Synchronous vs Asynchronous Usage
  - Method Reference
- Models
  - Foundation Models
  - Creating Custom Models
  - Model Settings
- Types System
  - BaseModel and BaseEnum
  - Request/Response Types
  - Streaming Response Types
  - Content Types

## Provider Guides
- OpenAI
  - Configuration
  - Text Generation
  - Image Generation
  - Streaming Support
- Google AI
  - Configuration
  - Text Generation
  - Image Generation
  - Streaming Support
- Anthropic
  - Configuration
  - Text Generation
  - Streaming Support
- DeepSeek
  - Configuration
  - Text Generation

## Working with Providers
- Provider Setup
  - API Keys and Credentials
  - Provider Configuration
- Using Multiple Providers
- Provider-specific Features
- Creating Custom Providers

## Streaming Responses
- Introduction to Streaming
- Synchronous Streaming
- Asynchronous Streaming
- Handling Streaming Events
- Stream Manager

## File Integration
- Supported File Types
- Adding Files to Prompts
- File Processing
- Image Content

## Usage Tracking and Cost Management
- Usage Tracking
- Cost Calculation
- Setting Cost Parameters

## Advanced
- Configuration System
  - Default Settings
  - Custom Settings
- Error Handling
  - Common Errors
  - Retry Mechanism
  - Streaming Errors
- Performance Optimization
  - Resource Management
  - Connection Reuse
- Testing Mode
  - Using Test Mode
  - Creating Mock Responses

## API Reference
- AI Model Client
  - AIModelClient
  - AIModelClientFactory
- Base Types
  - BaseModel
  - BaseEnum
- Provider Types
  - AIModelProviderClientBase
  - Provider-specific Clients
- Model Types
  - AIModel
  - FoundationModel
  - AIModelAPI
  - AIModelEndpoint
- Response Types
  - ChatResponse
  - ImageResponse
  - StreamingChatResponse
- Configuration Types
  - AIModelCallConfig
  - Settings

## Contributing
- Setting Up Development Environment
- Code Structure
- Testing
- Submission Guidelines

## Migration
- From LangChain to Dhenara
- API Differences
- Equivalent Patterns