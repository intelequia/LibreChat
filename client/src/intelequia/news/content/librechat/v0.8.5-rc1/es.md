---
date: 2026-04-09T00:00:00.000Z
title: 🚀 LibreChat v0.8.5-rc1
description: La versión v0.8.5-rc1 de LibreChat
version: 0.8.5-rc1
---

## Qué ha cambiado

### 🏞️ Destacados

- **Fundación del panel de administración**
  - Anulaciones de configuración por principal (roles y grupos), roles y grupos personalizados, concesiones del sistema para control de acceso a nivel de administrador
  - panel de administración, [disponible para pruebas aquí](<https://github.com/ClickHouse/librechat-admin-panel>)
- **Compactación/resumen de contexto**
  - Las conversaciones de larga duración con los agentes se resumen automáticamente para mantenerse dentro de los límites del contexto. Incluye activadores configurables, poda de contexto de resultados de herramientas grandes y un nuevo nivel superior [`summarization` configuración](<https://www.librechat.ai/docs/configuration/librechat_yaml/object_structure/summarization>). Ver [Configuración v1.3.8](<https://www.librechat.ai/changelog/config_v1.3.8>).
- **Rediseño de la interfaz de usuario**
  - Barra lateral rediseñada con diseño de tira de iconos unificado, incluidos todos los paneles (creador de agentes, indicaciones, etc.)
  - Interfaz de usuario de llamada de herramienta revisada con agrupación/renderizado de salida más rico
  - UI de mensajes actualizada
- **Mejoras de rendimiento y MCP**
- **Especificaciones del modelo fijado**: Los usuarios ahora pueden fijar las especificaciones de sus modelos favoritos para un acceso rápido.
