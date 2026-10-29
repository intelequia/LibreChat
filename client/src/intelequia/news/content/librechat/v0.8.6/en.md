---
date: 2026-05-31
title: 🚀 LibreChat v0.8.6
description: The v0.8.6 release of LibreChat
version: '0.8.6'
---

## What's Changed

## 🏞️ Highlights

- **Agent Skills & Subagents**
  - Agent Skills package reusable instructions, references, scripts, assets, and permissions into portable capabilities that agents can invoke automatically or on request.
  - Subagents let agents delegate specialized work to other agents while preserving upload, user, and MCP context with recursion and graph limits.
- **Code Execution & Artifacts**
  - Text, source-code, DOCX, CSV, XLSX, and PPTX artifacts can render inline or in the side panel with richer previews.
  - Artifact editing, Gemini PDF media blocks, model-spec icons, and persistent agent resource files received reliability fixes.
- **Observability & Operations**
  - Added Prometheus metrics, backend OpenTelemetry tracing, SSE lifecycle tracing, HyperDX browser RUM, structured logging context, explicit readiness endpoints, file-log controls, and graceful HTTP shutdown.
- **MCP, Auth, and Admin Hardening**
  - Improved MCP remote proxy support, OAuth audience handling, JWT expiry fallback, optional OpenID/MCP client-secret flows, multi-audience OpenID validation, trusted registration overrides, admin-panel SSO redirects, streamable HTTP limits, and MCP permission enforcement for agent tools.
- **Provider and Model Updates**
  - Added Claude Opus 4.8 support, Gemini 3.5 Flash support, Gemini tool combinations, Gemma 4 thinking-level support, model-aware Google/Gemini max output tokens, Bedrock AWS profile/API key support, and Bedrock guardrail handling.
- **Reliability and UI Polish**
  - Hardened retention semantics, user/config response sanitization, configured rich-text rendering, Redis/in-memory generation cleanup, all-data retention for agent files, MCP title rendering, sidebar/chat race handling, hover actions, shared links, generated file chips, and balance script config loading.

For detailed changes in the release candidate, see:

- [v0.8.6-rc1](/changelog/v0.8.6-rc1)
