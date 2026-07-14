# Documentação VibeWork - Português (Brasil)

Bem-vindo à documentação completa do VibeWork em português!

## 📚 Navegação Rápida

### Primeiros Passos

- **[Guia de Início](./getting-started.md)** - Configuração do ambiente local
- **[Visão Geral da Arquitetura](./architecture.md)** - Entender o design do sistema

### Documentação de Backend

- **[Guia do Backend](./backend/)** - Documentação completa do backend
  - [Configuração](./backend/setup.md)
  - [Referência da API](./backend/api-reference.md)
  - [Módulos](./backend/modules.md)
  - [Banco de Dados](./backend/database.md)
  - [Infraestrutura](./backend/infrastructure.md)
  - [Testes](./backend/testing.md)

### Documentação de Frontend

- **[Guia do Frontend](./frontend/)** - Documentação completa do frontend
  - [Configuração](./frontend/setup.md)
  - [Componentes](./frontend/components.md)
  - [Gerenciamento de Estado](./frontend/state-management.md)
  - [Internacionalização](./frontend/internationalization.md)
  - [Testes](./frontend/testing.md)

### Pacotes Compartilhados

- **[Contract Package](./shared/contract.md)** - Esquemas TypeBox compartilhados
- **[UI Components](./shared/ui-components.md)** - Componentes UI reutilizáveis

### Infraestrutura e Deploy

- **[Guia de Infraestrutura](./infrastructure.md)** - Serviços, Docker, GCP
- **[Guia de Deploy](./deployment.md)** - Procedimentos de deploy em produção
- **[Guia de Contribuição](./contributing.md)** - Padrões de código e workflow

## 🚀 Visão Geral do Projeto

VibeWork é uma **aplicação production-ready completa** com:

- **Backend**: Monolito modular usando Bun + ElysiaJS com RPC type-safe
- **Frontend**: SPA React com TanStack Query para gerenciamento de estado
- **Type Safety**: Type safety end-to-end via esquemas TypeBox
- **Bancos de Dados**: MySQL (usuários) + MongoDB (notificações) com ORM/ODM
- **Cache**: Redis para otimização de performance
- **Eventos**: Google Cloud Pub/Sub para mensagens assíncronas
- **Email**: Integração com AWS SES
- **Autenticação**: Better-Auth para autenticação segura
- **Internacionalização**: Suporte completo (en, pt-BR)
- **Testes**: Vitest + Testcontainers + Playwright
- **Infraestrutura**: Docker Compose (local) + Terraform (GCP)

## 🛠️ Stack Tecnológico

| Camada           | Tecnologia                 | Propósito                           |
| ---------------- | -------------------------- | ----------------------------------- |
| **Runtime**      | Bun 1.2.8                  | Runtime JavaScript rápido           |
| **Backend**      | ElysiaJS                   | Framework API type-safe             |
| **Frontend**     | React 18 + Vite            | Aplicação de página única           |
| **BD SQL**       | MySQL 8.0 + Drizzle        | Dados de usuário e sessões          |
| **BD Documento** | MongoDB 6.0 + Typegoose    | Armazenamento de notificações       |
| **Cache**        | Redis 7.0                  | Cache de performance                |
| **Eventos**      | Google Cloud Pub/Sub       | Mensagens assíncronas               |
| **Email**        | AWS SES                    | Entrega de emails                   |
| **Autenticação** | Better-Auth                | Autenticação e sessões              |
| **API Client**   | Eden RPC                   | Chamadas API type-safe              |
| **State Mgmt**   | TanStack Query 5           | Gerenciamento de estado do servidor |
| **Monorepo**     | Turborepo + Bun Workspaces | Orquestração de build               |
| **Testes**       | Vitest + Playwright        | Testes unitários e E2E              |
| **i18n**         | i18next                    | Suporte multi-idioma                |

## 📁 Estrutura do Repositório

```
VibeWork/
├── backend/                    # API backend ElysiaJS
│   ├── src/
│   │   ├── app.ts             # Configuração da app
│   │   ├── routes/            # Endpoints da API
│   │   ├── infra/             # Camada de infraestrutura
│   │   └── i18n/              # Traduções
│   ├── modules/
│   │   ├── users/             # Autenticação e usuários
│   │   └── notifications/     # Sistema de notificações
│   └── AGENTS.md              # Documentação do backend
├── frontend/                   # Aplicação React + Vite
│   ├── src/
│   │   ├── features/          # Módulos de features
│   │   ├── lib/               # Utilidades
│   │   └── i18n/              # Traduções
│   └── AGENTS.md              # Documentação do frontend
├── shared/
│   └── contract/              # Esquemas TypeBox compartilhados
├── infra/                     # Terraform IaC (GCP)
├── e2e/                       # Testes Playwright
├── docs/                      # Esta documentação
│   ├── en-US/                 # Documentação em inglês
│   └── pt-BR/                 # Documentação em português
├── docker-compose.yml         # Serviços locais
└── AGENTS.md                  # Documentação raiz
```

## ⚡ Comandos Comuns

```bash
# Desenvolvimento
bun install              # Instalar dependências
docker-compose up -d     # Iniciar serviços locais
bun run db:migrate       # Rodar migrações
bun run dev              # Iniciar servidores de desenvolvimento

# Testes
bun run test             # Rodar testes unitários
bun run test:integration # Rodar testes de integração
bun run test:e2e         # Rodar testes E2E

# Qualidade de Código
bun run lint             # Verificar com ESLint
bun run lint:fix         # Auto-corrigir
bun run typecheck        # Verificar tipos TypeScript
bun run format           # Formatar com Prettier

# Build
bun run build            # Build de todos os pacotes
bun run clean            # Limpar artefatos de build
```

## 🔑 Conceitos Principais

### Arquitetura de Monolito Modular

O backend é organizado como um monolito modular com módulos de features que podem ser extraídos para microsserviços independentemente.

### RPC Type-Safe

O frontend usa o cliente Eden RPC com esquemas TypeBox do pacote contract, fornecendo type safety em tempo de compilação para todas as chamadas de API.

### Arquitetura Event-Driven

Notificações e operações assíncronas usam Google Cloud Pub/Sub com subscribers assíncronos para processamento desacoplado.

### Estratégia de Banco de Dados

- **MySQL**: Dados de usuário, sessões e dados relacionais (via Drizzle ORM)
- **MongoDB**: Notificações e documentos flexíveis (via Typegoose)
- **Redis**: Camada de cache apenas (não fila de mensagens)

## 📖 Documentação Adicional

Cada pacote tem sua própria documentação AGENTS.md com detalhes específicos:

- `AGENTS.md` - Visão geral do backend
- `AGENTS.md` - Visão geral do frontend
- `AGENTS.md` - Autenticação
- `AGENTS.md` - Sistema de notificações
- `AGENTS.md` - Esquemas de contrato

## 🆘 Precisa de Ajuda?

- Confira o [Guia de Início](./getting-started.md) para configuração
- Revise a [Visão Geral da Arquitetura](./architecture.md) para entender o design
- Consulte os guias específicos de [Backend](./backend/) ou [Frontend](./frontend/)
- Verifique os arquivos AGENTS.md em cada pacote para documentação detalhada
- Veja o [Guia de Contribuição](./contributing.md) para convenções de código

---

**Última Atualização**: Dezembro 2024
**Versão da Documentação**: 1.0
**Status do Projeto**: Production-Ready
