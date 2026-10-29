---
date: 2026-03-09T00:00:00.000Z
title: 🚀 LibreChat v0.8.3
description: La versión v0.8.3 de LibreChat
version: 0.8.3
---

## Qué ha cambiado

## 🏞️ Destacados

- **Carga diferida de herramientas basada en eventos**
  - Las herramientas MCP se cargan según demanda, lo que reduce la carga de memoria. Incluye herramienta programática que llama a la interfaz de usuario.
- **Nuevos modelos y proveedores**
  - Proveedor Moonshot, Claude Opus 4.6 (contexto 1M, pensamiento adaptativo), Sonnet 4.6, GPT-5.3/5.4, Gemini 3.1
  - Carga de documentos de Bedrock y razonamiento\_effort, parámetro de nivel de pensamiento de Géminis
- **Rendimiento**
  - Representación de mensajes optimizada, almacenamiento en caché de vista previa de imágenes, almacenamiento en búfer delta para SSE, mejoras de escalabilidad de Redis.
- **Extracción de texto de documento local**
  - Análisis local de PDF, DOCX, XLS/XLSX y OpenDocument.
- **Variables de credenciales del servidor MCP**
  - Autenticación segura por usuario para servidores MCP creados por UI a través de marcadores de posición de credenciales.
- **Editor de código de Mónaco para artefactos**
  - Ahora permite de manera confiable la edición de artefactos.
- **Agentes**
  - Los editores ahora pueden duplicar agentes. Añadido `messageId` para el seguimiento de transacciones.
- **Seguridad**
  - Protección SSRF segura para TOCTOU, mejoras en OIDC (cierre de sesión iniciado por RP, reclamo por correo electrónico configurable)
  - Rutas API reforzadas, `ALLOW_SHARED_LINKS_PUBLIC` por defecto es `false`.

---

Para cambios detallados en cada versión candidata, consulte:
- [v0.8.3-rc1](/changelog/v0.8.3-rc1) - Carga diferida de herramientas basada en eventos, proveedor Moonshot, Claude Opus/Sonnet 4.6, buffer Delta
- [v0.8.3-rc2](/changelog/v0.8.3-rc2) - Extracción de documentos locales, carga de documentos Bedrock, variables de credenciales para MCP, duplicación de agentes
