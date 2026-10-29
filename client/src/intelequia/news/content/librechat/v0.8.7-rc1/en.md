---
date: 2026-06-14
title: 🚀 LibreChat v0.8.7-rc1
description: The v0.8.7-rc1 release of LibreChat
version: '0.8.7-rc1'
---

## What's Changed

### 🏞️ Highlights

- **Access Control, Auth, and MCP**
  - Added granular shared-link permissions, OpenID role sync, configurable OpenID token reuse windows, and MCP On-Behalf-Of token exchange for delegated downstream access.
  - Hardened MCP OAuth prompts, token flow categorization, OpenID audience handling, shared-link caching, auth continuation limiting, ACL principal filtering, runtime user/request placeholders, request-scoped MCP connections, request-scoped MCP tool caching, resumable-run MCP cleanup, outbound proxy handling, and configurable MCP OAuth completion windows.
- **Agents, Skills, and Projects**
  - Added private chat projects, agent file authoring tools, deployment-provided Skills, GitHub Skill Sync, model-spec Skill/Subagent scoping, model-spec conversation starters, soft-default model specs, model-spec landing branding, and the agent marketplace in the model selector.
  - Deployment Skills now take precedence over persisted duplicates, Skill Sync status is scoped correctly, memory-agent input is bounded, and repeated Skill bodies are deduplicated across fresh primes and message history.
- **Safety and Admin Controls**
  - Added configurable message PII filtering for credential-shaped text across caller-supplied API message roles and hardened model-spec Subagent config so clients cannot supply private Subagent allowlists.
- **Observability and Operations**
  - Added authenticated browser RUM proxy mode with isolated auth and outcome metrics, auth fallback observability, opt-in Redis command tracing, Langfuse feedback scores with message context metadata, Node 24 Docker builds, system Chrome mock E2E, and CI type checking for the client workspace.
- **Conversation UX and Reliability**
  - Conversation titles can now generate immediately, message navigation supports focus and drag-to-scrub, message timestamps appear on hover, shared-link snapshots are sanitized, viewed branches stay stable when sibling branches change, file-authoring previews stream earlier, stale service-worker assets auto-recover after deploys, and reopened chats reload correctly from non-chat routes.
- **Provider and Reasoning Updates**
  - Added Claude Fable 5, GPT-5.5, `chat-latest`, and refreshed frontier OpenAI defaults while dropping deprecated OpenAI defaults.
  - Custom endpoints preserve reasoning params, support native Anthropic-compatible providers, withhold custom Anthropic headers from user-controlled URLs, Bedrock cache tokens no longer inflate completion counts, Gemini mixed tool config is enabled, Gemini/Vertex MCP tool schemas are sanitized, Imagen uses its configured region, built-in provider endpoints can forward custom gateway headers, and provider document uploads are preserved.
- **Streaming and Performance**
  - Completed Markdown blocks are memoized during streaming, tool execution can report per-call results through `onResult`, context usage updates in real time with persisted branch/total breakdowns and correct post-summarization baselines, cost display is opt-in by default, token-config caches are scoped correctly, subagent child-run usage is billed into parent transactions, model-spec icons survive stream resume/abort, HEIC conversion, locale resources, React Query Devtools, and Brotli asset serving are lazy/toggled, message tree streaming is covered by E2E tests, and shared package builds now use `tsdown` with isolated declarations.
