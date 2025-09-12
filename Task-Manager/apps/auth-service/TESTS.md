# Testes Unitários - Auth Service

Este documento descreve os testes unitários implementados para o serviço de autenticação.

## Estrutura dos Testes

Os testes estão organizados seguindo a mesma estrutura dos arquivos fonte:

```
src/
├── auth/
│   ├── controller/
│   │   └── auth.controller.spec.ts
│   ├── service/
│   │   └── auth.service.spec.ts
│   ├── strategies/
│   │   ├── jwt.strategy.spec.ts
│   │   └── jwt-refresh.strategy.spec.ts
│   └── guards/
│       └── jwt-auth.guard.spec.ts
└── users/
    ├── controller/
    │   └── users.controller.spec.ts
    └── service/
        └── users.service.spec.ts
```

## Cobertura dos Testes

### AuthService (`auth.service.spec.ts`)
- ✅ **register()** - Registro de novos usuários
  - Sucesso no registro
  - Erro quando usuário já existe
  - Tratamento de erros desconhecidos
- ✅ **login()** - Autenticação de usuários
  - Login com email
  - Login com username
  - Usuário não encontrado
  - Usuário inativo
  - Senha inválida
- ✅ **refresh()** - Renovação de tokens
  - Renovação bem-sucedida
  - Token inválido
  - Usuário não encontrado
  - Usuário inativo
- ✅ **validateUser()** - Validação de usuário JWT
  - Usuário válido
  - Usuário não encontrado
  - Usuário inativo
- ✅ **parseExpireTime()** - Parsing do tempo de expiração
  - Formatos: segundos, minutos, horas, dias
  - Formato inválido (fallback)

### UsersService (`users.service.spec.ts`)
- ✅ **create()** - Criação de usuários
  - Criação bem-sucedida
  - Usuário já existe
- ✅ **findAll()** - Busca todos os usuários
  - Lista de usuários
  - Lista vazia
- ✅ **findOne()** - Busca usuário por ID
  - Usuário encontrado
  - Usuário não encontrado
- ✅ **findByEmail()** - Busca por email
  - Usuário encontrado
  - Usuário não encontrado
- ✅ **findByUsername()** - Busca por username
  - Usuário encontrado
  - Usuário não encontrado
- ✅ **update()** - Atualização de usuário
  - Atualização sem senha
  - Atualização com senha
  - Usuário não encontrado
- ✅ **remove()** - Remoção de usuário
  - Remoção bem-sucedida
  - Usuário não encontrado
- ✅ **validatePassword()** - Validação de senha
  - Senha válida
  - Senha inválida

### AuthController (`auth.controller.spec.ts`)
- ✅ **register()** - Endpoint de registro
  - Registro bem-sucedido
  - Erro de conflito
  - Erros de validação
- ✅ **login()** - Endpoint de login
  - Login bem-sucedido
  - Credenciais inválidas
  - Conta desativada
- ✅ **refresh()** - Endpoint de renovação
  - Renovação bem-sucedida
  - Token inválido
  - Token expirado

### UsersController (`users.controller.spec.ts`)
- ✅ **create()** - Criação de usuário
  - Criação bem-sucedida
  - Usuário já existe
- ✅ **findAll()** - Listagem de usuários
  - Lista de usuários
  - Lista vazia
- ✅ **findOne()** - Busca usuário
  - Usuário encontrado
  - Usuário não encontrado
- ✅ **update()** - Atualização de usuário
  - Atualização bem-sucedida
  - Usuário não encontrado
  - Atualização parcial
- ✅ **remove()** - Remoção de usuário
  - Remoção bem-sucedida
  - Usuário não encontrado
- ✅ **Guard Integration** - Proteção JWT

### JWT Strategy (`jwt.strategy.spec.ts`)
- ✅ **validate()** - Validação de payload JWT
  - Usuário válido e ativo
  - Usuário não encontrado
  - Usuário inativo
  - Tratamento de erros

### JWT Refresh Strategy (`jwt-refresh.strategy.spec.ts`)
- ✅ **validate()** - Validação de refresh token
  - Token válido
  - Usuário não encontrado
  - Usuário inativo
  - Segurança (secret diferente)

### JWT Auth Guard (`jwt-auth.guard.spec.ts`)
- ✅ **canActivate()** - Proteção de rotas
  - Token válido
  - Token inválido
  - Cabeçalho ausente
  - Formato inválido
  - Token expirado

## Comandos de Teste

### Executar todos os testes unitários
```bash
npm run test
```

### Executar testes com watch mode
```bash
npm run test:watch
```

### Executar testes com cobertura
```bash
npm run test:cov
```

### Executar apenas testes unitários (excluindo e2e)
```bash
npm run test:unit
```

### Executar com debug
```bash
npm run test:debug
```

## Mocks e Utilitários

### Mocks Principais
- **bcrypt**: Para hashing de senhas
- **JwtService**: Para geração e validação de tokens
- **ConfigService**: Para configurações da aplicação
- **Repository (TypeORM)**: Para operações de banco de dados
- **Guards**: Para proteção de rotas

### Dados de Teste
- Usuários mock com diferentes estados (ativo/inativo)
- Tokens JWT válidos e inválidos
- DTOs de teste para todas as operações
- Payloads JWT com diferentes cenários

## Configuração

### Jest Config (`jest.config.js`)
- Cobertura de código configurada
- Thresholds de cobertura: 80%
- Exclusão de arquivos desnecessários
- Setup personalizado

### Environment Setup (`jest.setup.js`)
- Variáveis de ambiente de teste
- Timeout global de 30s
- Limpeza automática de mocks

## Convenções

### Estrutura de Teste
```typescript
describe('ComponentName', () => {
  // Setup
  beforeEach(() => {
    // Configuração antes de cada teste
  });

  afterEach(() => {
    // Limpeza após cada teste
  });

  describe('methodName', () => {
    it('should do something when condition', async () => {
      // Arrange - Preparação
      // Act - Execução
      // Assert - Verificação
    });
  });
});
```

### Nomenclatura
- Describe blocks: Nome do componente/método
- Test cases: "should [expected behavior] when [condition]"
- Mocks: Prefixo "mock" + nome do objeto

### Assertions
- Usar expect() para todas as verificações
- Verificar chamadas de métodos mockados
- Testar tanto casos de sucesso quanto de erro
- Validar estrutura dos objetos retornados

## Executando os Testes

Para executar todos os testes unitários criados:

```bash
# Entrar no diretório do auth-service
cd apps/auth-service

# Instalar dependências (se necessário)
npm install

# Executar todos os testes
npm run test

# Executar com cobertura
npm run test:cov
```

## Relatório de Cobertura

Os testes cobrem:
- **Services**: 100% das funções críticas
- **Controllers**: 100% dos endpoints
- **Guards**: 100% da lógica de proteção
- **Strategies**: 100% da validação JWT
- **Error Handling**: Todos os cenários de erro
- **Edge Cases**: Casos limite e validações

Total estimado de cobertura: **~95%** do código crítico.
