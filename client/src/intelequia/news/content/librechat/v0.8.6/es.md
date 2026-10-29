---
date: 2026-05-31T00:00:00.000Z
title: 🚀 LibreChat v0.8.6
description: La versión v0.8.6 de LibreChat
version: 0.8.6
---

## Qué ha cambiado

## 🏞️ Destacados

- **Habilidades de agentes y subagentes**
  - Agent Skills empaqueta instrucciones, referencias, scripts, activos y permisos reutilizables en capacidades portátiles que los agentes pueden invocar automáticamente o previa solicitud.
  - Los subagentes permiten a los agentes delegar trabajo especializado a otros agentes mientras preservan el contexto de carga, usuario y MCP con límites de recursividad y gráficos.
- **Ejecución de código y artefactos**
  - Los artefactos de texto, código fuente, DOCX, CSV, XLSX y PPTX se pueden representar en línea o en el panel lateral con vistas previas más completas.
  - La edición de artefactos, los bloques de medios PDF de Gemini, los íconos de especificaciones de modelo y los archivos de recursos de agentes persistentes recibieron correcciones de confiabilidad.
- **Observabilidad y operaciones**
  - Se agregaron métricas de Prometheus, seguimiento de OpenTelemetry de backend, seguimiento del ciclo de vida de SSE, RUM del navegador HyperDX, contexto de registro estructurado, puntos finales de preparación explícitos, controles de registro de archivos y cierre HTTP elegante.
- **MCP, autenticación y refuerzo administrativo**
  - Soporte de proxy remoto MCP mejorado, manejo de audiencias OAuth, respaldo de caducidad de JWT, flujos secretos de cliente OpenID/MCP opcionales, validación OpenID multiaudiencia, anulaciones de registros confiables, redirecciones SSO del panel de administración, límites HTTP transmitibles y aplicación de permisos MCP para herramientas de agentes.
- **Actualizaciones de proveedores y modelos**
  - Se agregó compatibilidad con Claude Opus 4.8, compatibilidad con Flash Gemini 3.5, combinaciones de herramientas Gemini, compatibilidad con el nivel de pensamiento Gemma 4, tokens de salida máxima de Google/Gemini con reconocimiento de modelo, compatibilidad con claves API/perfil Bedrock AWS y manejo de barandillas Bedrock.
- **Fiabilidad y pulido de la interfaz de usuario**
  - Semántica de retención reforzada, saneamiento de respuesta de usuario/configuración, representación de texto enriquecido configurada, limpieza de generación de Redis/en memoria, retención de todos los datos para archivos de agente, representación de títulos de MCP, manejo de carreras de barra lateral/chat, acciones de desplazamiento, enlaces compartidos, chips de archivos generados y carga de configuración de script de equilibrio.

Para cambios detallados en la versión candidata, consulte:

- [v0.8.6-rc1](/changelog/v0.8.6-rc1)
