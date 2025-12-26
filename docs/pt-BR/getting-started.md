# Primeiros Passos

Guia para configurar seu ambiente de desenvolvimento.

## Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Bun 1.0+** - [Guia de instalação](https://bun.sh)
- **Docker & Docker Compose** - [Guia de instalação](https://docs.docker.com/get-docker/)
- **Git** - Para controle de versão
- **Um editor de código** - VS Code, WebStorm ou similar

### Verificar Instalação

```bash
bun --version
docker --version
docker-compose --version
git --version
```

## Passo 1: Clonar o Repositório

```bash
git clone https://github.com/yourusername/VibeWork.git
cd VibeWork
```

## Passo 2: Instalar Dependências

```bash
# Instalar todas as dependências
bun install
```

Este comando instala dependências para todos os workspaces:

- Root
- `/backend`
- `/frontend`
- `/shared/contract`
- `/e2e/playwright`
- `/e2e/stagehand`

## Passo 3: Configurar Variáveis de Ambiente

### Criar arquivo `.env`

```bash
cp .env.example .env
```

### Editar `.env`

Atualize as variáveis para sua configuração:

```env
# Servidor Backend
PORT=3000
NODE_ENV=development

# MySQL
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=sua_senha_aqui
MYSQL_DATABASE=vibe_db

# MongoDB
MONGODB_URL=mongodb://localhost:27017/vibe_notifications

# Redis
REDIS_URL=redis://localhost:6379

# Google Pub/Sub (emulador local)
PUBSUB_EMULATOR_HOST=localhost:8085
GOOGLE_CLOUD_PROJECT=vibe-local

# Autenticação
AUTH_SECRET=gerar_com_openssl_rand_-base64_32

# Frontend
VITE_API_URL=http://localhost:3000
```

## Passo 4: Iniciar Serviços Locais

```bash
# Iniciar MySQL, MongoDB, Redis e Pub/Sub Emulator
docker-compose up -d
```

Verificar serviços:

```bash
# Verificar containers
docker-compose ps

# Você deve ver:
# - mysql (porta 3306)
# - mongodb (porta 27017)
# - redis (porta 6379)
# - pubsub (porta 8085)
```

## Passo 5: Inicializar Banco de Dados

### Rodar Migrações

```bash
cd backend
bun run db:migrate
```

Cria as tabelas necessárias no MySQL.

## Passo 6: Iniciar Servidores de Desenvolvimento

```bash
# A partir do diretório raiz
bun run dev
```

Inicia:

- **Backend**: http://localhost:3000
- **Frontend**: http://localhost:5173

Ou inicie separadamente:

```bash
# Terminal 1: Backend
cd backend && bun run dev

# Terminal 2: Frontend
cd frontend && bun run dev
```

## Passo 7: Verificar Instalação

### Health Check do Backend

```bash
curl http://localhost:3000/healthz
# Resposta esperada: {"status":"ok"}
```

### Acessar Frontend

Abra seu navegador em:

- **Frontend**: http://localhost:5173

### Ver Documentação da API

Acesse a documentação Swagger interativa:

- **Swagger UI**: http://localhost:3000/swagger

## Primeiros Passos com a Aplicação

### 1. Criar uma Conta

1. Abra http://localhost:5173
2. Clique em "Sign Up"
3. Digite email e senha
4. Envie o formulário

### 2. Verificar Autenticação

1. A conta será criada
2. Você será automaticamente logado
3. Verá o dashboard ou home page

### 3. Testar API Diretamente

```bash
# Sign up
curl -X POST http://localhost:3000/api/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"securepassword"}'

# Obter sessão
curl http://localhost:3000/api/auth/session

# Sign out
curl -X POST http://localhost:3000/api/auth/sign-out
```

## Tarefas Comuns

### Ver Logs

```bash
# Logs do MySQL
docker-compose logs -f mysql

# Frontend: ver terminal onde `bun run dev` está rodando
```

### Parar Serviços

```bash
# Parar todos os serviços
docker-compose down

# Parar e remover volumes (tabula rasa)
docker-compose down -v
```

### Resetar Banco de Dados

```bash
# Parar serviços e remover volumes
docker-compose down -v

# Reiniciar serviços
docker-compose up -d

# Rodar migrações novamente
cd backend && bun run db:migrate
```

### Acessar Bancos de Dados Diretamente

```bash
# MySQL
docker-compose exec mysql mysql -u root -p vibe_db

# MongoDB
docker-compose exec mongodb mongosh vibe_notifications

# Redis
docker-compose exec redis redis-cli
```

## Rodar Testes

### Testes Unitários

```bash
# Rodar testes do backend
cd backend && bun run test

# Modo watch
cd backend && bun run test:watch

# Com cobertura
cd backend && bun run test:coverage
```

### Testes Integrados

```bash
# Requer Docker e serviços rodando
cd backend && bun run test:integration
```

### Testes E2E

```bash
# Testes E2E do frontend com Playwright
bun run test:e2e

# Em modo headed (ver navegador)
bun run test:e2e:headed

# Modo debug
bun run test:e2e:debug
```

## Qualidade de Código

### Linting

```bash
# Verificar problemas
bun run lint

# Auto-corrigir problemas
bun run lint:fix
```

### Verificação de Tipos

```bash
# Verificar tipos TypeScript
bun run typecheck
```

### Formatação de Código

```bash
# Verificar formatação
bun run format:check

# Auto-formatar código
bun run format
```

## Build para Produção

```bash
# Build de todos os pacotes
bun run build

# Output em:
# - backend/dist/
# - frontend/dist/
```

## Resolução de Problemas

### Porta Já em Uso

Se a porta 3000 ou 5173 já está em uso:

```bash
# Encontrar processo usando porta 3000
lsof -i :3000

# Matar processo
kill -9 <PID>

# Ou usar porta diferente
PORT=3001 bun run dev
```

### Problemas de Conexão com Banco de Dados

```bash
# Verificar se MySQL está rodando
docker-compose ps mysql

# Ver logs do MySQL
docker-compose logs mysql

# Verificar string de conexão em .env
# Padrão: localhost:3306 (não 127.0.0.1)
```

### Erros de Instalação de Dependências

```bash
# Limpar cache e reinstalar
rm -rf node_modules .bun
bun install

# Ou usar flag de força
bun install --force
```

### Erros de Módulo não Encontrado

```bash
# Garantir que todos workspaces foram instalados
bun install

# Fazer rebuild de pacotes
bun run build:deps
```

## Lista de Verificação

- [ ] Bun instalado e atualizado
- [ ] Serviços Docker rodando (`docker-compose ps`)
- [ ] Arquivo `.env` criado
- [ ] Variáveis de ambiente configuradas
- [ ] Migrações de banco de dados executadas
- [ ] Servidores dev iniciados sem erros
- [ ] Frontend acessível em http://localhost:5173
- [ ] Backend respondendo em http://localhost:3000/healthz

## Próximos Passos

Uma vez que a configuração estiver completa:

1. **[Leia Visão Geral da Arquitetura](./architecture.md)** - Entenda o design do sistema
2. **[Documentação do Backend](./backend/)** - Aprenda a estrutura do backend
3. **[Documentação do Frontend](./frontend/)** - Aprenda a estrutura do frontend
4. **[Referência da API](./backend/api-reference.md)** - Explore endpoints disponíveis
5. **[Guia de Contribuição](./contributing.md)** - Aprenda o workflow de contribuição

## Precisa de Ajuda?

- Confira o [Guia de Arquitetura](./architecture.md) para design do sistema
- Revise [Configuração do Backend](./backend/setup.md) para configuração específica
- Revise [Configuração do Frontend](./frontend/setup.md) para setup específico
- Verifique arquivos CLAUDE.md em cada pacote para documentação detalhada
- Revise testes para exemplos de uso

---

**Última Atualização**: Dezembro 2024
