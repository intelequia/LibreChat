---
date: 2026-05-13
title: 🚀 LibreChat v0.8.6-rc1
description: The v0.8.6-rc1 release of LibreChat
version: '0.8.6-rc1'
---

## What's Changed

### 🏞️ Highlights

- **Agent Skills**
  - Agent Skills let you package reusable agent behavior into `SKILL.md` bundles: instructions, reference files, scripts, assets, and tool permissions can travel together as a capability an agent can invoke automatically, on request, or always-on.
  - Skills can be imported, size-limited, shared through ACLs, and scoped per agent, making it easier to build repeatable workflows without baking every instruction into the agent prompt.
- **Subagents**
  - Subagents let agents call other agents as tools, so a primary agent can delegate specialized work, run independent passes in parallel, or even call a configured copy of itself for fan-out style problem solving.
  - Subagent runs preserve the surrounding upload, user, and MCP context while enforcing recursion and graph limits, which keeps multi-agent execution powerful without making it unbounded.
- **Code Execution & Artifacts**
  - Text, source-code, DOCX, CSV, XLSX, and PPTX artifacts can render inline or in the side panel with richer previews.
  - Nested artifact paths, Unicode filenames, file metadata encoding, and generated-code context filtering received several hardening passes.
- **CloudFront + S3 File Delivery**
  - New CloudFront file strategy support includes signed cookies, signed downloads, strict signed-access enforcement, region-aware storage keys, and cookie refresh on auth refresh.
- **Security, Auth, and MCP Hardening**
  - MCP OAuth, OpenID/OIDC, SSRF checks, artifact routing, permission caching, avatar fetching, and HTML rendering were tightened across the stack.
- **Providers, Search, and Model Support**
  - Tavily search/scraping, OpenRouter prompt-cache configuration, Vertex AI multi-region endpoints, Anthropic tool-argument streaming, and GPT-5.5 token definitions are now supported.
