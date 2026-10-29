---
date: 2025-12-11
title: 🚀 LibreChat v0.8.1
description: The v0.8.1 release of LibreChat
version: "0.8.1"
---

## 🏞️ Highlights

Major features and improvements since [v0.8.0](https://www.librechat.ai/changelog/v0.8.0)

### 🤖 Agent Handoffs (Beta)
Agents can now be configured to transfer control of conversations to other specialist agents when specific expertise is needed.

### 📎 Upload to Provider Support
Files can now be directly uploaded to and handled by supported providers, removing the need for intermediate OCR and other multimodal processing steps.

### 🖼️ Improved Artifact Management and Shareability
Artifacts have been improved with version control capabilities, better UI interactions and rendering support, and can now be viewed within shared conversations.

### 🤖 Model Updates
- **Gemini 3** support with pricing
- **GPT-5.1** support with codex variants
- **Grok 4** variants (fast, 4-1-fast, code-fast) with context rates
- **Claude Opus 4.5 & Haiku 4.5** with token rates and window limits
- **Zhipu AI GLM** family support with comprehensive context windows and pricing
- Enhanced model pricing coverage for **DeepSeek R1/V3**, **Qwen family**, **Amazon Nova Premier**, **Llama 3.3**, **gpt-5-pro** and others with improved pattern matching

### ⚙️ Other Notable Changes
- Langfuse Tracing support
- Helicone AI Gateway integration
- Bedrock Prompt Caching support
- Screens are now prevented from sleeping during response generation
- File names can now be used as context for Anthropic document uploads
- Distributed Leader Election with Redis for multi-server-instance coordination within cluster deployments
- Whether specific tool badges (file search, mcp servers, etc.) will be rendered in the chat input can now be configured via Model Specs
- Accessibility improvements across the entire app for better keyboard navigation, screen reader support, and accessibility standards compliance
- Helm Chart enhancements: custom deployment labels, annotations, init containers, ConfigMaps support, and additional RAG API environment variables
- MCP Registry System restructure with distributed caching, leader-follower coordination, timeout-protected server initialization, and user-scoped tool caching
