#!/bin/bash

# Script de Intelequia para configurar la limpieza automática de chats
# Configuración fija: todos los días a las 6:00 AM
# EJECUTA EN EL HOST - El comando se ejecuta DENTRO del contenedor LibreChat

echo "========================================="
echo "Intelequia - Configurador de Cron"
echo "Intelewriter Chat Cleanup (Docker exec)"
echo "========================================="

# Obtener rutas
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$(dirname "$SCRIPT_DIR")")"
CRON_SCRIPT="$SCRIPT_DIR/cron-clean-chats.js"

echo "Directorio del proyecto: $PROJECT_DIR"
echo "Script de cron: $CRON_SCRIPT"

# Verificar que el script existe
if [ ! -f "$CRON_SCRIPT" ]; then
    echo "ERROR: No se encontró el script cron-clean-chats.js"
    exit 1
fi

# Hacer el script ejecutable
chmod +x "$CRON_SCRIPT"
echo "✓ Script marcado como ejecutable"

# Verificar Docker
DOCKER_PATH=$(which docker)

if [ -z "$DOCKER_PATH" ]; then
    echo "ERROR: Docker no está instalado o no está en el PATH"
    exit 1
fi
echo "✓ Docker encontrado en: $DOCKER_PATH"

# Verificar que hay contenedores corriendo
echo ""
echo "Verificando contenedor LibreChat..."
if docker ps --format "table {{.Names}}" | grep -q "^LibreChat$"; then
    echo "✓ Contenedor 'LibreChat' está corriendo"
else
    echo "⚠️  Contenedor 'LibreChat' no está corriendo actualmente"
    echo "   El cron funcionará cuando el contenedor esté activo"
    echo ""
    echo "Contenedores activos:"
    docker ps --format "table {{.Names}}\t{{.Status}}" || echo "   Ninguno"
fi

# Verificar Node.js
NODE_PATH=$(which node)
if [ -z "$NODE_PATH" ]; then
    echo "ERROR: Node.js no está instalado o no está en el PATH"
    exit 1
fi
echo "✓ Node.js encontrado en: $NODE_PATH"

# Verificar configuración actual en .env
echo ""
echo "Verificando configuración en .env:"
if grep -q "CLEAN_DATA_INTERVAL" "$PROJECT_DIR/.env"; then
    # Buscar líneas que contengan CLEAN_DATA_INTERVAL
    FOUND_LINES=$(grep "CLEAN_DATA_INTERVAL" "$PROJECT_DIR/.env")
    echo "Líneas encontradas:"
    echo "$FOUND_LINES" | while IFS= read -r line; do
        echo "  $line"
    done
    
    # Buscar TODAS las líneas válidas (no comentadas)
    VALID_LINES=$(grep "^[[:space:]]*CLEAN_DATA_INTERVAL[[:space:]]*=" "$PROJECT_DIR/.env")
    VALID_COUNT=$(echo "$VALID_LINES" | grep -c "^[[:space:]]*CLEAN_DATA_INTERVAL" 2>/dev/null || echo "0")
    
    if [ "$VALID_COUNT" -eq 0 ]; then
        echo ""
        echo "❌ CLEAN_DATA_INTERVAL encontrado pero todas las líneas están comentadas."
        echo "   Descomenta una línea para que el cron funcione."
    elif [ "$VALID_COUNT" -eq 1 ]; then
        # Solo una línea válida - perfecto
        VALID_LINE=$(echo "$VALID_LINES")
        echo ""
        echo "Línea activa: $VALID_LINE"
        
        # Extraer el valor (eliminar comentarios inline y limpiar)
        VALUE=$(echo "$VALID_LINE" | cut -d'=' -f2 | sed 's/#.*//' | tr -d '"' | tr -d "'" | xargs)
        
        if [[ "$VALUE" =~ ^[0-9]+$ ]] && [ "$VALUE" -ge 30 ]; then
            echo "✓ Configuración válida ($VALUE días)"
        elif [[ "$VALUE" =~ ^[0-9]+$ ]] && [ "$VALUE" -lt 30 ]; then
            echo "⚠️  ADVERTENCIA: Valor muy bajo ($VALUE días). Mínimo recomendado: 30 días"
        elif [ -z "$VALUE" ]; then
            echo "⚠️  ADVERTENCIA: CLEAN_DATA_INTERVAL está vacío. El cron no se ejecutará."
        else
            echo "⚠️  ADVERTENCIA: Valor no numérico ($VALUE). El cron no se ejecutará."
        fi
    else
        # Múltiples líneas válidas - problema
        echo ""
        echo "⚠️  ADVERTENCIA: Se encontraron $VALID_COUNT líneas activas (no comentadas):"
        echo "$VALID_LINES" | while IFS= read -r line; do
            echo "    $line"
        done
        echo ""
        echo "   Esto puede causar comportamiento impredecible."
        echo "   Recomendación: comenta todas menos una línea."
        echo ""
        
        # Usar la última línea válida como referencia
        LAST_VALID_LINE=$(echo "$VALID_LINES" | tail -n1)
        VALUE=$(echo "$LAST_VALID_LINE" | cut -d'=' -f2 | sed 's/#.*//' | tr -d '"' | tr -d "'" | xargs)
        echo "   El sistema usará probablemente: $VALUE días (última línea)"
    fi
else
    echo "⚠️  CLEAN_DATA_INTERVAL no encontrado en .env. El cron no se ejecutará."
fi

# Obtener crontab actual
TEMP_CRON=$(mktemp)
crontab -l 2>/dev/null > "$TEMP_CRON"

# Verificar si ya existe una entrada para este script
if grep -q "int-clean-cron" "$TEMP_CRON"; then
    echo ""
    echo "⚠️  Ya existe una entrada de cron para Intelequia cleanup"
    echo "Contenido actual del crontab:"
    echo "-----------------------------"
    crontab -l | grep -n "int-clean-cron"
    echo "-----------------------------"
    echo ""
    echo "¿Quieres reemplazar la configuración existente? (y/N)"
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        echo "Operación cancelada"
        rm "$TEMP_CRON"
        exit 0
    fi
    # Remover líneas existentes
    grep -v "int-clean-cron" "$TEMP_CRON" > "${TEMP_CRON}.new"
    mv "${TEMP_CRON}.new" "$TEMP_CRON"
fi

echo ""
echo "Configurando limpieza automática diaria a las 6:00 AM..."
echo "El comando se ejecutará en el HOST pero procesará DENTRO del contenedor LibreChat"

CRON_SCHEDULE="0 6 * * *"
DESCRIPTION="Diario a las 6:00 AM (docker exec)"

# Crear la entrada de cron con logging en el directorio local del script
LOG_DIR="$SCRIPT_DIR/logs"
LOG_FILE="$LOG_DIR/intelewriter-cleanup.log"
CRON_ENTRY="$CRON_SCHEDULE $NODE_PATH $CRON_SCRIPT >> $LOG_FILE 2>&1"

# Crear el directorio de logs si no existe
mkdir -p "$LOG_DIR"

# Añadir comentario y entrada
echo "" >> "$TEMP_CRON"
echo "# Intelewriter automatic chat cleanup - $DESCRIPTION" >> "$TEMP_CRON"
echo "$CRON_ENTRY" >> "$TEMP_CRON"

# Instalar el nuevo crontab
if crontab "$TEMP_CRON"; then
    echo ""
    echo "✅ Cron job de Intelequia configurado exitosamente!"
    echo ""
    echo "Configuración:"
    echo "- Horario: $DESCRIPTION"
    echo "- Modo: HOST ejecuta 'docker exec LibreChat npm run clean-chats'"
    echo "- Comando: $CRON_ENTRY"
    echo "- Logs: $LOG_FILE"
    echo ""
    echo "IMPORTANTE:"
    echo "- El cron se ejecuta en el HOST (máquina física)"
    echo "- El comando se ejecuta con: docker exec LibreChat npm run clean-chats"
    echo "- El contenedor 'LibreChat' debe estar corriendo para que funcione"
    echo "- Si recreas contenedores, el cron seguirá funcionando"
    echo ""
    echo "Comandos útiles:"
    echo "- Ver crontab: crontab -l"
    echo "- Ver logs: tail -f $LOG_FILE"
    echo "- Ver contenedor: docker ps | grep LibreChat"
    echo "- Probar script: node $CRON_SCRIPT"
else
    echo "ERROR: No se pudo instalar el crontab"
    rm "$TEMP_CRON"
    exit 1
fi

# Limpiar archivo temporal
rm "$TEMP_CRON"

echo ""
echo "¿Quieres probar el script ahora? (y/N)"
read -r test_response
if [[ "$test_response" =~ ^[Yy]$ ]]; then
    echo ""
    echo "Ejecutando prueba del script..."
    echo "================================"
    "$NODE_PATH" "$CRON_SCRIPT"
fi
