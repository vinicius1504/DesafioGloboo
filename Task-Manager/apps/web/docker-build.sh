#!/bin/bash

# Script para build e run do Docker

echo "🐳 Building Task Manager Web App..."

# Build da imagem
docker build -t task-manager-web .

echo "✅ Build concluído!"

# Verificar se container já existe e parar
if [ $(docker ps -aq -f name=task-manager-web-container) ]; then
    echo "🛑 Parando container existente..."
    docker stop task-manager-web-container
    docker rm task-manager-web-container
fi

# Rodar novo container
echo "🚀 Iniciando container..."
docker run -d \
  --name task-manager-web-container \
  -p 3000:80 \
  task-manager-web

echo "✅ Aplicação rodando em http://localhost:3000"
echo "📋 Para ver logs: docker logs task-manager-web-container"
echo "🛑 Para parar: docker stop task-manager-web-container"