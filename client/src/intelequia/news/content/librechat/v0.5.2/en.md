---
date: 2023-06-27
title: 🚀 LibreChat v0.5.2
description: Functions Agent, OpenID , Docker Updates...
version: "0.5.2"
---

# What's Changed

**Features:**

- feat(Functions Agent): use official langchain function executor/agent for better output handling
- feat(Plugins): change default agent to functions and skip completion
  - **This is the most token-efficient method of using plugins.** Docs on how to write plugins as functions coming soon.
- OpenID Authentication

**Build and Docker Updates:**

- build(docker-compose.yml): change the image name to librechat
- : Create container.yml: build and push docker image upon tagging
- feat: update Dockerfile to include curl

**Style and UX:**

- style: mobile optimizations, use fixed dialogs, and prevent auto-scroll for presets
- fix(SubmitButton.jsx): fix padding overlap of textarea

**Documentation & Logos:**

- Update "logo" README.md
- MkDocs for Material
- Enhanced Documentation: Added Cloudflare and Linode Setup
- Minor OpenID Documentation Update
- Add social sites to MkDocs

**Refactoring and Fixes:**

- refactor: update references from chatgpt-clone to LibreChat
- fix:  issue with closing registration
