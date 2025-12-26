# Guia de Contribuição

Diretrizes para contribuir ao VibeWork.

## Começando

1. Faça um fork do repositório
2. Clone seu fork
3. Crie uma branch de feature: `git checkout -b feature/minha-feature`
4. Faça as mudanças
5. Execute testes e linting
6. Faça commit com mensagem de conventional commit
7. Faça push e crie um pull request

## Fluxo de Desenvolvimento

### Criar Branch de Feature

```bash
git checkout -b feature/add-notifications
# ou
git checkout -b fix/auth-bug
# ou
git checkout -b docs/update-readme
```

**Convenção de nomes:**

- `feature/` - Novas features
- `fix/` - Correções de bugs
- `docs/` - Documentação
- `refactor/` - Refatoração de código
- `perf/` - Melhorias de performance
- `test/` - Adição de testes
- `chore/` - Build, dependências, etc.

### Fazer Mudanças

Siga a estrutura e convenções do projeto:

- Crie arquivos nos diretórios apropriados
- Siga as convenções de nomes (PascalCase para componentes, camelCase para utilitários)
- Adicione testes junto ao código
- Atualize a documentação se necessário

### Testar Localmente

Antes de fazer commit, verifique se tudo funciona:

```bash
# Testes unitários
bun run test

# Testes de integração
bun run test:integration

# Linting
bun run lint
bun run lint:fix

# Verificação de tipos
bun run typecheck

# Formatação
bun run format

# Testes E2E
bun run test:e2e

# Todas as verificações
bun run lint && bun run typecheck && bun run test && bun run test:integration
```

## Mensagens de Commit

Use o formato de conventional commit:

```
type(scope): subject

body

footer
```

### Tipos

- **feat**: Nova feature
- **fix**: Correção de bug
- **docs**: Documentação
- **style**: Mudanças de estilo de código (formatação, ponto-e-vírgula, etc.)
- **refactor**: Refatoração de código sem feature ou fix
- **perf**: Melhoria de performance
- **test**: Adição ou atualização de teste
- **chore**: Build, dependências, config

### Exemplos

```bash
git commit -m "feat(auth): add two-factor authentication"
git commit -m "fix(notifications): correct email template formatting"
git commit -m "docs(api): update endpoint documentation"
git commit -m "refactor(database): optimize query performance"
git commit -m "test(user-service): add unit tests"
git commit -m "chore: upgrade dependencies"
```

### Com Body

```bash
git commit -m "feat(user): implement email verification

- Add email verification flow
- Create verification token service
- Add email sending via SES

Closes #123"
```

## Estilo de Código

### TypeScript

- Use modo strict
- Tipos explícitos (evite `any`)
- Sem variáveis não utilizadas
- Exporte interfaces

```typescript
// Bom
export interface UserResponse {
  id: string
  email: string
  name: string
}

export async function getUser(id: string): Promise<UserResponse> {
  // implementation
}

// Evite
export async function getUser(id: any): Promise<any> {
  // implementation
}
```

### React Components

- Componentes funcionais com hooks
- Custom hooks para lógica
- Interface de Props
- Exporte tipos

```typescript
// Bom
interface LoginFormProps {
  onSuccess?: () => void
  loading?: boolean
}

export const LoginForm = ({ onSuccess, loading }: LoginFormProps) => {
  // implementation
}

// Evite
export const LoginForm = (props: any) => {
  // implementation
}
```

### Organização de Arquivos

```
feature/
├── Component.tsx       # Componente
├── Component.module.css # Estilos
├── hooks.ts           # Custom hooks
├── types.ts           # Definições de tipos
├── index.ts           # Barrel export
└── __tests__/         # Testes
```

## Requisitos de Testes

### Cobertura de Testes

- **Mínimo**: 80% de cobertura
- **Caminhos críticos**: 100% de cobertura
- **Código novo**: Deve ter testes

```bash
bun run test:coverage
# Verifique coverage/index.html
```

### Estrutura de Testes

```typescript
// Bom: Arrange-Act-Assert
describe('LoginForm', () => {
  it('should submit with valid credentials', async () => {
    // Arrange
    const mockOnSuccess = vi.fn()
    const { getByRole } = render(
      <LoginForm onSuccess={mockOnSuccess} />
    )

    // Act
    const emailInput = getByRole('textbox', { name: /email/i })
    const submitButton = getByRole('button', { name: /login/i })
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.click(submitButton)

    // Assert
    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled()
    })
  })
})
```

## Processo de Pull Request

### Antes de Criar PR

1. Certifique-se de que todos os testes passem
2. Certifique-se de que não há erros de linting
3. Certifique-se de que os tipos estão corretos
4. Atualize a documentação se necessário
5. Adicione entrada ao changelog se aplicável

### Template de Descrição PR

```markdown
## Description

Breve descrição das mudanças

## Tipo de Mudança

- [ ] Correção de bug
- [ ] Nova feature
- [ ] Mudança quebrada
- [ ] Atualização de documentação

## Checklist

- [ ] Testes passam (`bun run test`)
- [ ] Sem erros de tipo (`bun run typecheck`)
- [ ] Sem erros de linting (`bun run lint`)
- [ ] Código formatado (`bun run format`)
- [ ] Testes adicionados/atualizados
- [ ] Documentação atualizada
- [ ] Mensagens de commit seguem a convenção

## Problemas Relacionados

Closes #123

## Screenshots (se aplicável)

[Adicione screenshots para mudanças de UI]
```

### Processo de Code Review

1. Verificações automatizadas (testes, linting, tipos)
2. Code review por mantenedores
3. Endereçar feedback
4. Aprovação e merge

### Checklist de Code Review

Revisores verificam:

- Correção do código
- Cobertura de testes
- Documentação
- Impacto de performance
- Implicações de segurança
- Mudanças que quebram compatibilidade

## Documentação

### Escrever Documentação

1. Use linguagem clara e concisa
2. Inclua exemplos de código
3. Explique "por quê" não apenas "como"
4. Mantenha atualizado com mudanças de código

### Arquivos de Documentação

- **CLAUDE.md**: Documentação específica do projeto
- **README.md**: Guia de começar
- **docs/**: Guias abrangentes
- **Comentários inline**: Apenas lógica complexa

## Problemas e Discussões

### Reportar Problemas

Ao reportar um bug:

1. Título claro
2. Descrição do problema
3. Passos para reproduzir
4. Comportamento esperado
5. Comportamento atual
6. Informações de ambiente

Exemplo:

```markdown
## Bug: Login falha com caracteres especiais em senha

### Description

Usuários não conseguem fazer login quando a senha contém caracteres especiais como @, #, $.

### Steps to Reproduce

1. Vá para a página de signup
2. Digite a senha: `test@#$`
3. Clique em submit
4. Receba mensagem de erro

### Expected

Deve fazer login com sucesso

### Actual

Erro: "Invalid password"

### Environment

- OS: macOS 14.0
- Browser: Chrome 120
- Backend: localhost:3000
```

## Diretrizes de Performance

### Frontend

- Mantenha componentes focados (200 linhas máximo)
- Memoize computações caras
- Lazy load rotas não críticas
- Otimize imagens
- Monitore tamanho do bundle

### Backend

- Adicione índices de banco de dados para queries
- Cache operações caras
- Implemente paginação
- Monitore performance de queries
- Use connection pooling

## Diretrizes de Segurança

### Faça's

- ✅ Valide todas as entradas
- ✅ Faça hash de senhas
- ✅ Use HTTPS
- ✅ Mantenha dependências atualizadas
- ✅ Use variáveis de ambiente para secrets
- ✅ Sanitize conteúdo do usuário
- ✅ Use prepared statements

### Não Faça's

- ❌ Armazene senhas em texto plano
- ❌ Exponha dados sensíveis em logs
- ❌ Faça commit de credenciais
- ❌ Use `eval()` ou similar
- ❌ Confie em entrada do usuário
- ❌ Pule proteção CSRF
- ❌ Ignore avisos de segurança

## Atualizações de Dependências

### Adicionar Dependências

```bash
# Adicione ao package
bun add <package>
bun add -D <dev-package>

# Teste compatibilidade
bun run test
bun run typecheck

# Faça commit
git add package.json bun.lockb
git commit -m "chore: add <package>"
```

### Atualizar Dependências

```bash
# Verifique pacotes desatualizados
bun update --check

# Atualize tudo
bun update

# Ou atualize específico
bun update <package>

# Execute testes para verificar
bun run test
```

## Comunicação

### Obter Ajuda

- Verifique a documentação primeiro
- Procure problemas existentes
- Pergunte em discussões
- Abra um problema se necessário

### Discussões

Use discussões para:

- Decisões de design
- Ideias de features
- Perguntas
- Feedback geral

## Código de Conduta

Estamos comprometidos em fornecer um ambiente acolhedor e inclusivo.

- Trate todos com respeito
- Bem-vindo perspectivas diversas
- Seja construtivo em crítica
- Reporte assédio ou comportamento inaceitável

## Licença

Ao contribuir, você concorda que suas contribuições serão licenciadas sob a mesma licença do projeto.

## Reconhecimento

Contribuidores serão reconhecidos em:

- Arquivo CONTRIBUTORS.md
- Página de contribuidores do GitHub
- Notas de lançamento (se aplicável)

---

**Última Atualização**: Dezembro 2024
