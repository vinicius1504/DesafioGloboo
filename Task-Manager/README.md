# 🚀 Task Manager

[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Turborepo](https://img.shields.io/badge/Turborepo-000000?style=for-the-badge&logo=turborepo&logoColor=white)](https://turborepo.org/)

Um sistema completo de gerenciamento de tarefas construído com arquitetura de microserviços, utilizando tecnologias modernas para escalabilidade e eficiência.

## 📋 Descrição

O Task Manager é uma aplicação robusta para gerenciamento de tarefas pessoais e em equipe. Com uma arquitetura de microserviços, oferece autenticação segura, notificações em tempo real, API Gateway para roteamento inteligente e uma interface web intuitiva.

## ✨ Funcionalidades

- 🔐 **Autenticação e Autorização**: Sistema de login seguro com JWT
- 📝 **Gerenciamento de Tarefas**: Criar, editar, excluir e organizar tarefas
- 🔔 **Notificações em Tempo Real**: Alertas via WebSocket para atualizações
- 🌐 **API Gateway**: Roteamento inteligente entre serviços
- 📊 **Dashboard**: Interface web moderna para visualização e controle
- 📚 **Documentação**: Documentação interativa com Next.js
- 🐳 **Containerização**: Totalmente dockerizado para fácil deploy

## 🛠️ Tecnologias Utilizadas

### Backend
- **NestJS**: Framework Node.js para construção de APIs escaláveis
- **TypeScript**: Tipagem estática para maior robustez
- **PostgreSQL**: Banco de dados relacional
- **Redis**: Cache e armazenamento de sessões
- **WebSocket**: Comunicação em tempo real

### Frontend
- **Next.js**: Framework React para aplicações web
- **React**: Biblioteca para interfaces de usuário
- **Tailwind CSS**: Framework CSS utilitário

### Infraestrutura
- **Docker & Docker Compose**: Containerização e orquestração
- **Turborepo**: Gerenciamento de monorepo
- **ESLint & Prettier**: Padronização de código

## 🚀 Instalação e Execução

### Pré-requisitos
- Docker e Docker Compose instalados
- Node.js (versão 18 ou superior) - opcional para desenvolvimento local

### Passos para Instalação

1. **Clone o repositório**
   ```bash
   git clone https://github.com/vinicius1504/DesafioGloboo.git
   cd DesafioGloboo/Task-Manager
   ```

2. **Configure as variáveis de ambiente**
   ```bash
   cp .env.example .env
   # Edite o arquivo .env com suas configurações
   ```

3. **Execute com Docker Compose**
   ```bash
   docker-compose up --build
   ```

A aplicação estará disponível em:
- **Web App**: http://localhost:3000
- **Documentação**: http://localhost:3001
- **API Gateway**: http://localhost:3002

### Desenvolvimento Local

Para desenvolvimento sem Docker:

1. **Instale as dependências**
   ```bash
   npm install
   ```

2. **Configure o banco de dados**
   ```bash
   # Execute o script de inicialização do banco
   npm run db:init
   ```

3. **Execute os serviços**
   ```bash
   # Todos os serviços
   npm run dev

   # Serviço específico
   npm run dev --filter=auth-service
   ```

## 📁 Estrutura do Projeto

```
Task-Manager/
├── apps/
│   ├── api-gateway/          # Gateway de API (NestJS)
│   ├── auth-service/         # Serviço de autenticação (NestJS)
│   ├── notifications-service/# Serviço de notificações (NestJS)
│   ├── tasks-service/        # Serviço de tarefas (NestJS)
│   ├── docs/                 # Documentação (Next.js)
│   └── web/                  # Aplicação web (Next.js)
├── packages/
│   ├── eslint-config/        # Configurações ESLint
│   ├── typescript-config/    # Configurações TypeScript
│   └── ui/                   # Componentes compartilhados
├── scripts/
│   └── init-db.sql/          # Scripts de banco de dados
└── docker-compose.yml        # Orquestração Docker
```

## 🔧 Scripts Disponíveis

- `npm run build` - Build de todos os serviços
- `npm run dev` - Desenvolvimento de todos os serviços
- `npm run lint` - Verificação de linting
- `npm run test` - Execução de testes
- `npm run db:init` - Inicialização do banco de dados

## 🤝 Contribuição

Contribuições são bem-vindas! Siga estes passos:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

### Diretrizes de Contribuição
- Siga os padrões de código estabelecidos
- Adicione testes para novas funcionalidades
- Atualize a documentação conforme necessário
- Use commits semânticos

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👥 Autores

- **Vinicius** - *Desenvolvimento inicial* - [vinicius1504](https://github.com/vinicius1504)

## 🙏 Agradecimentos

- Turborepo pela ferramenta de monorepo
- NestJS pela estrutura de microserviços
- Next.js pela experiência de desenvolvimento web
- Comunidade open source

---

⭐ Se este projeto foi útil para você, dê uma estrela!
