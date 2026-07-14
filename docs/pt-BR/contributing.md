# Contribuindo

## Fonte da verdade

| Público       | Doc                                                         |
| ------------- | ----------------------------------------------------------- |
| Agentes de IA | **[AGENTS.md](../../AGENTS.md)** (prevalece na arquitetura) |
| Pessoas       | Árvore `docs/pt-BR` (+ [en-US](../en-US/))                  |
| Slices vivos  | [FEATURE_MAP.md](../../FEATURE_MAP.md)                      |

Não crie markdown paralelo de arquitetura que contradiga o `AGENTS.md`.

## Fluxo

1. Branch (ou política acordada na main).
2. Prefira `bun run slice:new <name>` para novos domínios.
3. Contrato → backend → frontend → Playwright.
4. Rode os gates:

```bash
bun run feature:check
# ou slice nomeado:
bun run feature:done <name>
```

5. Abra MR/PR com histórico Conventional Commits.

## Commits

- Idioma: **inglês**
- Formato: [Conventional Commits](https://www.conventionalcommits.org/)  
  Exemplos: `feat:`, `fix:`, `docs:`, `chore:`, `test:`, `refactor:`
- **Nunca** use `--no-verify` para pular hooks.

## Idioma do código e docs

| Ativo                                   | Idioma                         |
| --------------------------------------- | ------------------------------ |
| Identificadores / comentários de código | Inglês                         |
| Strings de UI e API                     | i18n **en**, **pt-BR**, **es** |
| Docs humanas                            | en-US + pt-BR                  |
| AGENTS.md / playbooks de agents         | Inglês                         |

## Checklist i18n

Ao adicionar texto:

1. Chave em `en.json`
2. Mesma chave em `pt-BR.json` e `es.json`
3. `bun run i18n:parity`

## Checklist de PR

- [ ] `bun run feature:check` (ou `feature:done <name>`) verde
- [ ] Sem padrões proibidos (`banlist`)
- [ ] Testes co-localizados e úteis
- [ ] E2E atualizado se for fluxo de usuário
- [ ] Docs só se arquitetura/comportamento mudou

## O que não fazer

- Refactors “de passagem” fora da tarefa
- Mongo novo “por flexibilidade” sem necessidade
- Microsserviços / multi-deploy sem decisão de produto
- Reintroduzir Stagehand ou auth por header
