# Contrato compartilhado

Pacote: `@vibe-code/contract`  
Local: `shared/contract/`

## Propósito

Schemas TypeBox são a **única fonte da verdade** para:

- Validação de request/response no Elysia
- Tipos TypeScript compartilhados entre frontend e backend
- Testes de contrato (`Value.Check`)

## Layout

```
shared/contract/src/
  index.ts
  user.ts
  user.test.ts
  notification.ts
  notification.test.ts
  …
```

## Fluxo

1. Criar/alterar schema em `shared/contract/src/<domain>.ts`.
2. Teste co-localizado `*.test.ts`.
3. Exportar em `index.ts` se necessário.
4. Build: `bun run --filter @vibe-code/contract build`.
5. Ligar rotas do backend + hooks do frontend.
6. Atualizar tipos Eden: `bun run --filter @vibework/backend build:types`.

## Regras

- Contrato **antes** da rota **antes** da UI.
- Schemas explícitos para `body`, `query` e `response`.
- Não contornar o contrato com `as never` em rotas de produto.
