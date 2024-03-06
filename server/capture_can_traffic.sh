#!/bin/bash

# Abre una conexión con el dispositivo ELM327 WiFi
telnet 192.168.0.10 35000

# Envía el comando AT MA
echo -e "AT MA\n"

# Captura la salida del comando
cat > can_traffic.txt

# Cierra la conexión
exit
