# Documentação do Frontend

O frontend VibeWork é uma SPA React moderna construída com Vite. Esta seção cobre desenvolvimento do frontend.

## Navegação Rápida

- **[Setup do Frontend](./setup.md)** - Instalação e configuração
- **[Componentes](./components.md)** - Componentes UI e padrões
- **[Gerenciamento de Estado](./state-management.md)** - Setup TanStack Query
- **[Internacionalização](./internationalization.md)** - Configuração i18n
- **[Testes](./testing.md)** - Testes de componentes e E2E

## Visão Geral

O frontend fornece:

- Interface de autenticação de usuário
- Aplicação web responsiva
- Chamadas de API type-safe
- Suporte multi-idioma
- Atualizações em tempo real via TanStack Query

## Arquitetura

```
frontend/
├── src/
│   ├── main.tsx              # Ponto de entrada da app
│   ├── App.tsx               # Componente raiz
│   ├── features/             # Módulos de feature
│   │   └── auth/             # Autenticação
│   │       ├── LoginForm.tsx
│   │       ├── SignupForm.tsx
│   │       ├── hooks.ts
│   │       └── index.ts
│   ├── lib/                  # Utilitários
│   │   ├── api.ts            # Cliente Eden RPC
│   │   ├── query.ts          # Config TanStack Query
│   │   └── AntdProvider.tsx  # Theme provider
│   ├── i18n/                 # Internacionalização
│   │   ├── index.ts
│   │   └── locales/          # Arquivos de tradução
│   └── __tests__/            # Testes
├── dist/                     # Saída de build
├── public/                   # Arquivos estáticos
├── vite.config.ts            # Config de build
├── playwright.config.ts      # Config de testes E2E
└── CLAUDE.md                 # Documentação original
```

## Stack de Tecnologia

| Tecnologia           | Propósito               |
| -------------------- | ----------------------- |
| **React 18**         | Framework de UI         |
| **Vite**             | Build tool & dev server |
| **TypeScript**       | Type safety             |
| **Ant Design**       | Componentes de UI       |
| **TanStack Query 5** | Server state management |
| **Eden RPC**         | Cliente API type-safe   |
| **i18next**          | Internacionalização     |
| **Vitest**           | Testes unitários        |
| **Playwright**       | Testes E2E              |

## Features Principais

### 1. Chamadas de API Type-Safe

- **Eden RPC**: Validação de tipo em tempo de compilação
- **Contract Schemas**: Compartilhado com backend
- **Auto-completion**: Suporte de IDE
- **Runtime Validation**: Verificação de schema

### 2. Gerenciamento de Estado do Servidor

- **TanStack Query**: Caching automático
- **Background Refetching**: Manter dados frescos
- **Optimistic Updates**: Feedback de UI instantâneo
- **Pagination**: Carregamento eficiente de dados

### 3. Autenticação

- **Session-based**: HTTP-only cookies
- **Protected Routes**: Gating de auth
- **Login/Signup Forms**: Validação built-in
- **User Context**: Estado de auth global

### 4. Suporte Multi-Idioma

- **i18next**: Setup completo de i18n
- **Language Detection**: Auto-detect de idioma do navegador
- **Locale Switching**: Seleção dinâmica de idioma
- **Translation Files**: en, pt-BR

### 5. Design Responsivo

- **Ant Design**: Componentes mobile-first
- **Tailwind CSS**: Styling de utilidade (opcional)
- **Breakpoints**: Mobile, tablet, desktop
- **Accessible**: WCAG compliant

## Tarefas Comuns

### Setup do Ambiente de Desenvolvimento

```bash
cd frontend
bun install
bun run dev
```

Abra http://localhost:5173

### Build para Produção

```bash
bun run build
# Output: dist/
```

### Executar Testes

```bash
bun run test           # Testes unitários
bun run test:watch    # Modo watch
bun run test:coverage # Relatório de cobertura
```

### Executar Testes E2E

```bash
bun run test:e2e      # Headless
bun run test:e2e:headed  # Com navegador
bun run test:e2e:debug   # Modo debug
```

### Qualidade de Código

```bash
bun run lint          # Verificar problemas
bun run lint:fix      # Auto-fix
bun run typecheck     # Verificação de tipos
bun run format        # Formatação de código
```

## Estrutura de Projeto Explicada

### `/src` - Código Fonte

**main.tsx**

- Ponto de entrada Vite
- Render do React DOM
- Setup do QueryClientProvider

**App.tsx**

- Componente raiz
- Definições de rotas
- Wrapper de layout

**`features/`**

- Módulos de feature
- Formulários de login/signup
- Componentes de página
- Hooks para mutations

**`lib/`**

- Cliente de API (Eden RPC)
- Configuração de queries
- Theme provider
- Funções utilitárias

**`i18n/`**

- Configuração do i18next
- Arquivos de tradução
- Detecção de idioma

### `/public` - Arquivos Estáticos

```
public/
├── favicon.ico
├── images/
├── fonts/
└── logo.png
```

## Configuração de Ambiente

### Variáveis de Ambiente do Frontend

```env
VITE_API_URL=http://localhost:3000
VITE_API_TIMEOUT=10000
VITE_ENVIRONMENT=development
```

**Variáveis de tempo de build:**

- Devem ter prefixo `VITE_`
- Disponível via `import.meta.env.VITE_*`
- Incorporadas no bundle durante o build

### Usando Variáveis de Ambiente

```typescript
const API_URL = import.meta.env.VITE_API_URL
const API_TIMEOUT = import.meta.env.VITE_API_TIMEOUT

// Ou acesse todas as vars de env
const env = import.meta.env
```

## Convenções de Estrutura de Arquivo

### Arquivos de Componente

**Nomeação:**

- Componentes: PascalCase (LoginForm.tsx)
- Utilitários: camelCase (apiClient.ts)
- Hooks: camelCase começando com 'use' (useQuery.ts)
- Tipos: .d.ts ou exportado do mesmo arquivo

**Estrutura:**

```typescript
import { ReactNode } from 'react'

interface ComponentProps {
  children: ReactNode
  // Props
}

export const Component = ({ children }: ComponentProps) => {
  return <div>{children}</div>
}
```

### Módulos de Feature

**Padrão:**

```
features/auth/
├── LoginForm.tsx     # Componente
├── SignupForm.tsx    # Componente
├── hooks.ts          # Mutations
├── types.ts          # Definições de tipo
└── index.ts          # Barrel export
```

**Barrel Export:**

```typescript
// features/auth/index.ts
export { LoginForm } from './LoginForm'
export { SignupForm } from './SignupForm'
export * from './hooks'
```

**Uso:**

```typescript
import { LoginForm, useLogin } from '@/features/auth'
```

## Integração de API

### Cliente Eden RPC

```typescript
// lib/api.ts
import { treaty } from '@elysiajs/eden'
import type { App } from '@vibework/backend'

export const client = treaty<App>(import.meta.env.VITE_API_URL || 'http://localhost:3000')
```

**Chamadas Type-Safe:**

```typescript
const response = await client.api.auth['sign-in'].email.post({
  email: 'user@example.com',
  password: 'password123',
})
// TypeScript sabe automaticamente o formato da resposta
```

## Gerenciamento de Estado

### Uso de TanStack Query

```typescript
import { useQuery, useMutation } from '@tanstack/react-query'

// Buscar dados
const { data, isLoading } = useQuery({
  queryKey: ['users', userId],
  queryFn: () => client.api.users[userId].get(),
})

// Mutar dados
const { mutate, isPending } = useMutation({
  mutationFn: (data) => client.api.users.post(data),
  onSuccess: () => {
    // Refetch ou invalide
  },
})
```

## Fluxo de Autenticação

### Processo de Login

```
LoginForm
    ↓
useLogin hook
    ↓
client.api.auth.sign-in.email.post()
    ↓
Backend valida
    ↓
Retorna user + session cookie
    ↓
TanStack Query caches
    ↓
Redireciona para dashboard
```

## Styling

### Tema Ant Design

Customizado em `lib/AntdProvider.tsx`:

```typescript
<ConfigProvider
  theme={{
    token: {
      colorPrimary: '#1890ff',
      fontSize: 14,
      borderRadius: 6
    }
  }}
>
  <App />
</ConfigProvider>
```

## Testes

### Testes Unitários

```bash
bun run test
```

Testa componentes e hooks com Vitest.

### Testes E2E

```bash
bun run test:e2e
```

Testa fluxos de usuário com Playwright no workspace `/e2e`.

## Build e Deployment

### Build de Desenvolvimento

```bash
bun run dev
```

Auto-reload em mudanças de código.

### Build de Produção

```bash
bun run build
```

Cria bundle otimizado em `dist/`.

**Saída de Build:**

```
dist/
├── index.html
├── assets/
│   ├── *.js
│   └── *.css
└── favicon.ico
```

### Preview do Build de Produção

```bash
bun run preview
```

Serve arquivos construídos localmente.

## Otimização de Performance

### Code Splitting

- Automático via Vite
- Splitting baseado em rotas para apps grandes
- Dynamic imports para componentes pesados

### Lazy Loading

```typescript
import { lazy, Suspense } from 'react'

const Dashboard = lazy(() => import('./Dashboard'))

<Suspense fallback={<Loading />}>
  <Dashboard />
</Suspense>
```

### Otimização de Imagem

- Use formato WebP com fallbacks
- Lazy load imagens abaixo do fold
- Sirva imagens responsivas

## Suporte de Navegador

- Chrome/Edge: Últimas 2 versões
- Firefox: Últimas 2 versões
- Safari: Últimas 2 versões
- Mobile: Navegadores modernos (iOS 12+, Android 8+)

## Acessibilidade

### Conformidade WCAG

- **Keyboard Navigation**: Suporte completo de teclado
- **Screen Readers**: HTML semântico + ARIA
- **Color Contrast**: Mínimo WCAG AA
- **Focus Management**: Estados de foco visíveis

### Acessibilidade Ant Design

Componentes Ant Design incluem:

- Labels ARIA
- Navegação de teclado
- Gerenciamento de foco
- Conformidade de contraste de cor

## Browser DevTools

### React DevTools

```bash
# Instale extensão do navegador
# Chrome: React Developer Tools
# Firefox: React Developer Tools

# Inspecione componentes
# Veja props, state, context do componente
```

### Redux/Query DevTools

```typescript
// Em desenvolvimento, TanStack Query inclui DevTools
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

<QueryClientProvider client={queryClient}>
  <App />
  <ReactQueryDevtools initialIsOpen={false} />
</QueryClientProvider>
```

## Setup de Ambiente

### Versões Necessárias

- Node.js 18+
- Bun 1.0+
- React 18+

### Instalação

```bash
# Instale dependências
bun install

# Verifique setup
bun --version
node --version
```

## Referências de Documentação

- **Original**: `frontend/CLAUDE.md`
- **Componentes**: Veja `frontend/src/`
- **Testes**: Veja workspace `e2e/`

## Obtendo Ajuda

- [Frontend Setup](./setup.md) - Configuração de ambiente
- [Guia de Componentes](./components.md) - Componentes de UI
- [Gerenciamento de Estado](./state-management.md) - Busca de dados
- [Internacionalização](./internationalization.md) - Traduções
- [Guia de Testes](./testing.md) - Estratégias de testes
- [Visão Geral de Arquitetura](../architecture.md) - Design do sistema

---

**Última Atualização**: Dezembro 2024
