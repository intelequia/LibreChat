---
date: 2025-07-23
title: 🚀 LibreChat v0.7.9
description: The v0.7.9 release of LibreChat
version: "0.7.9"
---

## What's Changed

### 🏞️ Highlights

**🤖 Streamlined Endpoints Framework** - All endpoints have been unified under the LibreChat Agents framework, simplifying the architecture and improving consistency across different AI providers. This major refactoring consolidates the codebase and enables better feature parity across all supported models.

**🔍 Web Search** - New native Web search functionality with SearXNG/Serper, Firecrawl scraping, and semantic reranking. Provider-native web search is also now available for OpenAI, Anthropic, and Google.

**🧠 User Memories for Conversational Context** - Smart memory system for context across conversations. Users can view, edit, and delete their memories through a dedicated interface, with configurable options

**🎏 Enhanced Model Context Protocol (MCP) Support** - Added Streamable HTTP transport, OAuth 2.0 discovery, user-provided credentials for MCP servers from the UI, dynamic placeholder and Smithery support, while improving server compatibility

**🤖 Latest LLM Support & Advanced Parameters** - Including OpenAI's omni-pro and deep-research models through the new Responses API, alongside Grok 4, Claude 4, Moonshot AI's Kimi, and other latest releases.

**📈 User Feedback System** - A new chat rating system allows users to provide feedback on AI responses

**🖼️ File Handling** - Improved support for various file formats including HEIC images, H files, client-side image resizing to prevent upload errors, and GIF avatar support with dynamic file extensions.

**⚡Performance & Reliability** - Optimizations including MeiliSearch sync processing improvements, new performance considerations, and extended error handling across the platform.

**🔐 Security Enhancements** - Additional rate limiting, permission validations, and fixes for several CVEs

**⚙️ Expanded Configuration** - Major update with new OCR providers (Azure/Vertex AI), Titling Customization, **[and more.](https://www.librechat.ai/changelog)**
