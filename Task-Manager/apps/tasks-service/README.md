# 🚀 Task Service - Gerenciamento de Tarefas

<div align="center">
  <img src="https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/RabbitMQ-FF6600?style=for-the-badge&logo=rabbitmq&logoColor=white" alt="RabbitMQ" />
  <img src="https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white" alt="Socket.io" />
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
</div>

<br />

<div align="center">
  <h3>🏗️ Microserviço de Gerenciamento de Tarefas</h3>
  <p>Uma API REST completa para criação, gerenciamento e acompanhamento de tarefas com autenticação JWT, WebSockets em tempo real e mensageria assíncrona.</p>
</div>

## 📋 Índice

- [✨ Funcionalidades](#-funcionalidades)
- [🏗️ Arquitetura](#️-arquitetura)
- [🛠️ Tecnologias](#️-tecnologias)
- [🚀 Como Executar](#-como-executar)
- [📚 API Documentation](#-api-documentation)
- [🔧 Configurações](#-configurações)
- [📁 Estrutura do Projeto](#-estrutura-do-projeto)
- [🧪 Testes](#-testes)
- [🔐 Autenticação](#-autenticação)
- [📡 WebSockets](#-websockets)
- [🐰 Mensageria](#-mensageria)
- [🤝 Como Contribuir](#-como-contribuir)
- [📄 Licença](#-licença)

## ✨ Funcionalidades

### 🎯 **Gerenciamento de Tarefas**
- ✅ **CRUD Completo**: Criar, listar, atualizar e deletar tarefas
- ✅ **Paginação**: Suporte a paginação para listagem eficiente
- ✅ **Prioridades**: LOW, MEDIUM, HIGH, URGENT
- ✅ **Status**: TODO, IN_PROGRESS, REVIEW, DONE
- ✅ **Datas**: Due dates para controle de prazos
- ✅ **Atribuição**: Vincular usuários às tarefas

### 🔐 **Autenticação e Autorização**
- ✅ **JWT Tokens**: Autenticação stateless
- ✅ **Refresh Tokens**: Renovação automática de acesso
- ✅ **Guards**: Proteção de rotas com JWT
- ✅ **Validação**: Middleware de autenticação

### 📡 **Tempo Real**
- ✅ **WebSockets**: Atualizações em tempo real
- ✅ **Eventos**: Notificações de mudanças
- ✅ **Rooms**: Comunicação por tarefa

### 🐰 **Mensageria**
- ✅ **RabbitMQ**: Comunicação assíncrona
- ✅ **Eventos**: Publicação de eventos de tarefas
- ✅ **Queues**: Processamento assíncrono

### 📝 **Comentários**
- ✅ **Sistema de Comentários**: Vinculado às tarefas
- ✅ **Histórico**: Rastreamento de interações

## 🏗️ Arquitetura

```mermaid
graph TB
    A[Client] --> B[API Gateway]
    B --> C[Auth Service]
    B --> D[Task Service]
    B --> E[Notification Service]

    D --> F[(PostgreSQL)]
    D --> G[RabbitMQ]
    D --> H[WebSocket Server]

    C --> F
    C --> G

    G --> I[Event Consumers]
```

### 🏛️ **Padrões Implementados**
- **Clean Architecture**: Separação clara de responsabilidades
- **Repository Pattern**: Abstração de dados
- **Dependency Injection**: Injeção de dependências
- **DTOs**: Transferência de dados estruturada
- **Guards**: Controle de acesso
- **Interceptors**: Tratamento global de requisições

## 🛠️ Tecnologias

### **Core Framework**
- **[NestJS](https://nestjs.com/)** - Framework Node.js progressivo
- **[TypeScript](https://www.typescriptlang.org/)** - Superset JavaScript tipado

### **Banco de Dados**
- **[PostgreSQL](https://www.postgresql.org/)** - Banco relacional robusto
- **[TypeORM](https://typeorm.io/)** - ORM para TypeScript

### **Autenticação**
- **[JWT](https://jwt.io/)** - JSON Web Tokens
- **[Passport](http://www.passportjs.org/)** - Middleware de autenticação
- **[bcrypt](https://www.npmjs.com/package/bcrypt)** - Hashing de senhas

### **Mensageria**
- **[RabbitMQ](https://www.rabbitmq.com/)** - Message Broker
- **[AMQP](https://www.amqp.org/)** - Protocolo de mensageria

### **Tempo Real**
- **[Socket.IO](https://socket.io/)** - Comunicação bidirecional
- **WebSockets** - Protocolo de comunicação em tempo real

### **Documentação**
- **[Swagger/OpenAPI](https://swagger.io/)** - Documentação interativa da API

### **DevOps**
- **[Docker](https://www.docker.com/)** - Containerização
- **[Docker Compose](https://docs.docker.com/compose/)** - Orquestração de containers

## 🚀 Como Executar

### 📋 **Pré-requisitos**
- Docker e Docker Compose
- Node.js 20+ (para desenvolvimento local)
- PostgreSQL (opcional, para desenvolvimento local)

### 🐳 **Com Docker (Recomendado)**

```bash
# Clonar o repositório
git clone https://github.com/vinicius1504/DesafioGloboo.git
cd DesafioGloboo/Task-Manager

# Executar todos os serviços
docker compose up -d

# Verificar logs
docker logs tasks-service
```

### 💻 **Desenvolvimento Local**

```bash
# Instalar dependências
cd apps/tasks-service
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas configurações

# Executar em modo desenvolvimento
npm run start:dev

# Acessar
# API: http://localhost:3003
# Swagger: http://localhost:3003/api/docs
```

### 🔧 **Variáveis de Ambiente**

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_DATABASE=task_manager_bd

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your-refresh-secret
JWT_REFRESH_EXPIRES_IN=7d

# RabbitMQ
RABBITMQ_URL=amqp://admin:admin@localhost:5672

# Application
PORT=3003
NODE_ENV=development
```

## 📚 API Documentation

### 🌐 **Swagger UI**
Acesse a documentação interativa em:
```
http://localhost:3003/api/docs
```

### 📖 **Endpoints Principais**

#### **Autenticação**
```http
POST /api/auth/login
POST /api/auth/register
POST /api/auth/refresh
```

#### **Tarefas**
```http
GET    /api/tasks          # Listar tarefas (com paginação)
POST   /api/tasks          # Criar tarefa
GET    /api/tasks/:id      # Buscar tarefa por ID
PUT    /api/tasks/:id      # Atualizar tarefa
DELETE /api/tasks/:id      # Deletar tarefa
```

#### **Comentários**
```http
GET    /api/comments/task/:taskId  # Listar comentários da tarefa
POST   /api/comments/task/:taskId  # Criar comentário
GET    /api/comments/:id           # Buscar comentário
DELETE /api/comments/:id           # Deletar comentário
```

### 📝 **Exemplo de Uso**

#### **Criar uma Tarefa**
```bash
curl -X POST http://localhost:3003/api/tasks \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Implementar autenticação JWT",
    "description": "Implementar sistema de login usando JWT",
    "priority": "HIGH",
    "status": "IN_PROGRESS",
    "dueDate": "2025-09-20T23:59:59.000Z",
    "assignedUserIds": ["user-uuid-1", "user-uuid-2"]
  }'
```

#### **Listar Tarefas**
```bash
curl -X GET "http://localhost:3003/api/tasks?page=1&size=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🔧 Configurações

### **Database Configuration**
```typescript
// src/config/data-source.ts
export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  // ... outras configurações
};
```

### **JWT Configuration**
```typescript
// src/app.module.ts
JwtModule.registerAsync({
  useFactory: (configService: ConfigService) => ({
    secret: configService.get<string>('JWT_SECRET'),
    signOptions: { expiresIn: '15m' },
  }),
  inject: [ConfigService],
})
```

### **RabbitMQ Configuration**
```typescript
// src/shared/services/rabbitmq.service.ts
private async connect(): Promise<void> {
  const rabbitmqUrl = this.configService.get<string>('RABBITMQ_URL');
  this.connection = await connect(rabbitmqUrl);
  // ... configuração de exchanges e queues
}
```

## 📁 Estrutura do Projeto

```
apps/tasks-service/
├── src/
│   ├── app.controller.ts          # Controller principal
│   ├── app.module.ts              # Módulo raiz
│   ├── app.service.ts             # Serviço principal
│   ├── main.ts                    # Ponto de entrada
│   │
│   ├── auth/                      # Autenticação
│   │   ├── guards/
│   │   │   └── jwt-auth.guard.ts
│   │   ├── strategies/
│   │   │   └── jwt.strategy.ts
│   │   └── decorators/
│   │       └── current-user.decorator.ts
│   │
│   ├── tasks/                     # Módulo de tarefas
│   │   ├── controllers/
│   │   │   └── task.controller.ts
│   │   ├── services/
│   │   │   └── task.service.ts
│   │   ├── entities/
│   │   │   └── task.entity.ts
│   │   ├── dto/
│   │   │   ├── task.dto.ts
│   │   │   └── task-response.dto.ts
│   │   └── tasks.module.ts
│   │
│   ├── comments/                  # Módulo de comentários
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── entities/
│   │   └── dto/
│   │
│   ├── users/                     # Módulo de usuários
│   │   ├── entities/
│   │   │   └── user.entity.ts
│   │   └── users.module.ts
│   │
│   ├── shared/                    # Utilitários compartilhados
│   │   ├── services/
│   │   │   └── rabbitmq.service.ts
│   │   ├── dto/
│   │   │   └── pagination.dto.ts
│   │   └── shared.module.ts
│   │
│   ├── websockets/                # WebSockets
│   │   ├── task.gateway.ts
│   │   └── websocket.module.ts
│   │
│   ├── config/                    # Configurações
│   │   ├── data-source.ts
│   │   └── environment.ts
│   │
│   └── health/                    # Health checks
│       ├── health.controller.ts
│       └── health.module.ts
│
├── test/                          # Testes
│   ├── app.e2e-spec.ts
│   └── jest-e2e.json
│
├── docker-compose.yml             # Docker Compose
├── Dockerfile                     # Docker
├── package.json                   # Dependências
├── tsconfig.json                  # TypeScript
└── README.md                      # Este arquivo
```

## 🧪 Testes

### **Executar Testes**
```bash
# Todos os testes
npm run test

# Testes com watch
npm run test:watch

# Cobertura de testes
npm run test:cov

# Testes E2E
npm run test:e2e

# Testes com debug
npm run test:debug
```

### **Estrutura de Testes**
```typescript
// Exemplo de teste unitário
describe('TaskService', () => {
  let service: TaskService;
  let mockRepository: MockType<Repository<Task>>;

  beforeEach(async () => {
    // Configuração dos testes
  });

  it('should create a task', async () => {
    // Teste de criação de tarefa
  });
});
```

## 🔐 Autenticação

### **JWT Token Flow**
```mermaid
sequenceDiagram
    participant Client
    participant Auth Service
    participant Task Service

    Client->>Auth Service: POST /auth/login
    Auth Service-->>Client: Access Token + Refresh Token

    Client->>Task Service: GET /api/tasks (com Bearer Token)
    Task Service-->>Client: Dados da tarefa

    Client->>Auth Service: POST /auth/refresh
    Auth Service-->>Client: Novo Access Token
```

### **Guards e Decorators**
```typescript
// Proteção de rota
@UseGuards(JwtAuthGuard)
@Get()
async findAll() {
  // Rota protegida
}

// Obter usuário atual
@Get('profile')
async getProfile(@CurrentUser() user: User) {
  return user;
}
```

## 📡 WebSockets

### **Eventos em Tempo Real**
```typescript
// Cliente se conecta
socket.emit('join-task', { taskId: '123' });

// Servidor notifica mudanças
socket.emit('task-updated', {
  taskId: '123',
  action: 'status_changed',
  data: { status: 'DONE' }
});
```

### **Rooms por Tarefa**
```typescript
// src/websockets/task.gateway.ts
@SubscribeMessage('join-task')
handleJoinTask(client: Socket, payload: { taskId: string }) {
  client.join(`task-${payload.taskId}`);
}
```

## 🐰 Mensageria

### **Eventos Publicados**
```typescript
// Publicar evento de tarefa criada
const event: TaskEvent = {
  eventType: 'task.created',
  taskId: task.id,
  data: { title: task.title, priority: task.priority },
  timestamp: new Date(),
};

await this.rabbitMQService.publishTaskEvent(event);
```

### **Consumo de Eventos**
```typescript
// Consumir eventos
await this.rabbitMQService.consumeTaskEvents(async (event) => {
  // Processar evento
  console.log(`Evento: ${event.eventType}`, event.data);
});
```

## 🤝 Como Contribuir

### **Fluxo de Desenvolvimento**
1. **Fork** o projeto
2. **Clone** sua fork: `git clone https://github.com/seu-usuario/task-service.git`
3. **Crie** uma branch: `git checkout -b feature/nova-funcionalidade`
4. **Commit** suas mudanças: `git commit -m 'Adiciona nova funcionalidade'`
5. **Push** para a branch: `git push origin feature/nova-funcionalidade`
6. **Abra** um Pull Request

### **Padrões de Código**
```bash
# Formatação
npm run format

# Linting
npm run lint

# Build
npm run build
```

### **Conventional Commits**
```bash
# Exemplos
git commit -m "feat: adiciona endpoint de busca avançada"
git commit -m "fix: corrige validação de datas"
git commit -m "docs: atualiza documentação da API"
git commit -m "test: adiciona testes para service de tarefas"
```

## 📄 Licença

Este projeto está sob a licença **UNLICENSED**. Todos os direitos reservados.

---

<div align="center">
  <p>Feito com ❤️ por <strong>Vinicius</strong></p>
  <p>
    <a href="#-task-service---gerenciamento-de-tarefas">Voltar ao topo</a>
  </p>
</div>

---

## 📞 Suporte

Para dúvidas ou sugestões, entre em contato:

- **Email**: seu-email@example.com
- **GitHub Issues**: [Abrir Issue](https://github.com/vinicius1504/DesafioGloboo/issues)
- **Documentação**: [Wiki do Projeto](https://github.com/vinicius1504/DesafioGloboo/wiki)

---

## 🎯 Roadmap

### **Próximas Funcionalidades**
- [ ] 📊 **Dashboard**: Métricas e relatórios
- [ ] 📧 **Notificações**: Sistema de alertas por email
- [ ] 📱 **Mobile App**: Aplicativo móvel
- [ ] 🔄 **Integrações**: APIs de terceiros
- [ ] 📈 **Analytics**: Análise de produtividade
- [ ] 🎨 **Themes**: Personalização da interface
- [ ] 🌍 **i18n**: Suporte a múltiplos idiomas
- [ ] 🔍 **Search**: Busca avançada com filtros
- [ ] 📋 **Templates**: Modelos de tarefas
- [ ] 👥 **Teams**: Gerenciamento de equipes

---

<div align="center">
  <h3>⭐ Dê uma estrela se este projeto te ajudou!</h3>
</div>
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_DATABASE=tasks_db

# JWT
JWT_SECRET=your-jwt-secret-key

# RabbitMQ
RABBITMQ_URL=amqp://localhost:5672

# Application
NODE_ENV=development
PORT=3001
```

3. Execute as migrações do banco de dados:
```bash
npm run migration:run
```

## Executando a aplicação

### Desenvolvimento
```bash
npm run start:dev
```

### Produção
```bash
npm run build
npm run start:prod
```

### Docker
```bash
docker-compose up -d
```

## API Endpoints

### Tarefas

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/tasks` | Lista todas as tarefas (com paginação) |
| GET | `/api/tasks/:id` | Obtém uma tarefa por ID |
| POST | `/api/tasks` | Cria uma nova tarefa |
| PUT | `/api/tasks/:id` | Atualiza uma tarefa |
| DELETE | `/api/tasks/:id` | Remove uma tarefa |

### Comentários

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/comments/task/:taskId` | Lista comentários de uma tarefa |
| GET | `/api/comments/:id` | Obtém um comentário por ID |
| POST | `/api/comments/task/:taskId` | Cria um comentário em uma tarefa |
| DELETE | `/api/comments/:id` | Remove um comentário |

## WebSocket Events

### Conectar ao WebSocket
```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:3001/tasks');
```

### Eventos disponíveis

#### Entrar em uma sala de tarefa
```javascript
socket.emit('join-task', taskId);
```

#### Sair de uma sala de tarefa
```javascript
socket.emit('leave-task', taskId);
```

#### Eventos recebidos
```javascript
// Tarefa criada
socket.on('task:created', (data) => {
  console.log('Nova tarefa criada:', data);
});

// Tarefa atualizada
socket.on('task:updated', (data) => {
  console.log('Tarefa atualizada:', data);
});

// Novo comentário
socket.on('comment:new', (data) => {
  console.log('Novo comentário:', data);
});
```

## Scripts Disponíveis

```bash
# Desenvolvimento
npm run start:dev          # Inicia em modo desenvolvimento
npm run start:debug        # Inicia com debugger
npm run start:prod         # Inicia em modo produção

# Build
npm run build              # Compila TypeScript
npm run format             # Formata código com Prettier
npm run lint               # Executa ESLint
npm run lint:fix           # Corrige problemas de linting

# Testes
npm run test               # Executa testes unitários
npm run test:watch         # Executa testes em modo watch
npm run test:cov           # Executa testes com cobertura
npm run test:debug         # Executa testes com debugger
npm run test:e2e           # Executa testes end-to-end

# Banco de dados
npm run migration:generate # Gera nova migração
npm run migration:create   # Cria arquivo de migração vazio
npm run migration:run      # Executa migrações pendentes
npm run migration:revert   # Reverte última migração
```

## Documentação da API

A documentação completa da API está disponível via Swagger em:
```
http://localhost:3001/api
```

## Monitoramento

### Health Check
```
GET /health
```

### Logs
Os logs são estruturados usando Winston e incluem:
- Nível de log (info, warn, error)
- Timestamp
- Contexto da operação
- Dados relevantes

## Desenvolvimento

### Estrutura do Projeto
```
src/
├── app.module.ts              # Módulo principal
├── main.ts                    # Ponto de entrada da aplicação
├── config/
│   ├── data-source.ts         # Configuração do TypeORM
│   └── environment.ts         # Configurações de ambiente
├── tasks/
│   ├── controllers/           # Controladores REST
│   ├── services/              # Lógica de negócio
│   ├── entities/              # Entidades do banco
│   ├── dto/                   # Data Transfer Objects
│   └── tasks.module.ts        # Módulo de tarefas
├── comments/
│   ├── controllers/           # Controladores de comentários
│   ├── services/              # Serviços de comentários
│   ├── entities/              # Entidades de comentários
│   ├── dto/                   # DTOs de comentários
│   └── comments.module.ts     # Módulo de comentários
├── users/
│   ├── entities/              # Entidades de usuários
│   └── users.module.ts        # Módulo de usuários
├── auth/
│   ├── guards/                # Guards de autenticação
│   ├── decorators/            # Decorators customizados
│   └── strategies/            # Estratégias de autenticação
├── shared/
│   ├── services/              # Serviços compartilhados
│   ├── dto/                   # DTOs compartilhados
│   └── shared.module.ts       # Módulo compartilhado
└── websockets/
    ├── task.gateway.ts        # Gateway WebSocket
    └── websocket.module.ts    # Módulo WebSocket
```

## Deploy

### Docker
```bash
# Build da imagem
docker build -t tasks-service .

# Executar container
docker run -p 3001:3001 tasks-service
```

## Troubleshooting

### Problemas Comuns

1. **Erro de conexão com PostgreSQL**
   - Verifique se o PostgreSQL está rodando
   - Confirme as credenciais no `.env`
   - Execute migrações: `npm run migration:run`

2. **Erro de conexão com RabbitMQ**
   - Verifique se o RabbitMQ está rodando
   - Confirme a URL no `.env`
   - Verifique permissões e virtual hosts

3. **WebSocket não conecta**
   - Verifique CORS settings
   - Confirme namespace `/tasks`
   - Verifique logs do servidor

4. **JWT não funciona**
   - Verifique `JWT_SECRET` no `.env`
   - Confirme token no header `Authorization: Bearer <token>`

## Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.