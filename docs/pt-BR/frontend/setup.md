# Guia de Setup do Frontend

Guia completo para setup do ambiente de desenvolvimento do frontend.

## Pré-requisitos

- Bun 1.0+
- Node.js 18+ (opcional, para compatibilidade)
- Um navegador web moderno (Chrome, Firefox, Safari, Edge)
- Backend rodando em http://localhost:3000

## Passo 1: Clonar Repositório

```bash
git clone <repo-url> VibeWork
cd VibeWork
```

## Passo 2: Instalar Dependências

```bash
cd frontend
bun install
```

Isso instala todas as dependências do `package.json`:

- React, React DOM
- Vite
- TypeScript
- Ant Design
- TanStack Query
- Eden RPC
- i18next
- Testing libraries

## Passo 3: Configurar Ambiente

Crie arquivo `.env.local`:

```bash
cp .env.example .env.local
```

### Variáveis de Ambiente

```env
# API Configuration
VITE_API_URL=http://localhost:3000
VITE_API_TIMEOUT=10000

# Application
VITE_ENVIRONMENT=development
VITE_LOG_LEVEL=debug
```

**Variáveis Explicadas:**

| Variável           | Propósito               | Padrão                |
| ------------------ | ----------------------- | --------------------- |
| `VITE_API_URL`     | URL de API do Backend   | http://localhost:3000 |
| `VITE_API_TIMEOUT` | Timeout de request (ms) | 10000                 |
| `VITE_ENVIRONMENT` | Nome do ambiente        | development           |
| `VITE_LOG_LEVEL`   | Nível de logging        | debug                 |

### Configuração de Produção

```env
# Production
VITE_API_URL=https://api.example.com
VITE_ENVIRONMENT=production
VITE_LOG_LEVEL=warn
```

## Passo 4: Iniciar Dev Server

```bash
cd frontend
bun run dev
```

**Saída Esperada:**

```
VITE v5.0.0  ready in 234 ms

➜  Local:   http://localhost:5173/
➜  press h + enter to show help
```

### Acessar a Aplicação

Abra http://localhost:5173 no seu navegador.

## Passo 5: Verificar Setup

### Verificar se Frontend está Rodando

1. Abra http://localhost:5173
2. Você deve ver página de login
3. Sem erros de console

### Verificar Conexão de API

1. Abra DevTools do navegador (F12)
2. Vá para aba Network
3. Tente fazer signup ou login
4. Deve ver requests para http://localhost:3000

### Verificar Conexão com Backend

Se ver erros de CORS ou conexão:

```bash
# Certifique-se de que backend está rodando
curl http://localhost:3000/healthz

# Deve retornar: {"status":"ok"}
```

## Comandos de Desenvolvimento

### Executar Dev Server

```bash
bun run dev
```

Hot reload habilitado - mudanças aparecem imediatamente.

### Build para Produção

```bash
bun run build
```

Cria bundle otimizado no diretório `dist/`.

### Preview do Build de Produção

```bash
bun run preview
```

Serve arquivos construídos localmente para testes antes do deployment.

### Type Checking

```bash
bun run typecheck
```

Executa verificação de tipos TypeScript (sem build).

### Qualidade de Código

**Linting:**

```bash
bun run lint           # Verificar problemas
bun run lint:fix       # Auto-fix de problemas
```

**Formatação:**

```bash
bun run format         # Formatar código
bun run format:check   # Verificar formatação
```

**Tudo de uma vez:**

```bash
bun run lint:fix && bun run format && bun run typecheck
```

## Testes

### Testes Unitários

```bash
bun run test           # Executar uma vez
bun run test:watch     # Modo watch
bun run test:coverage  # Relatório de cobertura
```

### Testes E2E

Do workspace `/e2e`:

```bash
bun run test:e2e              # Headless
bun run test:e2e:headed       # Com navegador
bun run test:e2e:debug        # Modo debug
```

## Debugging

### VS Code Debugging

Crie `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "chrome",
      "request": "launch",
      "name": "Launch Chrome",
      "url": "http://localhost:5173",
      "webRoot": "${workspaceFolder}/frontend/src",
      "sourceMaps": true
    }
  ]
}
```

### Browser DevTools

**React DevTools:**

1. Instale extensão para [Chrome](https://chrome.google.com/webstore) ou [Firefox](https://addons.mozilla.org/firefox/)
2. Abra DevTools (F12)
3. Encontre aba "Components"
4. Inspecione componentes React

**Network Tab:**

1. Abra DevTools (F12)
2. Vá para aba Network
3. Faça requests para ver chamadas de API
4. Verifique dados de resposta e status

**Console:**

1. Abra DevTools (F12)
2. Vá para aba Console
3. Verifique erros e warnings
4. Execute comandos JavaScript

### Logging

Habilite debug logging:

```typescript
// Em componentes
console.log('Debug info:', data)

// Ou use localStorage
localStorage.debug = 'vibe:*'
```

## Setup de IDE

### VS Code

**Extensões Recomendadas:**

- ESLint
- Prettier - Code formatter
- Vite
- Tailwind CSS IntelliSense (opcional)

**Settings** (`.vscode/settings.json`):

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "search.exclude": {
    "**/node_modules": true,
    "**/dist": true
  }
}
```

### WebStorm/IntelliJ IDEA

1. Abra projeto
2. Configure Node interpreter (Bun)
3. Setup de run configuration:
   - Working directory: `frontend/`
   - Script: `dev`

## Problemas Comuns e Soluções

### Porta Já em Uso

```bash
# Encontre processo usando porta 5173
lsof -i :5173

# Mate o processo
kill -9 <PID>

# Ou use porta diferente
VITE_PORT=5174 bun run dev
```

### Module Not Found

```bash
# Limpe cache e reinstale
rm -rf node_modules bun.lockb
bun install

# Ou use fresh install flag
bun install --force
```

### Erros de Conexão de API

**Erro de CORS:**

```
Access to XMLHttpRequest at 'http://localhost:3000/...'
from origin 'http://localhost:5173' has been blocked by CORS policy
```

**Solução:**

1. Certifique-se de que backend está rodando
2. Verifique se `VITE_API_URL` está correto
3. Verifique configuração de CORS do backend

**Erro de Timeout:**

```
Fetch timeout
```

**Solução:**

1. Verifique se backend está respondendo: `curl http://localhost:3000/healthz`
2. Aumente timeout: `VITE_API_TIMEOUT=20000`
3. Verifique rede para respostas lentas

### Erros de Tipo

```bash
# Ejecute verificação de tipos
bun run typecheck

# Procure por erros
# Corrija erros em arquivos afetados
# Re-execute typecheck
```

### Erros de Build

```bash
# Clean build
bun run clean
bun run build

# Verifique output
ls -la dist/

# Verifique se não há erros
# Tente preview
bun run preview
```

## Checklist de Arquivo de Ambiente

- [ ] Arquivo `.env.local` criado
- [ ] `VITE_API_URL` configurado corretamente
- [ ] Backend está rodando
- [ ] Sem erros de TypeScript (`bun run typecheck`)
- [ ] Dev server inicia sem erros
- [ ] Pode acessar http://localhost:5173
- [ ] Pode ver requests de API em Network tab

## Checklist de Troubleshooting

- [ ] Bun instalado e atualizado
- [ ] Dependências instaladas (`node_modules/` existe)
- [ ] Arquivo `.env.local` configurado
- [ ] Backend rodando em http://localhost:3000
- [ ] Sem conflitos de porta (5173)
- [ ] Sem erros de TypeScript
- [ ] Sem erros de CORS em console
- [ ] Pode fazer signup/login com sucesso

## Estrutura de Arquivo do Projeto

```
frontend/
├── src/
│   ├── main.tsx          # Ponto de entrada
│   ├── App.tsx           # Componente raiz
│   ├── features/         # Módulos de feature
│   ├── lib/              # Utilitários (api, query, etc.)
│   ├── i18n/             # Traduções
│   └── __tests__/        # Testes
├── public/               # Arquivos estáticos
├── index.html            # Template HTML
├── vite.config.ts        # Configuração Vite
├── tsconfig.json         # Configuração TypeScript
├── playwright.config.ts  # Configuração de testes E2E
├── package.json          # Dependências
└── .env.example          # Arquivo de env de exemplo
```

## Checklist de Primeira Execução

1. ✅ Clonar repositório
2. ✅ `cd frontend`
3. ✅ `bun install`
4. ✅ Criar `.env.local`
5. ✅ `bun run dev`
6. ✅ Abrir http://localhost:5173
7. ✅ Verificar conexão de API
8. ✅ Tente fazer signup
9. ✅ Verifique console para erros
10. ✅ Comece a desenvolver!

## Próximos Passos

1. **Entender Componentes**: Leia [Guia de Componentes](./components.md)
2. **Aprender Gerenciamento de Estado**: Leia [Guia de Gerenciamento de Estado](./state-management.md)
3. **Explorar Integração de API**: Revise `src/lib/api.ts`
4. **Aprenda i18n**: Leia [Guia de Internacionalização](./internationalization.md)
5. **Execute Testes**: `bun run test`
6. **Faça uma Mudança**: Modifique um componente e veja hot reload
7. **Commit Mudanças**: Siga [Guia de Contribuição](../contributing.md)

## Obtendo Ajuda

- Verifique console do navegador para erros (F12)
- Revise seção [Debugging](#debugging)
- Verifique [Problemas Comuns](#problemas-comuns-e-soluções)
- Revise código-fonte do componente em `src/features/`
- Leia arquivos de teste para exemplos de uso
- Verifique [Visão Geral de Arquitetura](../architecture.md)

---

**Última Atualização**: Dezembro 2024
