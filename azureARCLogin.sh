# #!/bin/bash
# set -x  # Habilita el modo de depuración
# set -e  # Opcional, salir inmediatamente si un comando falla
# echo $ARC_SECRET | docker login intelequia.azurecr.io --username intelequia -p $(cat)
# docker compose pull
# docker compose up -d

#!/bin/bash
set -x  # Habilita el modo de depuración
set -e  # Salir inmediatamente si un comando falla

# Asegúrate de que ARC_SECRET esté definido
if [ -z "$ARC_SECRET" ]; then
    echo "Error: ARC_SECRET no está definido."
    exit 1
fi

# Usar ARC_SECRET como contraseña para docker login
echo $ARC_SECRET | docker login intelequia.azurecr.io --username intelequia --password-stdin

# Descargar y actualizar contenedores
docker-compose pull

# docker stop $(docker ps -aq) && docker rm $(docker ps -aq)

# Levantar los servicios en modo detached
docker-compose up -d