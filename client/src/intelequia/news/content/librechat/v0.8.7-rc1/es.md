---
date: 2026-06-14T00:00:00.000Z
title: 🚀 LibreChat v0.8.7-rc1
description: La versión v0.8.7-rc1 de LibreChat
version: 0.8.7-rc1
---

## Qué ha cambiado

### 🏞️ Destacados

- **Control de acceso, autenticación y MCP**
  - Se agregaron permisos granulares de enlaces compartidos, sincronización de roles OpenID, ventanas configurables de reutilización de tokens OpenID e intercambio de tokens MCP en nombre de para acceso descendente delegado.
  - Avisos reforzados de MCP OAuth, categorización de flujo de tokens, manejo de audiencia OpenID, almacenamiento en caché de enlaces compartidos, limitación de continuación de autenticación, filtrado principal de ACL, marcadores de posición de solicitud/usuario en tiempo de ejecución, conexiones MCP con alcance de solicitud, almacenamiento en caché de herramientas MCP con alcance de solicitud, limpieza de MCP de ejecución reanudable, manejo de proxy saliente y ventanas de finalización de MCP OAuth configurables.
- **Agentes, Habilidades y Proyectos**
  - Se agregaron proyectos de chat privado, herramientas de creación de archivos de agentes, habilidades proporcionadas por la implementación, sincronización de habilidades de GitHub, alcance de habilidades/subagentes de especificaciones de modelo, iniciadores de conversación de especificaciones de modelo, especificaciones de modelo predeterminadas, marca de aterrizaje de especificaciones de modelo y el mercado de agentes en el selector de modelo.
  - Las habilidades de implementación ahora tienen prioridad sobre los duplicados persistentes, el estado de sincronización de habilidades tiene el alcance correcto, la entrada del agente de memoria está limitada y los cuerpos de habilidades repetidos se deduplican en nuevos números primos y en el historial de mensajes.
- **Controles de seguridad y administración**
  - Se agregó filtrado de PII de mensajes configurable para texto con forma de credencial en las funciones de mensajes de API proporcionadas por la persona que llama y configuración reforzada de subagente según especificaciones de modelo para que los clientes no puedan proporcionar listas de permitidos de subagente privadas.
- **Observabilidad y operaciones**
  - Se agregó el modo proxy RUM del navegador autenticado con autenticación aislada y métricas de resultados, observabilidad de respaldo de autenticación, seguimiento de comandos de Redis opcional, puntajes de retroalimentación de Langfuse con metadatos de contexto de mensajes, compilaciones de Node 24 Docker, sistema Chrome simulado E2E y verificación de tipo de CI para el espacio de trabajo del cliente.
- **Conversación UX y confiabilidad**
  - Los títulos de las conversaciones ahora se pueden generar inmediatamente, la navegación de mensajes admite el enfoque y la función arrastrar para borrar, las marcas de tiempo de los mensajes aparecen al pasar el mouse, las instantáneas de los enlaces compartidos se desinfectan, las ramas vistas se mantienen estables cuando cambian las ramas hermanas, las vistas previas de la creación de archivos se transmiten antes, los activos de los trabajadores de servicio obsoletos se recuperan automáticamente después de las implementaciones y los chats reabiertos se recargan correctamente desde rutas que no son de chat.
- **Actualizaciones de proveedores y razonamientos**
  - Se agregó Claude Fable 5, GPT-5.5, `chat-latest`y actualizó los valores predeterminados de OpenAI de frontera, al tiempo que eliminó los valores predeterminados de OpenAI obsoletos.
  - Los puntos finales personalizados conservan los parámetros de razonamiento, admiten proveedores nativos compatibles con Anthropic, retienen los encabezados Anthropic personalizados de las URL controladas por el usuario, los tokens de caché Bedrock ya no inflan los recuentos de finalización, la configuración de herramientas mixtas Gemini está habilitada, los esquemas de herramientas Gemini/Vertex MCP se desinfectan, Imagen usa su región configurada, los puntos finales de proveedores integrados pueden reenviar encabezados de puerta de enlace personalizados y las cargas de documentos del proveedor se conservan.
- **Transmisión y rendimiento**
  - Los bloques de Markdown completados se memorizan durante la transmisión, la ejecución de la herramienta puede informar los resultados por llamada a través de `onResult`, actualizaciones de uso de contexto en tiempo real con desgloses persistentes de rama/total y líneas de base posteriores al resumen correctas, la visualización de costos es opcional de forma predeterminada, los cachés de configuración de token tienen el alcance correcto, el uso de ejecución secundaria de subagente se factura en las transacciones principales, los iconos de especificaciones del modelo sobreviven a la reanudación/anulación de la transmisión, la conversión HEIC, los recursos locales, las herramientas de desarrollo de consultas de React y el servicio de activos de Brotli son diferidos/conmutados, la transmisión del árbol de mensajes está cubierta por pruebas E2E y paquete compartido construye ahora uso `tsdown` con declaraciones aisladas.
