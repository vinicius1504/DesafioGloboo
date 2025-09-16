# 🔔 Notifications Service

[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![WebSocket](https://img.shields.io/badge/WebSocket-000000?style=for-the-badge&logo=websocket&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

Serviço de notificações em tempo real do Task Manager, responsável por gerenciar e enviar notificações aos usuários via WebSocket e API REST.

## 📋 Descrição

O Notifications Service é um microserviço dedicado ao gerenciamento de notificações no sistema Task Manager. Ele permite o envio de notificações em tempo real para usuários conectados, utilizando WebSocket para comunicação bidirecional e eficiente.

## ✨ Funcionalidades

- 📡 **WebSocket Gateway**: Comunicação em tempo real com clientes
- 📨 **Envio de Notificações**: API para criar e enviar notificações
- 📊 **Histórico de Notificações**: Armazenamento e consulta de notificações enviadas
- 🔄 **Integração com Outros Serviços**: Recebe eventos de outros microserviços
- 🗂️ **Categorização**: Notificações por tipo (tarefa criada, atualizada, etc.)
- 📱 **Multi-cliente**: Suporte a múltiplos clientes conectados simultaneamente

## 🛠️ Tecnologias Utilizadas

- **NestJS**: Framework para construção de APIs escaláveis
- **TypeScript**: Tipagem estática e desenvolvimento robusto
- **WebSocket**: Protocolo para comunicação em tempo real
- **Socket.IO**: Biblioteca para WebSocket com fallbacks
- **PostgreSQL**: Banco de dados para persistência
- **Redis**: Cache e pub/sub para mensagens
- **Docker**: Containerização do serviço

## 🚀 Instalação e Execução

### Pré-requisitos
- Node.js (versão 18 ou superior)
- PostgreSQL
- Redis (opcional para cache avançado)

### Instalação

1. **Clone o repositório e navegue para o serviço**
   ```bash
   git clone https://github.com/vinicius1504/DesafioGloboo.git
   cd DesafioGloboo/Task-Manager/apps/notifications-service
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente**
   ```bash
   cp .env.example .env
   # Edite o arquivo .env com suas configurações de banco e Redis
   ```

### Execução

```bash
# Desenvolvimento com hot-reload
npm run start:dev

# Produção
npm run build
npm run start:prod

# Com Docker (recomendado)
docker-compose up notifications-service
```

O serviço estará disponível em:
- **API REST**: http://localhost:3003
- **WebSocket**: ws://localhost:3003/notifications

## 📡 API Endpoints

### REST API

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/notifications` | Lista todas as notificações |
| GET | `/notifications/:id` | Obtém uma notificação específica |
| POST | `/notifications` | Cria uma nova notificação |
| DELETE | `/notifications/:id` | Remove uma notificação |

### WebSocket Events

| Evento | Direção | Descrição |
|--------|---------|-----------|
| `notification` | Server → Client | Nova notificação recebida |
| `join` | Client → Server | Cliente se junta a um canal |
| `leave` | Client → Server | Cliente deixa um canal |

## 🧪 Testes

```bash
# Testes unitários
npm run test

# Testes e2e
npm run test:e2e

# Cobertura de testes
npm run test:cov
```

## 📁 Estrutura do Projeto

```
notifications-service/
├── src/
│   ├── app.controller.spec.ts
│   ├── app.controller.ts
│   ├── app.module.ts
│   ├── app.service.ts
│   ├── main.ts
│   └── notifications/
│       ├── dto/
│       │   └── create-notification.dto.ts
│       ├── entities/
│       │   └── notification.entity.ts
│       ├── interfaces/
│       │   └── notification.interface.ts
│       ├── notifications.controller.spec.ts
│       ├── notifications.controller.ts
│       ├── notifications.gateway.ts
│       ├── notifications.module.ts
│       └── notifications.service.spec.ts
│       └── notifications.service.ts
├── test/
│   ├── app.e2e-spec.ts
│   └── jest-e2e.json
├── logs/
│   ├── combined.log
│   └── error.log
└── Dockerfile
```

## 🔧 Scripts Disponíveis

- `npm run build` - Compila o projeto TypeScript
- `npm run start` - Inicia o servidor em modo produção
- `npm run start:dev` - Inicia o servidor em modo desenvolvimento
- `npm run start:debug` - Inicia o servidor em modo debug
- `npm run test` - Executa testes unitários
- `npm run test:watch` - Executa testes em modo watch
- `npm run test:cov` - Executa testes com cobertura
- `npm run test:debug` - Executa testes em modo debug
- `npm run test:e2e` - Executa testes end-to-end

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](../../LICENSE) para mais detalhes.

## 👥 Autores

- **Vinicius** - *Desenvolvimento inicial* - [vinicius1504](https://github.com/vinicius1504)

---

⭐ Parte do ecossistema Task Manager
