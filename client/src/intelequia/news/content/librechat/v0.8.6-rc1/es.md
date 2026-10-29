---
date: 2026-05-13T00:00:00.000Z
title: 🚀 LibreChat v0.8.6-rc1
description: La versión v0.8.6-rc1 de LibreChat
version: 0.8.6-rc1
---

## Qué ha cambiado

### 🏞️ Destacados

- **Habilidades del agente**
  - Agent Skills le permite empaquetar el comportamiento de los agentes reutilizables en `SKILL.md` paquetes: instrucciones, archivos de referencia, scripts, activos y permisos de herramientas pueden viajar juntos como una capacidad que un agente puede invocar automáticamente, a pedido o siempre disponible.
  - Las habilidades se pueden importar, limitar en tamaño, compartir a través de ACL y establecer en el ámbito por agente, lo que facilita la creación de flujos de trabajo repetibles sin incluir todas las instrucciones en el mensaje del agente.
- **Subagentes**
  - Los subagentes permiten a los agentes llamar a otros agentes como herramientas, de modo que un agente principal puede delegar trabajo especializado, ejecutar pases independientes en paralelo o incluso llamar a una copia configurada de sí mismo para resolver problemas al estilo de distribución.
  - Las ejecuciones de subagente preservan el contexto circundante de carga, usuario y MCP al mismo tiempo que imponen límites de recursividad y gráficos, lo que mantiene potente la ejecución de múltiples agentes sin hacerla ilimitada.
- **Ejecución de código y artefactos**
  - Los artefactos de texto, código fuente, DOCX, CSV, XLSX y PPTX se pueden representar en línea o en el panel lateral con vistas previas más completas.
  - Las rutas de artefactos anidadas, los nombres de archivos Unicode, la codificación de metadatos de archivos y el filtrado de contexto de código generado recibieron varias pasadas de refuerzo.
- **Entrega de archivos CloudFront + S3**
  - La nueva compatibilidad con la estrategia de archivos de CloudFront incluye cookies firmadas, descargas firmadas, aplicación estricta del acceso firmado, claves de almacenamiento con reconocimiento de región y actualización de cookies al actualizar la autenticación.
- **Seguridad, autenticación y refuerzo de MCP**
  - MCP OAuth, OpenID/OIDC, comprobaciones SSRF, enrutamiento de artefactos, almacenamiento en caché de permisos, recuperación de avatares y representación HTML se ajustaron en toda la pila.
- **Proveedores, búsqueda y soporte de modelos**
  - Ahora se admiten la búsqueda/raspado de Tavily, la configuración de caché de solicitud de OpenRouter, puntos finales multirregionales de Vertex AI, transmisión de argumentos de herramientas antrópicas y definiciones de tokens GPT-5.5.
