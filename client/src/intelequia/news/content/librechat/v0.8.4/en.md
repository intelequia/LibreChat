---
date: 2026-03-20
title: 🚀 LibreChat v0.8.4
description: The v0.8.4 release of LibreChat
version: "0.8.4"
---

## What's Changed

## 🏞️ Highlights

This release of LibreChat is primarily focused on security and stability improvements.

- **Security Hardening**
  - 30+ security fixes: Strongly recommended update for all deployments.
- **MCP Improvements**
  - Reconnection storm prevention with circuit breaker and backoff, OAuth race condition fixes, fail-closed domain validation, better STDIO UX with `customUserVars`.
- **Replaced `tiktoken` with `ai-tokenizer`**
  - Lighter, faster tokenization dependency.
- **Artifact Rendering**
  - Replaced React Markdown renderer with static HTML for more reliable artifact display.
- **Accessibility**
  - Screen reader improvements for conversation headings and date groups.
