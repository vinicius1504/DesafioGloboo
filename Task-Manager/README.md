# 🚀 Task Manager - Microserviços com NestJS

[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![RabbitMQ](https://img.shields.io/badge/RabbitMQ-FF6600?style=for-the-badge&logo=rabbitmq&logoColor=white)](https://www.rabbitmq.com/)
[![Swagger](https://img.shields.io/badge/Swagger-85EA2D?style=for-the-badge&logo=swagger&logoColor=black)](https://swagger.io/)
[![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)

> Sistema completo de gerenciamento de tarefas com arquitetura de microserviços, API Gateway inteligente e comunicação assíncrona via RabbitMQ.

---

## 📋 Visão Geral

O **Task Manager** é uma aplicação robusta construída com arquitetura de microserviços usando **NestJS**, **PostgreSQL**, **RabbitMQ** e **Docker**. O sistema oferece:

- 🔐 **Autenticação JWT** com Guards e Passport
- 🌐 **API Gateway** com rate limiting e roteamento inteligente
- 📡 **Comunicação assíncrona** entre microserviços via RabbitMQ
- 📚 **Documentação Swagger** completa e interativa
- ⚡ **WebSocket** para notificações em tempo real
- 🗄️ **Migrations TypeORM** para controle de versão do banco
- 🐳 **Containerização completa** com Docker Compose

---

## 🏗️ Arquitetura dos Microserviços

```mermaid
graph TB
    subgraph "API Gateway"
        GW[API Gateway<br/>Port: 3003<br/>Rate Limiting: 10 req/seg]
    end

    subgraph "Microserviços"
        AUTH[Auth Service<br/>Port: 3001<br/>PostgreSQL + JWT]
        TASKS[Tasks Service<br/>Port: 3004<br/>PostgreSQL + WebSocket]
        NOTIF[Notifications Service<br/>Port: 3005<br/>PostgreSQL + WebSocket]
    end

    subgraph "Infraestrutura"
        DB[(PostgreSQL<br/>Port: 5432)]
        MQ[(RabbitMQ<br/>Port: 5672)]
        REDIS[(Redis<br/>Port: 6379)]
    end

    GW --> AUTH
    GW --> TASKS
    GW --> NOTIF

    AUTH --> DB
    TASKS --> DB
    NOTIF --> DB

    AUTH <--> MQ
    TASKS <--> MQ
    NOTIF <--> MQ

    TASKS --> REDIS
    NOTIF --> REDIS
```

### 📊 Fluxo de Comunicação

1. **Cliente** → **API Gateway** (rota e rate limiting)
2. **API Gateway** → **Microserviço específico** (HTTP)
3. **Microserviços** ↔ **RabbitMQ** (eventos assíncronos)
4. **Microserviços** → **PostgreSQL** (persistência)
5. **Microserviços** → **Redis** (cache/sessões)

---

## 🎯 Funcionalidades Principais

### 🔐 Autenticação e Segurança
- ✅ **JWT com Guards e Passport**
- ✅ **Rate Limiting** (10 req/seg no Gateway)
- ✅ **Validação com class-validator**
- ✅ **Hashing de senhas** com bcrypt

### 📝 Gerenciamento de Tarefas
- ✅ **CRUD completo** de tarefas
- ✅ **Sistema de comentários**
- ✅ **Atribuição de usuários**
- ✅ **Prioridades e status**
- ✅ **Paginação eficiente**

### 📡 Comunicação em Tempo Real
- ✅ **WebSocket Gateway** para eventos
- ✅ **RabbitMQ** para comunicação assíncrona
- ✅ **Event-driven architecture**
- ✅ **Message patterns** padronizados

### 📚 Documentação e Qualidade
- ✅ **Swagger completo** no Gateway
- ✅ **DTOs com class-transformer**
- ✅ **Migrations TypeORM**
- ✅ **Testes automatizados**

---

## 🚀 Instalação e Execução

### Pré-requisitos
- ✅ **Docker** e **Docker Compose**
- ✅ **Node.js 18+** (opcional para desenvolvimento)
- ✅ **Git**

### ⚡ Execução Rápida

```bash
# 1. Clone o repositório
git clone https://github.com/vinicius1504/DesafioGloboo.git
cd DesafioGloboo/Task-Manager

# 2. Execute com Docker (recomendado)
docker-compose up --build -d

# 3. Acesse as aplicações
echo "🌐 API Gateway: http://localhost:3003"
echo "📚 Swagger Docs: http://localhost:3003/api"
echo "🔐 Auth Service: http://localhost:3001"
echo "📝 Tasks Service: http://localhost:3004"
echo "🔔 Notifications: http://localhost:3005"
```

### 🛠️ Desenvolvimento Local

```bash
# Instalar dependências
npm install

# Executar todos os serviços
npm run dev

# Ou executar serviços específicos
npm run dev --filter=auth-service
npm run dev --filter=tasks-service
npm run dev --filter=notifications-service
npm run dev --filter=api-gateway
```

---

## 📖 Documentação da API

### 🔗 Endpoints Principais

#### Autenticação (`/api/auth`)
```http
POST   /api/auth/register    # Registrar novo usuário
POST   /api/auth/login       # Login e geração de JWT
POST   /api/auth/refresh     # Refresh token JWT
```

#### Tarefas (`/api/tasks`)
```http
GET    /api/tasks?page=1&size=10     # Listar tarefas (paginação)
POST   /api/tasks                     # Criar tarefa → evento task.created
GET    /api/tasks/:id                 # Buscar tarefa por ID
PUT    /api/tasks/:id                 # Atualizar tarefa → evento task.updated
DELETE /api/tasks/:id                 # Excluir tarefa → evento task.deleted
```

#### Comentários (`/api/tasks/:id/comments`)
```http
POST   /api/tasks/:id/comments        # Criar comentário → evento comment.created
GET    /api/tasks/:id/comments?page=1&size=10  # Listar comentários (paginação)
```

### 📋 Exemplos de Uso

#### 1. Registrar Usuário
```bash
curl -X POST http://localhost:3003/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "username": "johndoe",
    "password": "securepassword123"
  }'
```

#### 2. Login
```bash
curl -X POST http://localhost:3003/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "login": "user@example.com",
    "password": "securepassword123"
  }'
```

#### 3. Criar Tarefa (com JWT)
```bash
curl -X POST http://localhost:3003/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Implementar API Gateway",
    "description": "Configurar rate limiting e roteamento",
    "priority": "HIGH",
    "status": "IN_PROGRESS"
  }'
```

#### 4. Listar Tarefas
```bash
curl -X GET "http://localhost:3003/api/tasks?page=1&size=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 🏛️ Estrutura dos Microserviços

```
Task-Manager/
├── apps/
│   ├── api-gateway/                 # 🌐 Gateway de API
│   │   ├── src/
│   │   │   ├── auth/               # Proxy para auth-service
│   │   │   ├── tasks/              # Proxy para tasks-service
│   │   │   ├── notifications/      # Proxy para notifications-service
│   │   │   ├── main.ts             # Configuração Swagger + Rate Limiting
│   │   │   └── app.module.ts       # Módulo principal
│   │   └── Dockerfile
│   │
│   ├── auth-service/                # 🔐 Serviço de Autenticação
│   │   ├── src/
│   │   │   ├── auth/               # Estratégias JWT, Guards
│   │   │   ├── users/              # Gestão de usuários
│   │   │   ├── shared/             # CommunicationService
│   │   │   ├── migrations/         # TypeORM migrations
│   │   │   └── data/               # Configuração PostgreSQL
│   │   └── Dockerfile
│   │
│   ├── tasks-service/               # 📝 Serviço de Tarefas
│   │   ├── src/
│   │   │   ├── tasks/              # CRUD de tarefas
│   │   │   ├── comments/           # Sistema de comentários
│   │   │   ├── users/              # Relacionamentos
│   │   │   ├── websockets/         # Gateway WebSocket
│   │   │   ├── shared/             # CommunicationService
│   │   │   └── migrations/         # TypeORM migrations
│   │   └── Dockerfile
│   │
│   └── notifications-service/       # 🔔 Serviço de Notificações
│       ├── src/
│       │   ├── notifications/      # Gestão de notificações
│       │   ├── websockets/         # Gateway WebSocket
│       │   ├── shared/             # CommunicationService
│       │   └── migrations/         # TypeORM migrations
│       └── Dockerfile
│
├── packages/                        # 📦 Pacotes Compartilhados
│   ├── eslint-config/              # Configurações ESLint
│   ├── typescript-config/          # Configurações TypeScript
│   └── ui/                         # Componentes UI (futuro)
│
├── docker-compose.yml              # 🐳 Orquestração completa
├── turbo.json                      # ⚡ Configuração Turborepo
└── package.json                    # 📋 Dependências raiz
```

---

## 🔧 Tecnologias por Serviço

| Serviço | Tecnologias | Porta | Banco |
|---------|-------------|-------|-------|
| **API Gateway** | NestJS, Swagger, Rate Limiting | 3003 | - |
| **Auth Service** | NestJS, JWT, Passport, bcrypt | 3001 | PostgreSQL |
| **Tasks Service** | NestJS, WebSocket, TypeORM | 3004 | PostgreSQL |
| **Notifications** | NestJS, WebSocket, TypeORM | 3005 | PostgreSQL |

### 📊 Comunicação Entre Serviços

```typescript
// Event-Driven (Assíncrono)
await communicationService.sendTaskCreated(taskData);
await communicationService.sendUserRegistered(userData);

// Request-Response (Síncrono)
const user = await communicationService.getUserById(userId);
const task = await communicationService.getTaskById(taskId);
```

---

## 🐳 Docker Compose Services

```yaml
version: '3.8'
services:
  # Banco de Dados
  postgres:
    image: postgres:15
    ports: ["5432:5432"]

  # Message Broker
  rabbitmq:
    image: rabbitmq:3-management
    ports: ["5672:5672", "15672:15672"]

  # Cache
  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]

  # Microserviços
  auth-service:
    build: ./apps/auth-service
    ports: ["3001:3001"]

  tasks-service:
    build: ./apps/tasks-service
    ports: ["3004:3004"]

  notifications-service:
    build: ./apps/notifications-service
    ports: ["3005:3005"]

  api-gateway:
    build: ./apps/api-gateway
    ports: ["3003:3003"]
```

---

## 📈 Monitoramento e Logs

### Health Checks
```bash
# Verificar saúde dos serviços
curl http://localhost:3001/health  # Auth Service
curl http://localhost:3004/health  # Tasks Service
curl http://localhost:3005/health  # Notifications Service
```

### Logs em Tempo Real
```bash
# Logs do Docker Compose
docker-compose logs -f

# Logs de serviço específico
docker-compose logs -f auth-service
```

---

## 🧪 Testes

```bash
# Executar todos os testes
npm run test

# Testes de serviço específico
npm run test --filter=auth-service

# Testes E2E
npm run test:e2e

# Cobertura de testes
npm run test:cov
```

---

## 🔒 Segurança

- ✅ **JWT** com expiração configurável
- ✅ **Rate Limiting** (10 req/seg no Gateway)
- ✅ **Validação de entrada** com class-validator
- ✅ **Hashing de senhas** com bcrypt (12 rounds)
- ✅ **CORS** configurado
- ✅ **Helmet** para headers de segurança

---

## 📊 Performance

- ✅ **Paginação** em todas as listagens
- ✅ **Cache Redis** para sessões
- ✅ **Connection pooling** PostgreSQL
- ✅ **Lazy loading** em relacionamentos
- ✅ **Compressão Gzip** nas respostas

---

## 🚀 Deploy em Produção

### Pré-requisitos
- Kubernetes ou Docker Swarm
- PostgreSQL gerenciado
- RabbitMQ gerenciado
- Redis gerenciado
- Load Balancer (nginx/traefik)

### Variáveis de Ambiente
```bash
# Produção
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:5432/db
RABBITMQ_URL=amqp://user:pass@host:5672
REDIS_URL=redis://host:6379
JWT_SECRET=your-super-secret-key
```

---

## 🤝 Contribuição

1. **Fork** o projeto
2. **Clone** sua fork: `git clone https://github.com/your-username/DesafioGloboo.git`
3. **Crie** uma branch: `git checkout -b feature/amazing-feature`
4. **Commit** suas mudanças: `git commit -m 'Add amazing feature'`
5. **Push** para a branch: `git push origin feature/amazing-feature`
6. **Abra** um Pull Request

### 📋 Padrões de Código
- ✅ **ESLint** + **Prettier** configurados
- ✅ **Conventional Commits**
- ✅ **TypeScript** obrigatório
- ✅ **Testes** para novas funcionalidades

---

## 📄 Licença

Este projeto está sob a **licença MIT**. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 👨‍💻 Autor

**Vinicius** - *Desenvolvimento Full-Stack* - [vinicius1504](https://github.com/vinicius1504)

---

## 🙏 Agradecimentos

- **NestJS** pela estrutura incrível de microserviços
- **RabbitMQ** pela comunicação assíncrona robusta
- **PostgreSQL** pelo banco de dados confiável
- **Docker** pela containerização simplificada
- **Turborepo** pelo gerenciamento eficiente de monorepo

---

## 📞 Suporte

Para dúvidas ou sugestões:
- 📧 **Email**: seu-email@example.com
- 💬 **Issues**: [GitHub Issues](https://github.com/vinicius1504/DesafioGloboo/issues)
- 📖 **Documentação**: http://localhost:3003/api

---

⭐ **Se este projeto te ajudou, dê uma estrela no GitHub!** ⭐

---

*Desenvolvido com ❤️ usando NestJS, PostgreSQL, RabbitMQ e Docker*