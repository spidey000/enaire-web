#!/bin/bash

echo "========================================"
echo "Deploy a Netlify - ENAIRE Web"
echo "========================================"
echo ""

# [1/3] Verificar Netlify CLI
echo "[1/3] Verificando Netlify CLI..."
if ! command -v npx netlify &> /dev/null; then
    echo "Netlify CLI no encontrado. Usando npx..."
fi

# [2/3] Crear build de producción
echo ""
echo "[2/3] Creando build de producción..."
npm run build
if [ $? -ne 0 ]; then
    echo "ERROR: Fallo al crear build"
    exit 1
fi

# [3/3] Deploy a Netlify
echo ""
echo "[3/3] Deployando a Netlify..."
echo "Se abrirá un navegador para autorizar el deploy"
echo ""
npx netlify deploy --prod --dir=dist

echo ""
echo "========================================"
echo "Deploy completado!"
echo "========================================"
echo ""
