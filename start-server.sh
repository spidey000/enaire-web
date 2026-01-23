#!/bin/bash

echo "========================================"
echo "ENAIRE Web - Servidor de Desarrollo"
echo "========================================"
echo ""

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js no está instalado"
    echo "Por favor, instala Node.js desde https://nodejs.org/"
    exit 1
fi

node --version
npm --version

# Instalar dependencias si no existen
if [ ! -d "node_modules" ]; then
    echo ""
    echo "Instalando dependencias..."
    npm install
    if [ $? -ne 0 ]; then
        echo "ERROR: Fallo al instalar dependencias"
        exit 1
    fi
fi

# Iniciar servidor de desarrollo
echo ""
echo "Iniciando servidor de desarrollo..."
echo "La web estará disponible en: http://localhost:3000"
echo ""
echo "Presiona Ctrl+C para detener el servidor"
echo ""

npm run dev
