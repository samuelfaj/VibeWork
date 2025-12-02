## 💡 AI Agent Prompt: VIBE Code Compliant Hybrid Data Monorepo

### I. Project Overview & Goal

**Role:** Senior Full-Stack and DevOps Architect.

**Objective:** Scaffold a minimal, complete, and production-ready system architecture focusing on **VIBE Code compliance**. The output must be characterized by extreme performance, end-to-end type safety, strict modularity, and comprehensive, multi-layered automated testing.

CRITICAL: Both, frontend and backend must be multi-language.

**Initial Feature:** Implement two foundational modules:
1.  **User Module** (Core Relational Data via MySQL/Drizzle).
2.  **Notification Module** (Core Document Data via MongoDB/Typegoose).

### II. Core Technology Stack (Non-Negotiables)

The agent must use the following stack and ensure full compatibility and optimization:

1.  **Runtime & Framework:** **Bun** Runtime, **ElysiaJS** framework.
2.  **Type Safety & RPC:** **Eden** for E2E Type-Safe RPC.
3.  **Data:** **MySQL** (Drizzle ORM) **AND** **MongoDB** (**Typegoose/Mongoose**).
4.  **Frontend:** **React** + **Vite**, **TanStack Query** (v5).
5.  **Authentication:** **Better-Auth** (configured with the Drizzle adapter).
6.  **DX & Structure:** **Monorepo** managed by **Turborepo** + **Bun Workspaces**.

### III. Repository and Project Structure (Flat Monorepo)

The following flat structure must be created, with all build/test scripts configured in `turbo.json`:

* **`backend`**: Bun + Elysia service.
* **`frontend`**: React + Vite application.
* `packages/contract`: Shared TypeBox schemas for Eden contracts.
* `packages/ui`: Shared component library placeholder.

### IV. Backend & Data Requirements (`backend` directory)

1.  **Modular Monolith:**
    * `backend/modules/users`: Must use **Drizzle ORM** (MySQL).
    * `backend/modules/notifications`: Must use **Typegoose** (MongoDB).
2.  **Drizzle Setup (MySQL):** Configure Drizzle ORM (MySQL dialect) and define the `users` schema.
3.  **Typegoose Setup (MongoDB):** Configure Mongoose/Typegoose and define the `Notification` schema.
4.  **Schema Validation:** All API routes must use **TypeBox** for schema definition.
5.  **Event-Driven:** Configure Redis connection driver (`backend/infra/event_bus.ts`).

### V. Security and Authentication

1.  **Better-Auth Integration:** Integrate **Better-Auth** using the **Drizzle ORM adapter (MySQL)**, setting up protected and public routes (`/signup`, `/users/me`).

### VI. VIBE Code Compliant Testing Strategy

The Monorepo must define scripts and sample files for comprehensive testing at every layer:

1.  **Unit Tests (Vitest):** Provide a sample test file in a `backend/modules/users/core/` folder testing a pure business logic function (e.g., password hashing utility).
2.  **Integration Tests (Vitest + Testcontainers):**
    * Provide a sample test file that spins up **both a MySQL container and a MongoDB container** using **Testcontainers**.
    * This test must verify that the Drizzle and Typegoose connection services are working correctly.
3.  **E2E Tests (Playwright):** Configure **Playwright** in the Monorepo root. Provide a minimal E2E script that:
    * Navigates to the `frontend`.
    * Interacts with the signup form.
    * Verifies a successful response (tests the full stack: Frontend $\rightarrow$ Eden RPC $\rightarrow$ Elysia $\rightarrow$ Better-Auth $\rightarrow$ MySQL).

### VII. VIBE Code Documentation & Quality Gates

1.  **Documentation Files (`CLAUDE.md`):** Create placeholder `CLAUDE.md` files in the following key directories. Each file must summarize the folder's **Purpose, Key Technologies, and Build/Test Instructions.**
    * `./` (Root)
    * `backend/`
    * `frontend/`
    * `packages/contract/`
    * `backend/modules/users/`
2.  **API Documentation:** Ensure the Elysia app is configured with **Swagger/OpenAPI** to generate documentation automatically based on TypeBox schemas.
3.  **Code Quality Gates:** Configure global **ESLint** and **Prettier** settings in the Monorepo and ensure a `lint` script is defined in `turbo.json`.
4.  **DevOps & IaC:** Provide the optimized **Dockerfile** (`backend`) and the skeleton **Terraform** config (`infra/main.tf`) for MySQL, MongoDB, and Redis.

**Final Output Requirement:** The response must be a single, detailed code block containing the recommended file paths and the key content for `turbo.json`, the main `package.json`, and core initialization files, summarizing the entire scaffolding.

1. Qualidade de Código e Portões de Commit (Shift-Left Quality)
Um projeto VIBE não permite que código mal formatado ou com erros básicos chegue ao commit, muito menos ao Pull Request (PR).

Ferramentas: Husky e lint-staged.

Ação: Implementar git hooks que executam automaticamente as verificações de qualidade APENAS nos arquivos alterados (lint-staged) antes de permitir o commit.

Pré-commit: Rodar Prettier (formatação) e ESLint (regras de código).

Pré-push: Rodar o type-check do TypeScript (em todos os packages) e, opcionalmente, os unit tests mais rápidos.

2. Controle Estrito de Cobertura de Testes (Test Coverage Gates)
Testar é bom, mas garantir que o código crítico está testado é VIBE Code.

Prática: Configurar as build scripts do Turborepo e Vitest para impor um limite mínimo de cobertura.

Ação: Incluir um coverage threshold (por exemplo, 80% ou 90%) na configuração do Vitest. A pipeline de CI/CD deve falhar se o código não atingir essa meta, garantindo que novas funcionalidades sejam sempre acompanhadas de testes.

(Isto se aplica tanto ao backend quanto ao frontend).

3. Observabilidade Tática com "Health Check" & "Readiness" Endpoints
Em um ambiente de produção (especialmente com Docker e K8s), o orquestrador (Kubernetes ou ECS) precisa saber se a aplicação está viva e quando ela está pronta para receber tráfego.

Ação: Adicionar ao Elysia (backend):

/healthz (Liveness Probe): Um endpoint simples (HTTP 200 OK) que responde rapidamente, indicando que o processo não travou.

/readyz (Readiness Probe): Um endpoint que verifica o estado das dependências críticas (ex: conexão com MySQL, MongoDB e Redis). Se o banco de dados estiver fora do ar, o readyz retorna erro (ex: 503), e o orquestrador retira a instância do balanceador de carga.

4. Infraestrutura como Código (IaC) com Segurança e Linting
Seus arquivos Terraform são código e precisam da mesma disciplina de qualidade.

Ferramenta: TFLint (Terraform Linter) e Checkov (para segurança IaC).

Ação: Adicionar uma etapa no turbo.json (e na pipeline de CI) chamada infra:lint e infra:security que:

Verifica se o Terraform está formatado corretamente.

Roda o Checkov para garantir que o código IaC não introduza vulnerabilidades (ex: banco de dados exposto à internet, regras de firewall abertas). Isso "shift-left" a segurança da infraestrutura.

5. Release e Versionamento Semântico Automatizado (Predictability)
A release do seu sistema deve ser previsível e a documentação de mudanças (changelog) deve ser automática.

Ferramenta: Conventional Commits e Semantic Release.

Prática:

Enforce Commit Convention: Forçar todos os commits a seguir o padrão fix: (escopo) mensagem, feat: (escopo) mensagem, etc. (ex: feat(users): add 2fa login).

Automação: Configurar o Semantic Release para rodar na branch principal. Ele automaticamente:

Determina o próximo número de versão (Major, Minor ou Patch) baseado nos commits.

Gera o CHANGELOG.md detalhado.

Publica o novo número de versão.