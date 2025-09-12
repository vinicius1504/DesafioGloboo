# Tasks Service

Este é o microserviço de gerenciamento de tarefas do Task Manager, construído com NestJS, TypeORM, PostgreSQL e RabbitMQ.

## Funcionalidades

- ✅ CRUD completo de tarefas
- ✅ Sistema de comentários em tarefas
- ✅ Atribuição de usuários às tarefas
- ✅ Prioridades e status das tarefas
- ✅ Eventos em tempo real via WebSocket
- ✅ Integração com RabbitMQ para eventos
- ✅ Autenticação JWT
- ✅ Documentação Swagger
- ✅ Validação de dados
- ✅ Logs estruturados

## Tecnologias

- **Framework**: NestJS
- **Linguagem**: TypeScript
- **Banco de dados**: PostgreSQL com TypeORM
- **Mensageria**: RabbitMQ
- **WebSocket**: Socket.IO
- **Autenticação**: JWT
- **Documentação**: Swagger/OpenAPI
- **Validação**: class-validator

## Pré-requisitos

- Node.js 18+
- PostgreSQL 13+
- RabbitMQ 3.8+
- Docker (opcional, para desenvolvimento)

## Instalação

1. Instale as dependências:
```bash
npm install
```

2. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:

```env
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