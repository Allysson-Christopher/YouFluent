# Requisitos Nao-Funcionais

---

## Performance

| Requisito | Metrica | Target MVP |
|-----------|---------|------------|
| Tempo de resposta API | P95 latency | < 500ms |
| Busca de transcricao | Tempo total | < 3s |
| Geracao de licao (IA) | Tempo total | < 10s |
| Carregamento inicial | First Contentful Paint | < 2s |

## Escalabilidade

| Metrica | MVP | Em 6 meses | Em 1 ano |
|---------|-----|------------|----------|
| Usuarios simultaneos | 100 | 1.000 | 10.000 |
| Requisicoes/dia | 10.000 | 100.000 | 1.000.000 |
| Transcricoes em cache | 1.000 | 50.000 | 500.000 |
| Armazenamento DB | 1 GB | 10 GB | 100 GB |

## Seguranca

| Requisito | Implementacao | Obrigatorio |
|-----------|---------------|-------------|
| HTTPS | Everywhere | Sim |
| Validacao de input | Zod em todas as APIs | Sim |
| API Keys | Armazenadas em env vars | Sim |
| Rate limiting | Por IP (futuro) | Nao (MVP) |
| Autenticacao | Nenhuma no MVP | Nao |

### Checklist de Seguranca (MVP)

- [x] HTTPS everywhere (Vercel/hosting)
- [x] Input validation com Zod
- [x] Secrets em environment variables
- [ ] Rate limiting (pos-MVP)
- [ ] Autenticacao (pos-MVP)
- [ ] CSRF tokens (pos-MVP)

## Disponibilidade

| Requisito | Target MVP |
|-----------|------------|
| Uptime | 99% |
| RTO | 4 horas |
| RPO | 24 horas |

> **Nota MVP:** Downtime aceitavel durante desenvolvimento ativo.

## Acessibilidade

| Requisito | Target |
|-----------|--------|
| WCAG | Nivel A |
| Leitores de tela | Basico (labels) |
| Navegacao por teclado | Sim |
| Contraste minimo | 4.5:1 |

## Observabilidade

| Aspecto | Implementacao MVP |
|---------|-------------------|
| Logging | Console (JSON estruturado) |
| Metricas | Basicas (Vercel Analytics) |
| Alertas | Nenhum (MVP) |
| Tracing | Nenhum (MVP) |

### Formato de Log

```json
{
  "timestamp": "2026-01-02T10:30:00Z",
  "level": "INFO",
  "service": "youfluent",
  "event": "transcript.fetch.success",
  "videoId": "abc123",
  "duration_ms": 1200
}
```

## Compatibilidade de Browsers

| Browser | Versao Minima |
|---------|---------------|
| Chrome | 111+ |
| Firefox | 128+ |
| Safari | 16.4+ |
| Edge | 111+ |

> **Nota:** Requisito do Tailwind CSS v4

---

*Atualizado em: 2026-01-02*
