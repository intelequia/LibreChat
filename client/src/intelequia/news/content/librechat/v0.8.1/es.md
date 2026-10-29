---
date: 2025-12-11T00:00:00.000Z
title: 🚀 LibreChat v0.8.1
description: La versión v0.8.1 de LibreChat
version: 0.8.1
---

## 🏞️ Destacados

Principales características y mejoras desde [v0.8.0](https://www.librechat.ai/changelog/v0.8.0)

### 🤖 Traspasos de agentes (Beta)
Los agentes ahora se pueden configurar para transferir el control de las conversaciones a otros agentes especializados cuando se necesita experiencia específica.

### 📎 Subir a Soporte para proveedores
Los archivos ahora pueden cargarse directamente y ser manejados por proveedores compatibles, eliminando la necesidad de OCR intermedio y otros pasos de procesamiento multimodal.

### 🖼️ Gestión y compartibilidad de artefactos mejorada
Los artefactos se han mejorado con capacidades de control de versiones, mejores interacciones de interfaz de usuario y soporte de renderizado, y ahora se pueden ver en conversaciones compartidas.

### 🤖 Actualizaciones de modelos
- **Géminis 3** soporte con precios
- **GPT-5.1** soporte con variantes del códice
- **Grok 4** variantes (rápida, 4-1-rápida, código rápido) con tasas de contexto
- **Claude Opus 4.5 y Haiku 4.5** con tasas de token y límites de ventana
- **Zhipu AI GLM** Apoyo familiar con ventanas contextuales integrales y precios
- Cobertura de precios de modelo mejorada para **DeepSeek R1/V3**, **familia qwen**, **Amazon Nova Premier**, **Llama 3.3**, **gpt-5-pro** y otros con coincidencia de patrones mejorada

### ⚙️ Otros cambios notables
- Soporte de seguimiento de Langfuse
- Integración de Helicone AI Gateway
- Soporte de almacenamiento en caché de avisos de Bedrock
- Ahora se impide que las pantallas entren en suspensión durante la generación de respuestas
- Los nombres de archivos ahora se pueden usar como contexto para cargar documentos Anthropic
- Elección de líder distribuido con Redis para la coordinación de instancias de múltiples servidores dentro de implementaciones de clústeres
- Ahora se puede configurar a través de Especificaciones del modelo si se mostrarán insignias de herramientas específicas (búsqueda de archivos, servidores mcp, etc.) en la entrada del chat
- Mejoras de accesibilidad en toda la aplicación para una mejor navegación con el teclado, compatibilidad con lectores de pantalla y cumplimiento de los estándares de accesibilidad
- Mejoras en Helm Chart: etiquetas de implementación personalizadas, anotaciones, contenedores de inicio, compatibilidad con ConfigMaps y variables de entorno de API RAG adicionales
- Reestructuración del sistema de registro MCP con almacenamiento en caché distribuido, coordinación líder-seguidor, inicialización del servidor protegida por tiempo de espera y almacenamiento en caché de herramientas con alcance de usuario
