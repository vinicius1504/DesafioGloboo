# 🚀 Auth Service - Task Manager

<div align="center">

![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

**Serviço de Autenticação e Gerenciamento de Usuários**

*Sistema robusto de autenticação com JWT, health checks e logging avançado*

</div>

## 📋 Sobre o Projeto

O **Auth Service** é um microserviço responsável pela autenticação e gerenciamento de usuários no sistema Task Manager. Desenvolvido com NestJS e TypeScript, oferece funcionalidades completas de registro, login, refresh tokens e health monitoring.

### ✨ Funcionalidades Principais

- 🔐 **Autenticação JWT** com access e refresh tokens
- 👤 **Gerenciamento de Usuários** (CRUD completo)
- 🔄 **Refresh Token** para sessões prolongadas
- 🏥 **Health Checks** (banco de dados, memória)
- 📊 **Logging Avançado** com Winston
- 🐳 **Containerização** com Docker
- 📚 **Documentação API** com Swagger
- 🧪 **Testes** automatizados

## 🛠️ Tecnologias Utilizadas

### Backend
- **NestJS** - Framework Node.js progressivo
- **TypeScript** - Superset tipado do JavaScript
- **TypeORM** - ORM para TypeScript
- **PostgreSQL** - Banco de dados relacional
- **JWT** - Autenticação baseada em tokens
- **bcrypt** - Hashing de senhas

### Ferramentas de Desenvolvimento
- **Winston** - Logging estruturado
- **Jest** - Framework de testes
- **ESLint** - Linting de código
- **Prettier** - Formatação de código
- **Docker** - Containerização
- **Swagger** - Documentação de API

## 🚀 Como Executar

### Pré-requisitos

- Node.js 20+
- Docker e Docker Compose
- PostgreSQL (ou usar Docker)

### 1. Instalação das Dependências

```bash
npm install
```

### 2. Configuração do Ambiente

Copie o arquivo `.env` e configure as variáveis:

```bash
cp .env.example .env
```

**Variáveis importantes:**
- `DATABASE_HOST` - Host do banco de dados
- `DATABASE_PASSWORD` - Senha do PostgreSQL
- `JWT_SECRET` - Chave secreta para JWT
- `PORT` - Porta do serviço (padrão: 3002)

### 3. Executar com Docker (Recomendado)

```bash
# Subir banco de dados e serviço
docker compose up -d --build

# Verificar logs
docker compose logs -f auth-service
```

### 4. Executar Localmente

```bash
# Banco de dados
docker compose up -d db

# Serviço em modo desenvolvimento
npm run start:dev

# Ou em produção
npm run build
npm run start:prod
```

## 📡 API Endpoints

### Autenticação

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `POST` | `/auth/register` | Registrar novo usuário |
| `POST` | `/auth/login` | Fazer login |
| `POST` | `/auth/refresh` | Renovar access token |
| `GET` | `/auth/profile` | Obter perfil do usuário |

### Usuários

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/users` | Listar usuários |
| `GET` | `/users/:id` | Obter usuário por ID |
| `PUT` | `/users/:id` | Atualizar usuário |
| `DELETE` | `/users/:id` | Remover usuário |

### Health Checks

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/health` | Verificar saúde do serviço |

### 📖 Documentação da API

Acesse a documentação completa em: `http://localhost:3002/api/docs`

## 🏗️ Estrutura do Projeto

```
src/
├── app.module.ts           # Módulo principal
├── main.ts                 # Ponto de entrada da aplicação
├── config/
│   └── environment.ts      # Configurações do ambiente
├── auth/                   # Módulo de autenticação
│   ├── auth.module.ts
│   ├── controller/
│   ├── service/
│   ├── strategies/         # Estratégias JWT
│   ├── guards/            # Guards de autenticação
│   ├── dto/               # Data Transfer Objects
│   └── entities/          # Entidades (removidas após refatoração)
├── users/                  # Módulo de usuários
│   ├── users.module.ts
│   ├── controller/
│   ├── service/
│   └── dto/
├── health/                 # Health checks
│   ├── health.module.ts
│   ├── health.controller.ts
│   └── health.service.ts
├── data/                   # Configuração do banco
│   ├── data-source.ts
│   └── database.config.ts
└── migrations/             # Migrações do banco
```

## ⚙️ Configurações

### Banco de Dados

O serviço utiliza PostgreSQL com TypeORM. As migrações são executadas automaticamente na inicialização.

```typescript
// Executar migrações
npm run migration:run

// Criar nova migração
npm run migration:create -- -n NomeDaMigracao
```

### JWT

- **Access Token**: Expira em 15 minutos
- **Refresh Token**: Expira em 7 dias
- Algoritmo: HS256

### Logging

Logs estruturados com Winston:
- **Console**: Formato colorido e legível
- **Arquivo**: `logs/combined.log` e `logs/error.log`
- Níveis: error, warn, info, debug

## 🧪 Testes

```bash
# Executar todos os testes
npm run test

# Testes com watch
npm run test:watch

# Cobertura de testes
npm run test:cov

# Testes E2E
npm run test:e2e
```

## 🐳 Docker

### Comandos Úteis

```bash
# Construir imagem
docker compose build auth-service

# Executar apenas o serviço
docker compose up auth-service

# Ver logs
docker compose logs -f auth-service

# Acessar container
docker compose exec auth-service sh

# Limpar volumes
docker compose down -v
```

### Dockerfile

O serviço possui dois stages:
- **development**: Com hot-reload e dependências de dev
- **production**: Otimizado para produção

## 🔒 Segurança

- **BCrypt** para hashing de senhas (12 rounds)
- **JWT** com segredos fortes
- **Rate limiting** configurável
- **CORS** configurado
- **Helmet** para headers de segurança
- **Validação** de entrada com class-validator

## 📊 Monitoramento

### Health Checks

O endpoint `/health` verifica:
- ✅ Conectividade com banco de dados
- ✅ Uso de memória (heap e RSS)
- ✅ Status geral do serviço

### Métricas

- Logs estruturados para análise
- Performance de queries
- Uso de recursos do sistema

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

### Padrões de Código

- **ESLint** e **Prettier** configurados
- Commits seguindo [Conventional Commits](https://conventionalcommits.org/)
- Testes obrigatórios para novas funcionalidades

## 📝 Licença

Este projeto está sob a licença UNLICENSED.

## 👥 Equipe

- **Desenvolvedor**: Vinicius
- **Projeto**: Task Manager - Desafio Globoo

## 📞 Suporte

Para dúvidas ou problemas:
- Abra uma issue no GitHub
- Verifique os logs da aplicação
- Consulte a documentação da API

---

<div align="center">

**Feito com ❤️ usando NestJS**

⭐ Se este projeto te ajudou, dê uma estrela!

</div>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

---

<div align="center">

**Feito com ❤️ usando NestJS**

⭐ Se este projeto te ajudou, dê uma estrela!

</div>
