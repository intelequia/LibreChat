---
date: 2026-03-09
title: 🚀 LibreChat v0.8.3
description: The v0.8.3 release of LibreChat
version: "0.8.3"
---

## What's Changed

## 🏞️ Highlights

- **Event-Driven Lazy Tool Loading**
  - MCP tools load on-demand, reducing memory load. Includes programmatic tool calling UI.
- **New Models & Providers**
  - Moonshot provider, Claude Opus 4.6 (1M context, adaptive thinking), Sonnet 4.6, GPT-5.3/5.4, Gemini 3.1
  - Bedrock document uploads and reasoning_effort, Gemini Thinking Level parameter
- **Performance**
  - Optimized message re-renders, image preview caching, delta buffering for SSE, Redis scalability improvements.
- **Local Document Text Extraction**
  - PDF, DOCX, XLS/XLSX, and OpenDocument parsing locally.
- **MCP Server Credential Variables**
  - Secure per-user auth for UI-created MCP servers via credential placeholders.
- **Monaco Code Editor for Artifacts**
  - Now reliably allows artifact editing.
- **Agents**
  - Editors can now duplicate agents. Added `messageId` for transaction tracking.
- **Security**
  - TOCTOU-safe SSRF protection, OIDC improvements (RP-initiated logout, configurable email claim)
  - Hardened API routes, `ALLOW_SHARED_LINKS_PUBLIC` defaults to `false`.

---

For detailed changes in each release candidate, see:
- [v0.8.3-rc1](/changelog/v0.8.3-rc1) - Event-Driven Lazy Tool Loading, Moonshot Provider, Claude Opus/Sonnet 4.6, Delta Buffering
- [v0.8.3-rc2](/changelog/v0.8.3-rc2) - Local Document Extraction, Bedrock Document Uploads, Credential Variables for MCP, Agent Duplication
