#!/bin/bash

# Script de Intelequia para configurar la limpieza automática de chats
# Configuración fija: todos los días a las 6:00 AM
# EJECUTA EN EL HOST - El comando se ejecuta DENTRO del contenedor LibreChat

echo "========================================="
echo "Intelequia - Configurador de Cron INTERNO"
echo "Intelewriter Chat Cleanup (Internal)"
echo "========================================="

# Verificar que estamos en el contenedor
if [ ! -f "/app/package.json" ]; then
    echo "ERROR: Este script debe ejecutarse dentro del contenedor LibreChat"
    exit 1
fi

echo "✓ Ejecutándose dentro del contenedor LibreChat"

# Verificar que dcron esté instalado (ya debería estar desde el entrypoint)
if ! command -v crond &> /dev/null; then
    echo "ERROR: dcron no está instalado. Se esperaba que estuviera instalado desde el entrypoint."
    exit 1
fi
echo "✓ dcron disponible"

# Configurar el script de cron
SCRIPT_DIR="/app/config/int-clean-cron"
CRON_SCRIPT="$SCRIPT_DIR/cron-clean-chats.js"
LOG_DIR="$SCRIPT_DIR/logs"
LOG_FILE="$LOG_DIR/intelewriter-cleanup.log"

# Crear directorio de logs si no existe
mkdir -p "$LOG_DIR"
echo "✓ Directorio de logs creado: $LOG_DIR"

# Verificar que el script existe
if [ ! -f "$CRON_SCRIPT" ]; then
    echo "ERROR: No se encontró el script cron-clean-chats.js"
    exit 1
fi

# Hacer el script ejecutable
chmod +x "$CRON_SCRIPT"
echo "✓ Script marcado como ejecutable"

# Verificar Node.js (debe estar disponible en el contenedor)
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js no está disponible en el contenedor"
    exit 1
fi
echo "✓ Node.js encontrado en el contenedor"

# Verificar configuración actual en .env
echo ""
echo "Verificando configuración en .env:"
if grep -q "CLEAN_DATA_INTERVAL" "/app/.env"; then
    # Buscar líneas que contengan CLEAN_DATA_INTERVAL
    FOUND_LINES=$(grep "CLEAN_DATA_INTERVAL" "/app/.env")
    echo "Líneas encontradas:"
    echo "$FOUND_LINES" | while IFS= read -r line; do
        echo "  $line"
    done
    
    # Buscar TODAS las líneas válidas (no comentadas)
    VALID_LINES=$(grep "^[[:space:]]*CLEAN_DATA_INTERVAL[[:space:]]*=" "/app/.env")
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

# Verificar si ya existe una entrada para este script y removerla automáticamente
if grep -q "int-clean-cron" "$TEMP_CRON"; then
    echo ""
    echo "⚠️  Ya existe una entrada de cron para Intelequia cleanup - reemplazando automáticamente"
    # Remover líneas existentes
    grep -v "int-clean-cron" "$TEMP_CRON" > "${TEMP_CRON}.new"
    mv "${TEMP_CRON}.new" "$TEMP_CRON"
fi

echo ""
echo "Configurando limpieza automática diaria a las 6:00 AM..."
echo "El comando se ejecutará INTERNAMENTE dentro del contenedor LibreChat"

CRON_SCHEDULE="0 6 * * *"
DESCRIPTION="Diario a las 6:00 AM (interno)"

# Crear la entrada de cron con logging en el directorio local del script
CRON_ENTRY="$CRON_SCHEDULE /usr/local/bin/node $CRON_SCRIPT >> $LOG_FILE 2>&1"

# Añadir comentario y entrada
echo "" >> "$TEMP_CRON"
echo "# Intelewriter automatic chat cleanup - $DESCRIPTION" >> "$TEMP_CRON"
echo "$CRON_ENTRY" >> "$TEMP_CRON"

# Instalar el nuevo crontab
if crontab "$TEMP_CRON"; then
    echo ""
    echo "✅ Cron job interno de Intelequia configurado exitosamente!"
    echo ""
    echo "Configuración:"
    echo "- Horario: $DESCRIPTION"
    echo "- Modo: INTERNO del contenedor"
    echo "- Comando: $CRON_ENTRY"
    echo "- Logs: $LOG_FILE"
    echo ""
    echo "IMPORTANTE:"
    echo "- El cron se ejecuta DENTRO del contenedor"
    echo "- Se configura automáticamente al iniciar el contenedor"
    echo "- Los logs están dentro del contenedor en $LOG_FILE"
    echo ""
    echo "Comandos útiles:"
    echo "- Ver crontab: docker exec LibreChat crontab -l"
    echo "- Ver logs: docker exec LibreChat tail -f $LOG_FILE"
    echo "- Probar script: docker exec LibreChat node $CRON_SCRIPT"
    echo ""
    echo "✓ Crontab configurado (crond se inicia desde el entrypoint)"
else
    echo "ERROR: No se pudo instalar el crontab"
    rm "$TEMP_CRON"
    exit 1
fi

# Limpiar archivo temporal
rm "$TEMP_CRON"

echo ""
echo "📋 Para probar el script manualmente, ejecuta:"
echo "   docker exec LibreChat node $CRON_SCRIPT"
echo ""
