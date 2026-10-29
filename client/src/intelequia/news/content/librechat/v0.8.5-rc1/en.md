---
date: 2026-04-09
title: 🚀 LibreChat v0.8.5-rc1
description: The v0.8.5-rc1 release of LibreChat
version: "0.8.5-rc1"
---

## What's Changed

### 🏞️ Highlights

- **Admin Panel Foundation**
  - Per-principal (Roles & Groups) configuration overrides, Custom Roles & Groups, System Grants for admin-level access control
  - Admin panel, [available for testing here](<https://github.com/ClickHouse/librechat-admin-panel>)
- **Context Compaction/Summarization**
  - Long-running agent conversations are automatically summarized to stay within context limits. Includes configurable triggers, context pruning of large tool results, and a new top-level [`summarization` config](<https://www.librechat.ai/docs/configuration/librechat_yaml/object_structure/summarization>). See [Config v1.3.8](<https://www.librechat.ai/changelog/config_v1.3.8>).
- **UI Redesign**
  - Redesigned sidebar with unified icon strip layout, including all panels (agent builder, prompts, etc.)
  - Overhauled tool call UI with grouping/richer output rendering
  - Refreshed Prompts UI
- **Performance & MCP Improvements**
- **Pinned Model Specs**: Users can now pin favorite model specs for quick access.
