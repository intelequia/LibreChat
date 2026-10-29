---
date: 2023-06-27T00:00:00.000Z
title: 🚀 LibreChat v0.5.2
description: Agente de Funciones, OpenID, Actualizaciones de Docker...
version: 0.5.2
---

# Qué ha cambiado

**Características:**

- hazaña (Agente de funciones): use el ejecutor/agente oficial de la función langchain para un mejor manejo de la salida
- hazaña (complementos): cambie el agente predeterminado a funciones y omita la finalización
  - **Este es el método más eficiente para utilizar complementos.** Próximamente documentos sobre cómo escribir complementos como funciones.
- Autenticación OpenID

**Actualizaciones de compilación y Docker:**

- build(docker-compose.yml): cambia el nombre de la imagen a librechat
- : Crear contenedor.yml: crear y enviar la imagen de la ventana acoplable al etiquetarla con @jinzishuai
- hazaña: actualice Dockerfile para incluir curl

**Estilo y UX:**

- estilo: optimizaciones móviles, uso de cuadros de diálogo fijos y evitar el desplazamiento automático de ajustes preestablecidos
- arreglar (SubmitButton.jsx): corrige la superposición de relleno del área de texto

**Documentación y logotipos:**

- Actualizar "logo" README.md
- MkDocs para material
- Documentación mejorada: Configuración de Cloudflare y Linode agregada
- Actualización menor de la documentación de OpenID
- Agregar sitios sociales a MkDocs

**Refactorización y correcciones:**

- refactor: actualiza las referencias de chatgpt-clone a LibreChat
- arreglar:  problema con el cierre del registro
