# Guia de Infraestrutura

Guia para serviços de infraestrutura, Docker Compose e setup do GCP.

## Infraestrutura de Desenvolvimento Local

### Serviços Docker Compose

**Localização:** `docker-compose.yml`

Todos os serviços para desenvolvimento local executam em Docker:

```yaml
services:
  mysql:
    image: mysql:8.0
    ports:
      - '3306:3306'
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: vibe_db

  mongodb:
    image: mongodb:6.0
    ports:
      - '27017:27017'
    environment:
      MONGO_INITDB_DATABASE: vibe_notifications

  redis:
    image: redis:7.0
    ports:
      - '6379:6379'

  pubsub:
    image: google/cloud-sdk:emulator
    ports:
      - '8085:8085'
    command: >
      gcloud beta emulators pubsub start
      --host-port=0.0.0.0:8085
```

### Iniciando Serviços

```bash
# Inicie todos os serviços
docker-compose up -d

# Veja logs
docker-compose logs -f

# Interrompa serviços
docker-compose down

# Remova volumes
docker-compose down -v
```

### Detalhes do Serviço

**MySQL 8.0**

- Porta: 3306
- Database: vibe_db
- Usuário: root
- Senha: (do .env)
- Volumes: mysql_data (persistente)

**MongoDB 6.0**

- Porta: 27017
- Database: vibe_notifications
- Volumes: mongodb_data (persistente)

**Redis 7.0**

- Porta: 6379
- Sem autenticação (apenas local)

**Google Pub/Sub Emulator**

- Porta: 8085
- Projeto: vibe-local
- Reset a cada início

## Infraestrutura de Produção (GCP)

### Arquitetura

```
┌──────────────────────┐
│   Cloud Load         │
│   Balancer           │
└──────────┬───────────┘
           │
┌──────────┴───────────┐
│   Cloud Run          │  (Containerized app)
│   (auto-scaling)     │
└──────────┬───────────┘
           │
    ┌──────┴──────┬──────────┬──────────┐
    │             │          │          │
    ▼             ▼          ▼          ▼
┌────────┐  ┌─────────┐  ┌─────┐  ┌──────┐
│Cloud   │  │Cloud    │  │Redis│  │Pub/  │
│SQL     │  │Firestore│  │     │  │Sub   │
│(MySQL) │  │ or Atlas│  │Cache│  │      │
└────────┘  └─────────┘  └─────┘  └──────┘
```

### Cloud SQL (MySQL)

```bash
# Crie instância
gcloud sql instances create vibe-mysql \
  --database-version MYSQL_8_0 \
  --tier db-f1-micro \
  --region us-central1

# Crie database
gcloud sql databases create vibe_prod \
  --instance vibe-mysql

# Crie usuário
gcloud sql users create app_user \
  --instance vibe-mysql \
  --password <secure_password>

# Conecte
gcloud sql connect vibe-mysql \
  --user root
```

### Cloud Memorystore (Redis)

```bash
# Crie instância Redis
gcloud redis instances create vibe-redis \
  --size 1 \
  --region us-central1

# Obtenha detalhes de conexão
gcloud redis instances describe vibe-redis \
  --region us-central1
```

### Deployment Cloud Run

Aplicação backend é executada como container:

```bash
# Build imagem Docker
docker build -t vibe-backend:latest -f backend/Dockerfile .

# Push para Container Registry
docker tag vibe-backend:latest \
  gcr.io/your-project/vibe-backend:latest
docker push gcr.io/your-project/vibe-backend:latest

# Deploy em Cloud Run
gcloud run deploy vibe-backend \
  --image gcr.io/your-project/vibe-backend:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars \
    MYSQL_HOST=<cloud-sql-ip>,\
    MONGODB_URL=<atlas-url>,\
    REDIS_URL=<memorystore-ip>,\
    GOOGLE_CLOUD_PROJECT=your-project
```

### Cloud Pub/Sub

```bash
# Crie tópicos
gcloud pubsub topics create notification-created
gcloud pubsub topics create notification-sent

# Crie subscriptions
gcloud pubsub subscriptions create \
  notification-created-email \
  --topic notification-created \
  --push-endpoint https://vibe-backend-xxx.run.app/webhooks/email

# Publique mensagem de teste
gcloud pubsub topics publish notification-created \
  --message '{"notificationId":"test123"}'
```

### Cloud Storage (Opcional)

Para uploads de arquivos:

```bash
# Crie bucket
gsutil mb gs://vibe-uploads

# Configure permissões
gsutil iam ch \
  serviceAccount:vibe-app@project.iam.gserviceaccount.com:objectCreator,objectViewer \
  gs://vibe-uploads
```

## Containerização

### Dockerfile

**Backend Dockerfile:**

```dockerfile
# backend/Dockerfile
FROM oven/bun:latest as builder

WORKDIR /app

# Copie arquivos
COPY . .

# Instale e faça build
RUN bun install --frozen-lockfile
RUN bun run build

# Runtime stage
FROM oven/bun:latest

WORKDIR /app

# Copie arquivos construídos
COPY --from=builder /app/backend/dist ./
COPY --from=builder /app/backend/package.json ./

# Instale apenas dependências de runtime
RUN bun install --production --frozen-lockfile

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD bun run healthcheck || exit 1

# Inicie aplicação
EXPOSE 3000
CMD ["bun", "run", "index.js"]
```

### Build da Imagem Docker

```bash
# Faça build da imagem
docker build -t vibe-backend:latest -f backend/Dockerfile .

# Tag para registry
docker tag vibe-backend:latest gcr.io/your-project/vibe-backend:latest

# Execute localmente
docker run -p 3000:3000 \
  -e MYSQL_HOST=host.docker.internal \
  -e MONGODB_URL=mongodb://host.docker.internal:27017 \
  vibe-backend:latest
```

### Docker Compose para Local

**Stack de desenvolvimento completo:**

```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - '3000:3000'
    environment:
      MYSQL_HOST: mysql
      MONGODB_URL: mongodb://mongodb:27017
      REDIS_URL: redis://redis:6379
    depends_on:
      - mysql
      - mongodb
      - redis

  frontend:
    build: ./frontend
    ports:
      - '5173:5173'
    environment:
      VITE_API_URL: http://localhost:3000
    depends_on:
      - backend

  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: vibe_db
    volumes:
      - mysql_data:/var/lib/mysql

  mongodb:
    image: mongodb:6.0
    volumes:
      - mongodb_data:/data/db

  redis:
    image: redis:7.0

volumes:
  mysql_data:
  mongodb_data:
```

## Terraform (IaC)

**Localização:** `infra/main.tf`

Gerencia infraestrutura do GCP como código:

```hcl
# Configuração do provider
terraform {
  required_version = ">= 1.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

provider "google" {
  project = var.gcp_project
  region  = var.gcp_region
}

# Variáveis
variable "gcp_project" {
  type = string
}

variable "gcp_region" {
  type    = string
  default = "us-central1"
}

# Cloud SQL
resource "google_sql_database_instance" "mysql" {
  name             = "vibe-mysql"
  database_version = "MYSQL_8_0"
  region           = var.gcp_region

  settings {
    tier              = "db-f1-micro"
    availability_type = "REGIONAL"
    backup_configuration {
      enabled  = true
      location = var.gcp_region
    }
  }
}

# Redis
resource "google_redis_instance" "cache" {
  name           = "vibe-redis"
  memory_size_gb = 1
  region         = var.gcp_region
}

# Service Account
resource "google_service_account" "app" {
  account_id   = "vibe-app"
  display_name = "VibeWork Application"
}

# IAM Roles
resource "google_project_iam_member" "pubsub" {
  project = var.gcp_project
  role    = "roles/pubsub.editor"
  member  = "serviceAccount:${google_service_account.app.email}"
}
```

### Comandos Terraform

```bash
cd infra

# Inicialize
terraform init

# Planeje mudanças
terraform plan

# Aplique mudanças
terraform apply

# Destrua recursos
terraform destroy

# Veja estado
terraform show
```

## Configuração de Ambiente

### Desenvolvimento (.env)

```env
NODE_ENV=development
LOG_LEVEL=debug

# MySQL
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=root
MYSQL_DATABASE=vibe_db

# MongoDB
MONGODB_URL=mongodb://localhost:27017/vibe_notifications

# Redis
REDIS_URL=redis://localhost:6379

# Pub/Sub (Emulator)
PUBSUB_EMULATOR_HOST=localhost:8085
GOOGLE_CLOUD_PROJECT=vibe-local

# AWS SES
AWS_REGION=us-east-1
AWS_SES_FROM_ADDRESS=test@example.com
```

### Produção (GCP)

```env
NODE_ENV=production
LOG_LEVEL=warn

# Cloud SQL
MYSQL_HOST=<cloud-sql-ip>
MYSQL_USER=app_user
MYSQL_PASSWORD=<strong-password>
MYSQL_DATABASE=vibe_prod

# MongoDB Atlas
MONGODB_URL=mongodb+srv://user:pass@cluster.mongodb.net/vibe

# Cloud Memorystore
REDIS_URL=redis://<memorystore-ip>:6379

# Cloud Pub/Sub
GOOGLE_CLOUD_PROJECT=your-gcp-project
GOOGLE_APPLICATION_CREDENTIALS=/var/secrets/gcp.json

# AWS SES
AWS_REGION=us-east-1
AWS_SES_FROM_ADDRESS=noreply@yourdomain.com
AWS_ROLE_ARN=arn:aws:iam::account:role/service-role
```

## Monitoramento e Logging

### Monitoramento do GCP

```bash
# Veja logs
gcloud logging read "resource.type=cloud_run_revision" \
  --limit 50 \
  --format json

# Crie política de alerta
gcloud alpha monitoring policies create \
  --notification-channels=CHANNEL_ID \
  --display-name="High Error Rate" \
  --condition-display-name="Error Rate > 5%" \
  --condition-threshold-value=5
```

### Métricas para Monitorar

- **Aplicação**: Taxa de requisição, taxa de erro, latência
- **Banco de dados**: Uso de connection pool, queries lentas
- **Cache**: Taxa de hit, uso de memória
- **Pub/Sub**: Throughput de mensagens, latência de processamento
- **Infraestrutura**: CPU, memória, uso de disco

## Disaster Recovery

### Estratégia de Backup

**MySQL:**

```bash
# Backups automatizados (via Cloud SQL)
# Retenção: 7 dias

# Backup manual
gcloud sql backups create \
  --instance vibe-mysql \
  --description "Pre-deployment backup"
```

**MongoDB Atlas:**

- Backups automáticos: A cada 12 horas
- Retenção: 35 dias
- Restaure para qualquer ponto no tempo

**Pub/Sub:**

- Sem armazenamento persistente (eventos processados imediatamente)
- Implemente logging em nível de aplicação

### Procedimentos de Recuperação

1. **Corrupção de Banco de Dados**:
   - Restaure de backup
   - Verifique integridade de dados
   - Execute verificações de integridade

2. **Interrupção de Serviço**:
   - Verifique status do Cloud Run
   - Revise logs de erro
   - Faça rollback se problema de deployment

3. **Perda de Dados**:
   - Restaure de backup
   - Reprocesse eventos se necessário
   - Notifique usuários se aplicável

## Segurança

### Segurança de Rede

- Use VPC para acesso a banco de dados
- Cloud SQL Auth proxy para conexões seguras
- Regras de firewall para restringir acesso

### Gerenciamento de Secrets

```bash
# Armazene secrets em Secret Manager
gcloud secrets create mysql-password \
  --replication-policy automatic \
  --data-file - <<< "secure_password"

# Acesse em Cloud Run
gcloud run deploy \
  --set-env-vars MYSQL_PASSWORD=projects/PROJECT/secrets/mysql-password/latest
```

### SSL/TLS

- Cloud Load Balancer fornece SSL
- Certificados gerenciados pelo Google
- Auto-renewal ativado

## Otimização de Custo

### Configuração Recomendada

- **Cloud Run**: Pay-as-you-go, auto-scaling
- **Cloud SQL**: Instâncias de CPU compartilhado para cargas pequenas
- **Redis**: Tamanho de instância menor inicialmente
- **Storage**: 5GB de cota incluído grátis

### Redução de Custo

- Use instâncias reservadas para carga previsível
- Implemente cache para reduzir hits de banco de dados
- Monitore e otimize queries
- Limpe recursos não utilizados regularmente

## Próximos Passos

- [Guia de Deployment](./deployment.md) - Procedimentos de deployment
- [Infraestrutura Backend](./backend/infrastructure.md) - Serviços backend
- [Começando](./getting-started.md) - Setup local

---

**Última Atualização**: Dezembro 2024
