---
date: 2026-09-30
title: 🚀 LibreChat v0.8.8
description: The v0.8.8 release of LibreChat
version: '0.8.8'
---

## What's Changed

Operator-facing YAML, environment, default, and migration changes are collected in [Config v1.3.15](/changelog/config_v1.3.15), [Config v1.3.16](/changelog/config_v1.3.16), and [Config v1.3.17](/changelog/config_v1.3.17). This release uses Config `1.3.17`, Helm chart `2.0.16`, and the Agents SDK `4.0.0`.

### 🏞️ Highlights

- **[Meet Lia](/blog/2026-09-29_meet-lia-building-librechat-with-librechat):** Building LibreChat with LibreChat.
- **Agent control:** Interrupt, steer, queue messages, answer questions, and approve tool calls.
- **Unified Agent Builder:** Same-run Skill authoring, opt-in Programmatic Tool Calling, and background tools.
- **Background tasks:** Clearer task cards, header controls, and automatic delivery of supported results.
- **Scheduled Chats:** Cron, time zones, and Project destinations. In beta: experimental and disabled by default.
- **Code workspaces:** Stateful sessions, attached machines, recovery, and guarded permissions. Highly experimental; compatible services required.
- **Beta Agents API:** Improved compatibility with Chat Completions, Open Responses, Agent/Skill management, and introduced Agent Events
- **Experimental Agent Plugins:** Bundle Skills and MCP servers, with opt-in command hooks.
- **Execution visibility:** Live activity, tool timing, Context Usage, optional costs, and a configured Langfuse Trace Viewer.
- **Chat improvements:** Draggable pins, chat filtering, manual compaction, mobile polish, and automatic attachment routing.
- **Model updates:** GPT-6 and GPT-6.1 Sol, Claude Opus/Sonnet 5.5, and Gemini 3.8 Flash. GPT-6.1 Sol uses family-fallback limits and pricing.
- **Performance and security:** Faster rendering and streaming and long-thread sends, stronger credential boundaries, tenant-scoped endpoints, and 2FA management limits.
