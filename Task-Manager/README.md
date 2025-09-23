# 🚀 Task Manager - Microserviços com NestJS

[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![RabbitMQ](https://img.shields.io/badge/RabbitMQ-FF6600?style=for-the-badge&logo=rabbitmq&logoColor=white)](https://www.rabbitmq.com/)
[![Swagger](https://img.shields.io/badge/Swagger-85EA2D?style=for-the-badge&logo=swagger&logoColor=black)](https://swagger.io/)
[![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)
[![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

> Sistema completo de gerenciamento de tarefas com arquitetura de microserviços, API Gateway inteligente, comunicação assíncrona via RabbitMQ e frontend moderno com React + TanStack Router.

---

## 🎥 Preview do Sistema

### 🖥️ Interface Web (React + shadcn/ui)
![Task Manager Web](https://via.placeholder.com/800x400/4F46E5/FFFFFF?text=Task+Manager+Web+Preview)  
*Interface moderna com autenticação modal, lista de tarefas com filtros, detalhe com comentários e notificações em tempo real.*

### � Arquitetura Visual
```mermaid
graph TB
    subgraph "Frontend (React)"
        WEB[Web App<br/>Port: 5173<br/>React + TanStack Router<br/>shadcn/ui + Tailwind]
    end

    subgraph "API Gateway"
        GW[API Gateway<br/>Port: 3001<br/>Rate Limiting: 10 req/seg]
    end

    subgraph "Microserviços"
        AUTH[Auth Service<br/>Port: 3002<br/>PostgreSQL + JWT]
        TASKS[Tasks Service<br/>Port: 3003<br/>PostgreSQL + WebSocket]
        NOTIF[Notifications Service<br/>Port: 3004<br/>PostgreSQL + WebSocket]
    end

    subgraph "Infraestrutura"
        DB[(PostgreSQL<br/>Port: 5432)]
        MQ[(RabbitMQ<br/>Port: 5672)]
        REDIS[(Redis<br/>Port: 6379)]
    end

    WEB --> GW
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

---

## ✨ Destaques do Sistema

<div align="center">

### 🔐 Autenticação Segura
**JWT + Guards + Passport** | **Rate Limiting** | **Hashing bcrypt**

### 🎨 Frontend Moderno
**React + TypeScript** | **TanStack Router** | **shadcn/ui + Tailwind CSS**  
**Modal Login/Register** | **Validação react-hook-form + Zod** | **Skeleton Loaders**

### 📡 Comunicação em Tempo Real
**WebSocket Gateway** | **RabbitMQ Events** | **Toast Notifications**

### 🏗️ Backend Robusto
**NestJS Microserviços** | **PostgreSQL + TypeORM** | **Swagger Docs**  
**Docker Containerização** | **Migrations** | **Health Checks**

</div>

---

## 📋 Visão Geral

O **Task Manager** é uma aplicação full-stack robusta construída com arquitetura de microserviços usando **NestJS**, **PostgreSQL**, **RabbitMQ**, **Docker** e **React**. O sistema oferece:

- 🔐 **Autenticação JWT** com Guards e Passport
- 🌐 **API Gateway** com rate limiting e roteamento inteligente
- 📡 **Comunicação assíncrona** entre microserviços via RabbitMQ
- 📚 **Documentação Swagger** completa e interativa
- ⚡ **WebSocket** para notificações em tempo real
- 🖥️ **Frontend React** com UI moderna e responsiva
- 🗄️ **Migrations TypeORM** para controle de versão do banco
- 🐳 **Containerização completa** com Docker Compose

---

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

1. **🖥️ Cliente** → **🌐 API Gateway** (rota e rate limiting)
2. **🌐 API Gateway** → **🏗️ Microserviço específico** (HTTP)
3. **🏗️ Microserviços** ↔ **📡 RabbitMQ** (eventos assíncronos)
4. **🏗️ Microserviços** → **🗄️ PostgreSQL** (persistência)
5. **🏗️ Microserviços** → **⚡ Redis** (cache/sessões)

---

## 🎯 Funcionalidades Principais

<div align="center">

| 🔐 Autenticação & Segurança | 📝 Gerenciamento de Tarefas | 📡 Tempo Real | 🎨 Frontend |
|-----------------------------|-----------------------------|---------------|-------------|
| ✅ JWT + Guards + Passport | ✅ CRUD completo de tarefas | ✅ WebSocket Gateway | ✅ React + TypeScript |
| ✅ Rate Limiting (10 req/seg) | ✅ Sistema de comentários | ✅ RabbitMQ Events | ✅ TanStack Router |
| ✅ Validação class-validator | ✅ Atribuição de usuários | ✅ Event-driven arch | ✅ shadcn/ui + Tailwind |
| ✅ Hashing bcrypt | ✅ Prioridades e status | ✅ Message patterns | ✅ Modal Login/Register |
| | ✅ Paginação eficiente | ✅ Toast Notifications | ✅ Skeleton Loaders |

</div>

### 📚 Qualidade & Documentação
- ✅ **Swagger completo** no Gateway
- ✅ **DTOs com class-transformer**
- ✅ **Migrations TypeORM**
- ✅ **Testes automatizados**
- ✅ **ESLint + Prettier**
- ✅ **TypeScript obrigatório**

---

---

## 🚀 Instalação e Execução

---

## 🚀 Instalação e Execução

### 📋 Pré-requisitos

<div align="center">

| Ferramenta | Versão | Status |
|------------|--------|--------|
| 🐳 **Docker** | 20+ | ![Docker](https://img.shields.io/badge/Required-2496ED?style=flat&logo=docker) |
| 🐙 **Docker Compose** | 2.0+ | ![Docker Compose](https://img.shields.io/badge/Required-2496ED?style=flat&logo=docker) |
| 🟢 **Node.js** | 18+ | ![Node.js](https://img.shields.io/badge/Optional-339933?style=flat&logo=node.js) |
| 📚 **Git** | Latest | ![Git](https://img.shields.io/badge/Required-F05032?style=flat&logo=git) |

</div>

### ⚡ Execução Rápida (Docker)

<div align="center">

```bash
# 🚀 Clone e execute em 3 passos
git clone https://github.com/vinicius1504/DesafioGloboo.git
cd DesafioGloboo/Task-Manager
docker-compose up --build -d

# ✅ Pronto! Acesse:
echo "🌐 Frontend:     http://localhost:5173"
echo "🌐 API Gateway:  http://localhost:3001"
echo "📚 Swagger:      http://localhost:3001/api"
echo "🔐 Auth:         http://localhost:3002"
echo "📝 Tasks:        http://localhost:3003"
echo "🔔 Notifications: http://localhost:3004"
```

</div>

### 🛠️ Desenvolvimento Local

```bash
# 📦 Instalar dependências (monorepo)
npm install

# 🚀 Executar tudo
npm run dev

# 🎯 Ou serviços específicos
npm run dev --filter=auth-service
npm run dev --filter=tasks-service
npm run dev --filter=notifications-service
npm run dev --filter=api-gateway
npm run dev --filter=web  # Frontend React
```

### 🐳 Status dos Containers

```bash
# 📊 Verificar containers
docker-compose ps

# 📋 Logs em tempo real
docker-compose logs -f

# 🔄 Reiniciar serviço específico
docker-compose restart tasks-service
```

---

---

---

## 📖 Documentação da API

### 🔗 Endpoints Principais

<div align="center">

| Método | Endpoint | Descrição | Serviço |
|--------|----------|-----------|---------|
| 🔐 **POST** | `/api/auth/register` | Registrar novo usuário | Auth |
| 🔐 **POST** | `/api/auth/login` | Login e geração de JWT | Auth |
| 🔐 **POST** | `/api/auth/refresh` | Refresh token JWT | Auth |
| 📝 **GET** | `/api/tasks?page=1&size=10` | Listar tarefas (paginação) | Tasks |
| 📝 **POST** | `/api/tasks` | Criar tarefa → evento `task.created` | Tasks |
| 📝 **GET** | `/api/tasks/:id` | Buscar tarefa por ID | Tasks |
| 📝 **PUT** | `/api/tasks/:id` | Atualizar tarefa → evento `task.updated` | Tasks |
| 📝 **DELETE** | `/api/tasks/:id` | Excluir tarefa → evento `task.deleted` | Tasks |
| 💬 **POST** | `/api/tasks/:id/comments` | Criar comentário → evento `comment.created` | Tasks |
| 💬 **GET** | `/api/tasks/:id/comments?page=1&size=10` | Listar comentários (paginação) | Tasks |

</div>

### 📋 Exemplos de Uso

#### 1. Registrar Usuário
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "username": "johndoe",
    "password": "securepassword123"
  }'
```

#### 2. Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "login": "user@example.com",
    "password": "securepassword123"
  }'
```

#### 3. Criar Tarefa (com JWT)
```bash
curl -X POST http://localhost:3001/api/tasks \
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
curl -X GET "http://localhost:3001/api/tasks?page=1&size=10" \
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
| **API Gateway** | NestJS, Swagger, Rate Limiting | 3001 | - |
| **Auth Service** | NestJS, JWT, Passport, bcrypt | 3002 | PostgreSQL |
| **Tasks Service** | NestJS, WebSocket, TypeORM | 3003 | PostgreSQL |
| **Notifications** | NestJS, WebSocket, TypeORM | 3004 | PostgreSQL |

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
curl http://localhost:3002/health  # Auth Service
curl http://localhost:3003/health  # Tasks Service
curl http://localhost:3004/health  # Notifications Service
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

## �️ Screenshots & Demonstração

<div align="center">

### 📱 Interface de Login
![Login Modal](https://via.placeholder.com/400x300/4F46E5/FFFFFF?text=Login+Modal)  
*Modal elegante de autenticação com validação em tempo real*

### 📋 Dashboard de Tarefas
![Task Dashboard](https://via.placeholder.com/400x300/10B981/FFFFFF?text=Task+Dashboard)  
*Lista de tarefas com filtros, busca e paginação*

### 💬 Detalhes da Tarefa
![Task Details](https://via.placeholder.com/400x300/F59E0B/FFFFFF?text=Task+Details)  
*Visualização detalhada com sistema de comentários*

### 📊 Arquitetura em Ação
![Architecture](https://via.placeholder.com/400x300/8B5CF6/FFFFFF?text=System+Architecture)  
*Microserviços comunicando via RabbitMQ e WebSocket*

</div>

---

## 🗺️ Roadmap & Próximos Passos

<div align="center">

### 🚀 Em Desenvolvimento
- [ ] **Dashboard Analytics** - Gráficos e métricas de produtividade
- [ ] **Notificações Push** - Integração com Firebase/PWA
- [ ] **Tema Dark/Light** - Alternância de temas no frontend
- [ ] **Export/Import** - CSV/JSON para tarefas

### 🔮 Planejado
- [ ] **Mobile App** - React Native/Expo
- [ ] **Integração Calendário** - Google Calendar/Outlook
- [ ] **Time Tracking** - Pomodoro e relatórios de tempo
- [ ] **Colaboração** - Compartilhamento de tarefas em equipe
- [ ] **API GraphQL** - Alternativa ao REST

### 🎯 Melhorias Técnicas
- [ ] **Monitoring** - Prometheus + Grafana
- [ ] **CI/CD** - GitHub Actions + Deploy automático
- [ ] **Cache Avançado** - Redis clusters
- [ ] **Testes E2E** - Cypress/Playwright
- [ ] **Documentação API** - OpenAPI 3.0 completa

</div>

---

## �📄 Licença

Este projeto está sob a **licença MIT**. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 👨‍💻 Autor

**Vinicius** - *Desenvolvimento Full-Stack* - [vinicius1504](https://github.com/vinicius1504)

---

## 🙏 Agradecimentos

<div align="center">

| Tecnologia | Propósito | Agradecimento |
|------------|-----------|---------------|
| 🏗️ **NestJS** | Framework backend | Estrutura incrível de microserviços |
| 📡 **RabbitMQ** | Message broker | Comunicação assíncrona robusta |
| 🗄️ **PostgreSQL** | Banco de dados | Persistência confiável |
| 🐳 **Docker** | Containerização | Simplificação de deploy |
| ⚡ **Turborepo** | Monorepo | Gerenciamento eficiente |
| ⚛️ **React** | Frontend | UI moderna e interativa |
| 🎨 **Tailwind CSS** | Styling | Design system elegante |

</div>

---

## 📞 Suporte

Para dúvidas ou sugestões:
- 📧 **Email**: seu-email@example.com
- 💬 **Issues**: [GitHub Issues](https://github.com/vinicius1504/DesafioGloboo/issues)
- 📖 **Documentação**: http://localhost:3001/api
- 🌐 **Demo**: http://localhost:5173 (frontend)

---

<div align="center">

## 🌟 Contribua com o Projeto!

⭐ **Se este projeto te ajudou, dê uma estrela no GitHub!** ⭐

[![GitHub stars](https://img.shields.io/github/stars/vinicius1504/DesafioGloboo?style=social)](https://github.com/vinicius1504/DesafioGloboo)
[![GitHub forks](https://img.shields.io/github/forks/vinicius1504/DesafioGloboo?style=social)](https://github.com/vinicius1504/DesafioGloboo)

---

*Desenvolvido com ❤️ usando NestJS, PostgreSQL, RabbitMQ, Docker & React*

</div>