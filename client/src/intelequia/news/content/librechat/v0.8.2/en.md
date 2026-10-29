---
date: 2026-01-28
title: 🚀 LibreChat v0.8.2
description: The v0.8.2 release of LibreChat
version: "0.8.2"
---

## What's Changed

## 🏞️ Highlights

### 🌊 Resumable LLM Streams with Horizontal Scaling
Cross-replica support for resumable streams in Redis mode, enabling seamless horizontal scaling for production deployments.

### 🏗️ Dynamic MCP Server Management
Add, configure, and share MCP servers directly from the UI with full access control. Includes API key authentication support, domain restrictions for remote transports, and improved OAuth handling.

### 📌 Pin Your Favorites
Pin frequently used agents and models to the sidebar for quick access.

### 📊 Inline Mermaid Diagrams
Render Mermaid diagrams inline within chat messages with enhanced UX and focus rendering.

### 👐 Major Accessibility Overhaul
Extensive improvements to meet WCAG standards with better screen reader support, keyboard navigation, focus management, and contrast ratios across the entire application.

### 🤖 New Model & Provider Support
- **Moonshot Kimi K2** Bedrock support
- **Anthropic Beta** support for Bedrock
- **Anthropic Vertex AI** support
- **Gemini Image Generation Tool** (Nano Banana)
- **Bedrock Guardrails** support
- **GPT-5.1 and GPT-5.2** token pricing updates
- **'Extra High' Reasoning Effort** OpenAI parameter

### ✨ Additional Notable Features
- **Claude Conversation Importer** with thinking support
- **Floating Copy Button** for code blocks
- **Transparent Chat Header** option
- **Custom Group Icon** support for Model Specs
- **OpenRouter Audio/Video** file upload support
- **Custom Endpoint Support** for Memory LLM Config
- **Bedrock Provider Support** for Memory Agent

---

For detailed changes in each release candidate, see:
- [v0.8.2-rc1](/changelog/v0.8.2-rc1) - Dynamic MCP Server Infrastructure, Accessibility Overhaul, Pin Favorites
- [v0.8.2-rc2](/changelog/v0.8.2-rc2) - Resumable Streams, Mermaid Diagrams, Claude Importer, Bedrock Guardrails
- [v0.8.2-rc3](/changelog/v0.8.2-rc3) - Moonshot Kimi K2, Anthropic Beta for Bedrock
