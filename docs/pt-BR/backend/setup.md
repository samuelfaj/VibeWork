# Guia de Setup do Backend

Guia completo para configurar o ambiente de desenvolvimento do backend.

## Pré-requisitos

- Bun 1.0+
- Docker & Docker Compose
- MySQL 8.0+ (via Docker)
- MongoDB 6.0+ (via Docker)
- Redis 7.0+ (via Docker)
- Google Cloud SDK (para produção)
- AWS CLI (para email SES)

## Passo 1: Instalar Bun

```bash
curl -fsSL https://bun.sh/install | bash
bun --version  # Deve ser 1.0+
```

## Passo 2: Clone e Instalação

```bash
git clone <repo-url> VibeWork
cd VibeWork
bun install
```

## Passo 3: Configurar Ambiente

Crie arquivo `.env` a partir do template:

```bash
cp .env.example .env
```

### Configuração MySQL

```env
# Banco de dados
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=sua_senha_segura_aqui
MYSQL_DATABASE=vibe_db

# Connection Pool
MYSQL_POOL_MAX_CONNECTIONS=10
MYSQL_POOL_IDLE_TIMEOUT_MS=30000
```

**Detalhes:**

- **MYSQL_HOST**: Host do banco de dados (localhost para Docker local)
- **MYSQL_PORT**: Padrão 3306
- **MYSQL_USER**: Usuário root para desenvolvimento local
- **MYSQL_PASSWORD**: Definido em docker-compose.yml
- **MYSQL_DATABASE**: Nome do banco de dados
- **Connection pooling**: Configurável para performance

### Configuração MongoDB

```env
MONGODB_URL=mongodb://localhost:27017/vibe_notifications
MONGODB_CONNECTION_POOL_SIZE=10
```

**Detalhes:**

- **MONGODB_URL**: String de conexão
- **Database**: Auto-criado se não existir
- **Connection pooling**: Incluído na string de conexão

### Configuração Redis

```env
REDIS_URL=redis://localhost:6379
REDIS_KEY_PREFIX=vibe:
REDIS_TTL_SECONDS=3600
```

**Detalhes:**

- **REDIS_URL**: Conexão Redis
- **Key prefix**: Namespace para chaves
- **TTL**: Tempo de expiração padrão

### Configuração de Autenticação

```env
AUTH_SECRET=sua_chave_secreta_aqui
# Generate: openssl rand -base64 32

AUTH_CALLBACK_URL=http://localhost:3000/api/auth/callback/[provider]
AUTH_TRUST_HOST=true
```

**Detalhes:**

- **AUTH_SECRET**: Chave aleatória segura para sessões
- **Generate**: `openssl rand -base64 32`
- **CALLBACK_URL**: URI de redirecionamento OAuth
- **TRUST_HOST**: Permitir localhost em desenvolvimento

### Configuração de Email (AWS SES)

```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=sua_chave_de_acesso
AWS_SECRET_ACCESS_KEY=sua_chave_secreta
AWS_SES_FROM_ADDRESS=noreply@example.com

# Opcional: Use role IAM em vez de credenciais
AWS_ROLE_ARN=arn:aws:iam::account:role/service-role
```

**Detalhes:**

- **AWS_REGION**: Região do SES
- **Credenciais**: Usuário IAM com permissões de SES
- **FROM_ADDRESS**: Email de remetente verificado
- **Para produção**: Use roles IAM, não chaves

### Configuração Google Cloud

```env
# Desenvolvimento Local (Pub/Sub Emulator)
PUBSUB_EMULATOR_HOST=localhost:8085
GOOGLE_CLOUD_PROJECT=vibe-local

# Produção (GCP)
GOOGLE_CLOUD_PROJECT=seu-projeto-gcp
GOOGLE_APPLICATION_CREDENTIALS=/path/to/credentials.json
```

**Detalhes:**

- **Emulator**: Testes locais sem GCP
- **Project**: ID do projeto GCP
- **Credentials**: Arquivo JSON da conta de serviço

### Configuração do Servidor

```env
# Aplicação
PORT=3000
NODE_ENV=development

# CORS
CORS_ORIGIN=http://localhost:5173
CORS_CREDENTIALS=true

# Logging
LOG_LEVEL=info
DEBUG=vibe:*
```

**Detalhes:**

- **PORT**: Porta do servidor (3000 por padrão)
- **NODE_ENV**: development, staging, production
- **CORS**: Origem do frontend
- **LOG_LEVEL**: info, debug, warn, error
- **DEBUG**: Filtro de namespace para logs

### Internacionalização

```env
# Locale padrão e idiomas suportados
DEFAULT_LOCALE=en
SUPPORTED_LOCALES=en,pt-BR
```

## Passo 4: Iniciar Serviços Locais

Inicie todos os serviços necessários:

```bash
# Do diretório raiz
docker-compose up -d

# Verifique os serviços
docker-compose ps
```

Saída esperada:

```
NAME         STATUS
mysql        Up 3 seconds
mongodb      Up 3 seconds
redis        Up 3 seconds
pubsub       Up 3 seconds
```

### Portas do Serviço

| Serviço | Porta | URL             |
| ------- | ----- | --------------- |
| MySQL   | 3306  | localhost:3306  |
| MongoDB | 27017 | localhost:27017 |
| Redis   | 6379  | localhost:6379  |
| Pub/Sub | 8085  | localhost:8085  |

### Verificar Conexões

```bash
# MySQL
docker-compose exec mysql mysql -u root -p vibe_db -e "SELECT 1;"

# MongoDB
docker-compose exec mongodb mongosh vibe_notifications --eval "db.version()"

# Redis
docker-compose exec redis redis-cli ping
# Esperado: PONG

# Pub/Sub
curl http://localhost:8085/v1/projects/vibe-local
```

## Passo 5: Inicializar Banco de Dados

### Executar Migrações

```bash
cd backend
bun run db:migrate
```

Isso cria todas as tabelas no MySQL:

- `users` - Contas de usuário
- `sessions` - Sessões ativas
- Outras tabelas de auth

### Seed Database (Opcional)

```bash
bun run db:seed
```

Cria dados de amostra para desenvolvimento.

### Ver Schema

```bash
# Exporte o schema atual
bun run db:export-schema

# Veja no MySQL
docker-compose exec mysql mysql -u root -p vibe_db
```

## Passo 6: Iniciar Servidor Backend

```bash
cd backend
bun run dev
```

Saída esperada:

```
⚡ Start (PID 12345)
  🔥 HTTP server running at http://localhost:3000
  📝 Swagger: http://localhost:3000/swagger
```

### Verificar se o Servidor está Rodando

```bash
# Health check
curl http://localhost:3000/healthz
# {"status":"ok"}

# Readiness check
curl http://localhost:3000/readyz
# {"status":"ready"}

# API docs
open http://localhost:3000/swagger
```

## Comandos de Desenvolvimento

### Testes

```bash
# Testes unitários
bun run test

# Modo watch
bun run test:watch

# Cobertura
bun run test:coverage

# Testes de integração (requer Docker)
bun run test:integration
```

### Qualidade de Código

```bash
# Linting
bun run lint
bun run lint:fix

# Verificação de tipos
bun run typecheck

# Formatação
bun run format
bun run format:check
```

### Operações de Banco de Dados

```bash
# Criar migração
bun run db:create-migration <name>

# Executar migrações
bun run db:migrate

# Desfazer última migração
bun run db:rollback

# Reset banco de dados
bun run db:reset

# Ver schema
bun run db:export-schema
```

### Build e Deployment

```bash
# Build de desenvolvimento
bun run build

# Build de produção
bun run build:prod

# Imagem Docker
docker build -t vibe-backend:latest -f backend/Dockerfile .

# Executar em Docker
docker run -p 3000:3000 vibe-backend:latest
```

## Problemas Comuns e Soluções

### Porta Já em Uso

```bash
# Encontre processo na porta 3000
lsof -i :3000

# Mate o processo
kill -9 <PID>

# Ou use porta diferente
PORT=3001 bun run dev
```

### Erros de Conexão com Banco de Dados

```bash
# Verifique se MySQL está rodando
docker-compose logs mysql

# Verifique string de conexão
# Certifique-se que MYSQL_HOST é 'localhost' não '127.0.0.1'
echo $MYSQL_HOST

# Teste conexão
docker-compose exec mysql mysql -u root -p -h localhost
```

### Erros de Conexão Redis

```bash
# Verifique se Redis está rodando
docker-compose logs redis

# Teste conexão
redis-cli ping

# Verifique formato REDIS_URL
# Deve ser: redis://localhost:6379
```

### Module Not Found

```bash
# Reconstrua pacotes do workspace
bun install --force

# Limpe node_modules
rm -rf node_modules
bun install
```

### Erros de Tipo

```bash
# Execute verificação de tipos
bun run typecheck

# Limpe cache TypeScript
rm -rf dist

# Refaça build
bun run build
```

### Pub/Sub Emulator Não Inicia

```bash
# Certifique-se de que porta 8085 está livre
lsof -i :8085

# Verifique logs docker-compose
docker-compose logs pubsub

# Reinicie o emulator
docker-compose restart pubsub
```

## Setup de IDE

### VS Code

**Extensões Recomendadas:**

- Bun for VSCode
- Thunder Client (REST testing)
- MongoDB for VS Code
- MySQL
- Prettier
- ESLint

**Configuração de Launch** (`.vscode/launch.json`):

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Backend Debug",
      "program": "${workspaceFolder}/backend/src/index.ts",
      "runtimeExecutable": "bun",
      "runtimeArgs": ["run"],
      "cwd": "${workspaceFolder}/backend",
      "console": "integratedTerminal",
      "env": {
        "DEBUG": "vibe:*",
        "NODE_ENV": "development"
      }
    }
  ]
}
```

### WebStorm/IntelliJ IDEA

1. Configure SDK do Projeto para Bun
2. Configure run configuration:
   - Working directory: `backend/`
   - Script: `src/index.ts`
   - Interpreter: Bun

## Checklist de Arquivo de Ambiente

- [ ] Arquivo `.env` criado
- [ ] Credenciais MYSQL configuradas
- [ ] MONGODB_URL configurado
- [ ] REDIS_URL configurado
- [ ] AUTH_SECRET gerado
- [ ] AWS_REGION e endereço SES configurados (podem ser valores de teste)
- [ ] PUBSUB_EMULATOR_HOST configurado
- [ ] PORT e CORS_ORIGIN configurados

## Checklist de Troubleshooting

- [ ] Bun instalado e atualizado
- [ ] Serviços Docker rodando (`docker-compose ps`)
- [ ] Todos os serviços respondendo a health checks
- [ ] Arquivo .env no diretório raiz
- [ ] Migrações de banco de dados executadas com sucesso
- [ ] Servidor inicia sem erros
- [ ] Endpoints de API respondendo (Swagger: http://localhost:3000/swagger)

## Próximos Passos

1. **Entender Arquitetura**: Leia [Visão Geral de Arquitetura](../architecture.md)
2. **Aprender Estrutura de API**: Leia [Referência de API](./api-reference.md)
3. **Explorar Módulos**: Leia [Guia de Módulos](./modules.md)
4. **Executar Testes**: `bun run test`
5. **Fazer uma Mudança**: Crie branch de feature e modifique algo
6. **Iniciar Frontend**: `cd frontend && bun run dev`

## Setup de Produção

Para deployment em produção, veja:

- [Guia de Infraestrutura](../infrastructure.md)
- [Guia de Deployment](../deployment.md)

Estes cobrem:

- Setup do GCP Cloud SQL
- Deployment em Cloud Run
- Configuração de ambiente
- Considerações de segurança
- Setup de monitoramento

---

**Última Atualização**: Dezembro 2024
