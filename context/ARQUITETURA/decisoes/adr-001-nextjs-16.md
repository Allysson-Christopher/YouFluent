# ADR-001: Next.js 16 como Framework Full-Stack

**Status:** Accepted
**Data:** 2026-01-02
**Contexto:** Escolha de framework para YouFluent

---

## Contexto

O YouFluent precisa de um framework que suporte:
- Renderizacao server-side para SEO e performance
- API routes para endpoints backend
- Suporte a TypeScript first-class
- Ecossistema React maduro
- Deploy simplificado

Estamos migrando de um prototipo Flask + HTML para uma stack profissional.

## Decisao

Usar **Next.js 16.1.1+** como framework full-stack unico.

## Alternativas Consideradas

| Alternativa | Pros | Contras |
|-------------|------|---------|
| Next.js 15 | Mais testado | CVEs criticos (CVE-2025-55182) |
| Remix | Nested routes, forms | Ecossistema menor |
| Vite + Express | Mais controle | Mais config, menos integrado |
| **Next.js 16** | **Turbopack, React Compiler, seguro** | **Mais recente (menos battle-tested)** |

## Consequencias

### Positivas

- **Turbopack como padrao**: Build ate 10x mais rapido
- **React Compiler estavel**: Memoizacao automatica
- **Server Components**: Menos JS no cliente
- **Server Actions**: Mutations tipadas sem API routes
- **CVEs do v15 corrigidos**: Stack segura

### Negativas

- Versao mais recente, documentacao ainda catching up
- Alguns plugins/libs podem nao ser compativeis imediatamente
- Turbopack pode ter edge cases nao descobertos

### Neutras

- Continua sendo Next.js, mesma curva de aprendizado
- Migracao futura para v17 deve ser suave

## Notas

- Usar `npx create-next-app@latest` para garantir versao 16+
- Verificar compatibilidade de dependencias antes de adicionar
- Manter flag `--webpack` disponivel como fallback

---

*ADR criada para o Context Engineering Framework*
