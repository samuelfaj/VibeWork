# Testes

## Camadas

| Camada                                | Ferramenta                     | Quando                                   |
| ------------------------------------- | ------------------------------ | ---------------------------------------- |
| Contrato                              | Vitest + TypeBox `Value.Check` | Mudanças de schema                       |
| Unit (service/controller/route/hooks) | Vitest                         | Sempre na lógica de domínio              |
| Integração                            | Vitest + Testcontainers        | Persistência / fluxos críticos           |
| E2E                                   | **Somente Playwright**         | Fluxos de usuário                        |
| Coverage                              | Vitest coverage                | Thresholds do backend em `feature:check` |

Testes unitários co-localizados: `file.ts` + `file.test.ts`.

Stagehand e outros runners de browser com IA **não** fazem parte deste repositório.

## Comandos

```bash
bun run test
bun run test:integration
bun run test:e2e
bun run test:e2e:playwright

bun run --filter @vibework/backend test:coverage
bun run feature:check
bun run feature:done <name>
```

## E2E (Playwright)

Local: `e2e/playwright/`

| Spec                          | Cobre                        |
| ----------------------------- | ---------------------------- |
| `tests/auth.spec.ts`          | Smoke de signup / signin     |
| `tests/notifications.spec.ts` | Smoke da UI de notifications |
| `fixtures/auth.ts`            | Helpers compartilhados       |

Copie esses specs ao adicionar slice com UI. Prefira `data-testid` + `getByTestId`.

## Gates de agents

| Gate                  | Significado                          |
| --------------------- | ------------------------------------ |
| `banlist`             | Padrões proibidos                    |
| `i18n:parity`         | Paridade de chaves en / pt-BR / es   |
| `feature:check`       | Barra completa de qualidade          |
| `feature:done <name>` | Estrutura do slice + `feature:check` |

**Definition of Done de feature de produto = `feature:done <name>` com exit 0.**

## Mock de module objects

```ts
vi.mock('../services/user.service', () => ({
  UserService: {
    findUserById: (id: string) => mockFindUserById(id),
  },
}))
```

Não invente mocks de classes estáticas para domain services.
