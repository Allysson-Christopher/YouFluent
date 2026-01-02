# Requisitos Nao-Funcionais

---

## Performance

| Requisito | Metrica | Target |
|-----------|---------|--------|
| Tempo de resposta API | P95 latency | < {X}ms |
| Tempo de carregamento | First Contentful Paint | < {X}s |
| Throughput | Requests/segundo | > {X} |

## Escalabilidade

| Metrica | Inicial | Em 6 meses | Em 1 ano |
|---------|---------|------------|----------|
| Usuarios simultaneos | {X} | {X} | {X} |
| Requisicoes/dia | {X} | {X} | {X} |
| Armazenamento | {X} GB | {X} GB | {X} GB |

## Seguranca

| Requisito | Descricao | Obrigatorio |
|-----------|-----------|-------------|
| Autenticacao | {metodo} | Sim |
| Autorizacao | {modelo} | Sim |
| Criptografia | {em transito/repouso} | Sim |
| Compliance | {LGPD, SOC2, etc.} | {Sim/Nao} |

### Checklist de Seguranca

- [ ] HTTPS everywhere
- [ ] Input validation
- [ ] SQL Injection prevention
- [ ] XSS prevention
- [ ] CSRF tokens
- [ ] Rate limiting
- [ ] Secrets em env vars

## Disponibilidade

| Requisito | Target |
|-----------|--------|
| Uptime | {X}% |
| RTO (Recovery Time Objective) | {X} horas |
| RPO (Recovery Point Objective) | {X} horas |

## Acessibilidade

| Requisito | Target |
|-----------|--------|
| WCAG | Nivel {A/AA/AAA} |
| Leitores de tela | {Sim/Nao} |
| Navegacao por teclado | {Sim/Nao} |

## Observabilidade

| Aspecto | Implementacao |
|---------|---------------|
| Logging | {formato, destino} |
| Metricas | {ferramenta} |
| Alertas | {criterios} |
| Tracing | {ferramenta} |

---

*Extraido de: PRD completo*
*Atualizado em: {data}*
