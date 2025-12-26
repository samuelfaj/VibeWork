# Guia de Deployment

Guia para fazer deployment do VibeWork em ambientes de produção.

## Visão Geral de Deployment

```
Development → Staging → Production
   (local)    (testing)  (public)
```

## Checklist Pré-Deployment

### Qualidade de Código

- [ ] Todos os testes passando (`bun run test`)
- [ ] Sem erros de TypeScript (`bun run typecheck`)
- [ ] Linting passou (`bun run lint`)
- [ ] Código formatado (`bun run format`)

### Testes

- [ ] Testes unitários: 80%+ de cobertura
- [ ] Testes de integração passando
- [ ] Testes E2E passando
- [ ] QA manual aprovado

### Documentação

- [ ] README atualizado
- [ ] Mudanças de API documentadas
- [ ] Variáveis de ambiente documentadas
- [ ] Notas de deployment adicionadas

### Git

- [ ] Branch revisado e aprovado
- [ ] Merged para main/release branch
- [ ] Versão atualizada (versionamento semântico)
- [ ] CHANGELOG atualizado

## Gerenciamento de Versão

### Versionamento Semântico

Formato: `MAJOR.MINOR.PATCH`

- **MAJOR**: Mudanças que quebram compatibilidade
- **MINOR**: Novas features (backward compatible)
- **PATCH**: Correções de bugs

Exemplo: `1.2.3`

### Versionamento Automatizado com semantic-release

```bash
# Configure em .releaserc.js
{
  "branches": ["main", { "name": "beta", "prerelease": true }],
  "plugins": [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    "@semantic-release/changelog",
    "@semantic-release/npm",
    "@semantic-release/git",
    "@semantic-release/github"
  ]
}
```

### Processo de Release

1. Faça commits com formato de conventional commit
2. Faça push para a branch main
3. semantic-release automaticamente:
   - Analisa commits
   - Atualiza versão
   - Gera changelog
   - Cria release
   - Publica

**Conventional Commits:**

```
feat: Add new feature       → Atualiza MINOR
fix: Fix bug               → Atualiza PATCH
BREAKING CHANGE: ...       → Atualiza MAJOR
```

## Deployment em Staging

Faça deploy em staging antes de produção.

### Ambiente de Staging

- Mesma infraestrutura que produção (escala menor)
- Usa dados de teste
- Permite testes pré-produção
- Pode ser reset se necessário

### Fazer Deploy em Staging

```bash
# Build
bun run build

# Executar testes
bun run test
bun run test:integration
bun run test:e2e

# Deploy em staging
gcloud run deploy vibe-backend-staging \
  --image gcr.io/your-project/vibe-backend:staging \
  --region us-central1 \
  --environment staging
```

### Testes em Staging

- Smoke tests (caminhos críticos)
- Testes de performance
- Testes de carga
- Testes de segurança

## Deployment em Produção

### Build Docker & Push

```bash
# Build imagem Docker
docker build -t vibe-backend:latest -f backend/Dockerfile .

# Tag para registry
docker tag vibe-backend:latest \
  gcr.io/your-project/vibe-backend:latest

# Push para Container Registry
docker push gcr.io/your-project/vibe-backend:latest

# Opcional: Tag com versão
docker tag vibe-backend:latest \
  gcr.io/your-project/vibe-backend:v1.2.3
```

### Deployment Cloud Run

```bash
# Deploy com variáveis de ambiente
gcloud run deploy vibe-backend \
  --image gcr.io/your-project/vibe-backend:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --timeout 60 \
  --max-instances 100 \
  --min-instances 1 \
  --set-env-vars \
    NODE_ENV=production,\
    MYSQL_HOST=$MYSQL_HOST,\
    MYSQL_USER=$MYSQL_USER,\
    MYSQL_PASSWORD=$MYSQL_PASSWORD,\
    MONGODB_URL=$MONGODB_URL,\
    REDIS_URL=$REDIS_URL,\
    GOOGLE_CLOUD_PROJECT=$GCP_PROJECT,\
    AWS_REGION=us-east-1,\
    AWS_SES_FROM_ADDRESS=$SES_FROM
```

### Deployment Frontend

```bash
# Build frontend
cd frontend
bun run build
# Cria dist/

# Deploy em Cloud Storage + CDN
gsutil -m cp -r dist/* gs://vibe-cdn/

# Ou deploy em Cloud Run (servir arquivos estáticos)
docker build -t vibe-frontend:latest -f frontend/Dockerfile .
docker push gcr.io/your-project/vibe-frontend:latest

gcloud run deploy vibe-frontend \
  --image gcr.io/your-project/vibe-frontend:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

### Migrações de Banco de Dados

```bash
# Execute migrações antes do deployment
cd backend

# Conecte ao banco de dados de produção
gcloud sql connect vibe-mysql --user root

# Execute migrações
bun run db:migrate

# Verifique
bun run db:export-schema
```

## Monitorar Deployment

### Verificar Status de Deployment

```bash
# Ver serviço Cloud Run
gcloud run services describe vibe-backend \
  --platform managed \
  --region us-central1

# Ver logs recentes
gcloud logging read \
  "resource.type=cloud_run_revision AND resource.labels.service_name=vibe-backend" \
  --limit 100 \
  --format json

# Ver métricas
gcloud monitoring time-series list \
  --filter='metric.type="run.googleapis.com/request_count"'
```

### Health Checks

```bash
# Verificação de liveness
curl https://vibe-backend-xxx.run.app/healthz

# Verificação de readiness
curl https://vibe-backend-xxx.run.app/readyz

# Resposta deve incluir todos os serviços OK
```

### Rastreamento de Erros

- Monitore logs de erro
- Verifique rastreamento de exceções (Sentry, etc.)
- Revise métricas de performance
- Verifique conexões de banco de dados

## Procedimentos de Rollback

### Fazer Rollback para Versão Anterior

```bash
# Ver revisões
gcloud run revisions list --service vibe-backend

# Fazer rollback para revisão anterior
gcloud run deploy vibe-backend \
  --image gcr.io/your-project/vibe-backend:v1.2.2 \
  --region us-central1

# Ou rotear tráfego para revisão específica
gcloud run services update vibe-backend \
  --update-traffic previous-revision=100 \
  --region us-central1
```

### Rollback de Banco de Dados

```bash
# Para migrações, crie migrações de rollback
# Exemplo: script de down migration

bun run db:rollback

# Ou restaure de backup
gcloud sql backups restore BACKUP_ID \
  --backup-instance vibe-mysql
```

## Deployment com Zero Downtime

### Gradual Traffic Shift

```bash
# Deploy nova versão
gcloud run deploy vibe-backend \
  --image gcr.io/your-project/vibe-backend:v1.3.0 \
  --region us-central1 \
  --no-traffic

# Rotear 10% do tráfego para nova versão
gcloud run services update vibe-backend \
  --update-traffic new-revision=10,stable-revision=90 \
  --region us-central1

# Monitore erros e métricas

# Se OK, aumente para 50%
gcloud run services update vibe-backend \
  --update-traffic new-revision=50,stable-revision=50 \
  --region us-central1

# Finalmente mude para 100%
gcloud run services update vibe-backend \
  --update-traffic new-revision=100 \
  --region us-central1
```

### Otimização de Health Check

```hcl
# terraform/main.tf
resource "google_cloud_run_service" "backend" {
  # ... outras configs ...

  # Configure instâncias mínimas para evitar cold starts
  template {
    spec {
      container_concurrency = 50
      service_account_name  = google_service_account.app.email
    }
  }
}
```

## Pós-Deployment

### Verificação

- [ ] Health checks passando
- [ ] Endpoints de API respondendo
- [ ] Conexões de banco de dados funcionando
- [ ] Mensagens de Pub/Sub fluindo
- [ ] Emails sendo enviados
- [ ] Sem picos de erro em logs
- [ ] Métricas de performance normais
- [ ] Sem relatórios de problemas de usuários

### Anúncio

```markdown
# Atualização de Deployment

Versão: v1.2.3
Data: 2024-01-15
Ambiente: Produção

## Mudanças

- Adicionado feature X
- Corrigido bug Y
- Melhorada performance Z

## Impacto

- Sem downtime
- Sem migrações de banco de dados necessárias
- Opcional: Sem ação necessária dos usuários

## Plano de Rollback

Pode fazer rollback para v1.2.2 se problemas críticos forem encontrados
```

## Pipeline CI/CD

### Exemplo GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]
    tags: ['v*']

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: bun run test
      - run: bun run test:integration
      - run: bun run test:e2e

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: docker/build-push-action@v4
        with:
          context: ./backend
          push: true
          tags: gcr.io/your-project/vibe-backend:${{ github.sha }}

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Cloud Run
        run: |
          gcloud run deploy vibe-backend \
            --image gcr.io/your-project/vibe-backend:${{ github.sha }}
```

## Troubleshooting

### Deployment Falhou

```bash
# Verifique logs
gcloud run logs read vibe-backend

# Ver histórico de deployment
gcloud run revisions list --service vibe-backend

# Verifique configuração
gcloud run services describe vibe-backend
```

### Cold Starts

**Solução**: Set minimum instances

```bash
gcloud run services update vibe-backend \
  --min-instances 1
```

### Fora de Memória

**Solução**: Aumente alocação de memória

```bash
gcloud run deploy vibe-backend \
  --memory 1Gi
```

### Problemas de Conexão com Banco de Dados

```bash
# Verifique Cloud SQL Proxy
gcloud sql instances describe vibe-mysql

# Verifique conectividade de rede
gcloud compute networks peering list

# Teste conexão
gcloud sql connect vibe-mysql --user root
```

## Monitoramento em Produção

### Métricas Essenciais

- Taxa de requisição e latência
- Taxa de erro por endpoint
- Performance de query de banco de dados
- Taxa de hit de cache
- Throughput de mensagens de Pub/Sub

### Alerting

Configure alertas para:

- Taxa de erro > 1%
- Tempo de resposta > 1s
- CPU de banco de dados > 80%
- Uso de disco > 90%

### Dashboards

Crie dashboards para:

- Saúde de serviço
- Padrões de tráfego
- Tendências de erro
- Métricas de performance

## Plano de Disaster Recovery

### Objetivos RTO/RPO

- **RTO** (Recovery Time Objective): 1 hora
- **RPO** (Recovery Point Objective): 15 minutos

### Cronograma de Backup

- Banco de dados: A cada 6 horas, retenção 30 dias
- Configuração: A cada deploy
- Logs: Retidos 90 dias

### Resposta a Incidentes

1. **Detectar**: Alertas de monitoramento
2. **Avaliar**: Verifique logs e métricas
3. **Responder**: Faça rollback ou corrija
4. **Verificar**: Health checks passam
5. **Documentar**: Post-mortem

## Próximos Passos

- [Guia de Infraestrutura](./infrastructure.md) - Setup do GCP
- [Monitoramento](#monitoramento-em-produção) - Setup de monitoramento
- [Automação](#pipeline-cicd) - Setup de automação
- [Rollback](#procedimentos-de-rollback) - Saiba como fazer rollback

---

**Última Atualização**: Dezembro 2024
