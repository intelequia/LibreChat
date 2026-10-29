---
date: 2026-09-30T00:00:00.000Z
title: 🚀 LibreChat v0.8.8
description: La versión v0.8.8 de LibreChat
version: 0.8.8
---

## Qué ha cambiado

Los cambios de YAML, entorno, valores predeterminados y migración orientados al operador se recopilan en [Configuración v1.3.15](/changelog/config_v1.3.15), [Configuración v1.3.16](/changelog/config_v1.3.16), y [Configuración v1.3.17](/changelog/config_v1.3.17). Esta versión utiliza Config `1.3.17`, chart de Helm `2.0.16`y el SDK de agentes `4.0.0`.

### 🏞️ Destacados

- **[Conoce a Lia](/blog/2026-09-29_meet-lia-building-librechat-with-librechat):** Construyendo LibreChat con LibreChat.
- **Control de agentes:** Interrumpa, dirija, ponga en cola mensajes, responda preguntas y apruebe llamadas de herramientas.
- **Editor unificado de agentes:** Creacion de Skills en la misma ejecucion, llamadas programaticas a herramientas opcionales y herramientas en segundo plano.
- **Tareas en segundo plano:** Tarjetas de tareas más claras, controles de encabezado y entrega automática de resultados admitidos.
- **Charlas programadas:** Cron, zonas horarias y destinos del proyecto. En beta: experimental y deshabilitado por defecto.
- **Espacios de trabajo de código:** Sesiones con estado, máquinas conectadas, recuperación y permisos protegidos. Altamente experimental; servicios compatibles requeridos.
- **API de agentes beta:** Compatibilidad mejorada con finalización de chat, respuestas abiertas, gestión de agentes/habilidades y eventos de agentes introducidos
- **Complementos de agentes experimentales:** Combine servidores Skills y MCP, con enlaces de comando opcionales.
- **Visibilidad de ejecución:** Actividad en vivo, sincronización de herramientas, uso de contexto, costos opcionales y un Langfuse Trace Viewer configurado.
- **Mejoras en el chat:** Pasadores arrastrables, filtrado de chat, compactación manual, pulido móvil y enrutamiento automático de accesorios.
- **Actualizaciones de modelos:** GPT-6 y GPT-6.1 Sol, Claude Opus/Sonnet 5.5 y Gemini 3.8 Flash. GPT-6.1 Sol utiliza límites y precios de respaldo familiar.
- **Rendimiento y seguridad:** Representación y transmisión más rápidas y envíos de subprocesos largos, límites de credenciales más estrictos, puntos finales con alcance de inquilino y límites de administración 2FA.
