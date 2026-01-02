# Gerar Arquitetura

## Input opcional: $ARGUMENTS

Gera um documento de arquitetura completo, definindo COMO o produto será construído tecnicamente.

> **Contexto:** O ARQUITETURA.md transforma requisitos do PRD em decisões técnicas. Define stack, padrões, estrutura de código e ADRs (Architecture Decision Records) - otimizado para context engineering com IA.

---

## ⚠️ REGRAS CRÍTICAS - LEIA ANTES DE COMEÇAR

### 1. PESQUISA DE VERSÕES E SEGURANÇA ANTES DE GERAR (OBRIGATÓRIO)

```
NUNCA gere documentos de arquitetura sem antes:

1. Usar WebSearch para pesquisar versões atuais de CADA tecnologia
2. Verificar compatibilidade entre as bibliotecas escolhidas
3. 🔒 PESQUISAR CVEs E VULNERABILIDADES para CADA biblioteca/versão
4. 🔒 REJEITAR versões com CVE Critical (9.0+) ou High (7.0+) não corrigidos
5. Apresentar matriz de versões + status de segurança ao usuário

Isso evita conflitos de dependência E garante stack SEGURA.
```

**NUNCA** assuma versões. **SEMPRE** pesquise, valide compatibilidade E verifique segurança.

> **🔒 SEGURANÇA É INEGOCIÁVEL:** A pesquisa de vulnerabilidades (CVEs) é tão importante quanto a pesquisa de versões. Consulte NVD, GitHub Advisories, Snyk e OSV para cada biblioteca core.

### 2. PERGUNTAS COM OPÇÕES NUMERADAS (OBRIGATÓRIO)

```
SEMPRE faça perguntas neste formato:

"Qual linguagem/runtime principal?

1. Python (IA/ML, APIs)
2. TypeScript/Node.js (Full-stack JS)
3. Go (Performance, cloud-native)
4. Outro (descreva)

Digite o número:"
```

**NUNCA** faça perguntas abertas sem opções. O usuário deve poder responder apenas digitando um número.

### 3. OUTPUT MODULAR (OBRIGATÓRIO)

```
SEMPRE gere arquivos SEPARADOS nesta estrutura:

context/ARQUITETURA/
├── _index.md                    # Resumo da arquitetura
├── visao-geral.md               # Diagramas C4
├── stack.md                     # Stack tecnológica
├── padroes.md                   # DDD, Clean Architecture, TDD
├── dominios/
│   ├── {dominio-1-slug}.md      # Um domínio por arquivo
│   └── ...
└── decisoes/
    ├── adr-001-{slug}.md        # Uma ADR por arquivo
    └── ...
```

**NUNCA** gere apenas `context/ARQUITETURA.md`. A estrutura modular é obrigatória para economia de tokens.

---

## PRÉ-REQUISITO

Antes de iniciar, verificar se existe um PRD:
- Buscar em `context/PRD.md`
- Se existir, carregar e usar como contexto
- Se não existir, informar o usuário e sugerir executar `/gerar-prd` primeiro

---

## FASE 1: ENTREVISTA DE ARQUITETURA

### Instruções para o Claude

Conduza uma entrevista interativa para definir a arquitetura. **FAÇA UMA PERGUNTA POR VEZ** e aguarde a resposta antes de prosseguir.

### Fluxo da Entrevista

**REGRAS DA ENTREVISTA:**
1. Faça **APENAS UMA pergunta por mensagem**
2. Aguarde a resposta do usuário antes de prosseguir
3. **Sempre ofereça opções numeradas** quando aplicável
4. O usuário pode responder apenas com o **número da opção**
5. Inclua sempre a opção "Outro" para respostas personalizadas
6. Use dados do PRD.md para sugerir opções contextualizadas
7. Se o usuário fornecer informações extras, aproveite e pule perguntas já respondidas

**FORMATO PADRÃO DE PERGUNTA:**
```
[Pergunta clara e direta]

1. [Opção 1]
2. [Opção 2]
3. [Opção 3]
4. Outro (descreva)

Digite o número ou sua resposta:
```

### Roteiro de Perguntas

```
PERGUNTA 1 - CONTEXTO
"Vamos definir a arquitetura do {nome do projeto}!

[Se existir PRD, mostrar resumo:]
Baseado no PRD:
- Produto: {nome}
- Funcionalidades MVP: {lista resumida}
- Requisitos não-funcionais: {resumo}
- Escala esperada: {usuários/requests}

Isso está correto?

1. Sim, está tudo certo
2. Preciso ajustar algumas coisas
3. Mudou bastante, vou explicar

Digite o número:"

PERGUNTA 2 - TIPO DE APLICAÇÃO
"Que tipo de aplicação é o {nome}?

1. Web App (SPA/SSR)
2. API/Backend Service
3. Mobile App (iOS/Android/Cross-platform)
4. CLI Tool
5. Desktop App
6. Monolito Full-stack
7. Microsserviços
8. Outro (descreva)

Digite o número (pode escolher mais de um, ex: 1,2):"

PERGUNTA 3 - LINGUAGEM E RUNTIME
"Qual linguagem/runtime principal você quer usar?

1. Python (IA/ML, APIs, scripts)
2. TypeScript/Node.js (Full-stack JS, web)
3. Go (Performance, cloud-native)
4. Rust (Performance máxima, segurança)
5. Java/Kotlin (Enterprise, Android)
6. C#/.NET (Enterprise, Microsoft)
7. Outro (descreva)

Digite o número:"

PERGUNTA 4 - FRAMEWORK BACKEND
"Qual framework backend você prefere para {linguagem}?

[Opções dinâmicas baseadas na linguagem escolhida]

Para Python:
1. FastAPI (moderno, async, OpenAPI)
2. Django (full-featured, ORM)
3. Flask (minimalista)
4. Outro

Para TypeScript/Node.js:
1. NestJS (enterprise, estruturado)
2. Express (minimalista)
3. Fastify (performance)
4. Hono (edge-ready)
5. Outro

Para Go:
1. Gin (popular, rápido)
2. Echo (minimalista)
3. Fiber (Express-like)
4. Chi (stdlib-friendly)
5. Outro

Digite o número:"

PERGUNTA 5 - BANCO DE DADOS
"Que tipo de banco de dados o {nome} precisa?

1. PostgreSQL (relacional robusto, JSON)
2. MySQL/MariaDB (relacional tradicional)
3. MongoDB (documentos, flexível)
4. SQLite (simples, embedded)
5. Redis (cache, filas)
6. Supabase/Firebase (BaaS completo)
7. Nenhum (stateless)
8. Outro (descreva)

Digite o número (pode combinar, ex: 1,5 para Postgres + Redis):"

PERGUNTA 6 - AUTENTICAÇÃO
"Como será a autenticação no {nome}?

1. JWT self-hosted
2. OAuth2 (Google, GitHub, etc.)
3. Auth service (Auth0, Clerk, Supabase)
4. API Keys (B2B)
5. Session-based (tradicional)
6. Sem autenticação (público)
7. Outro (descreva)

Digite o número:"

PERGUNTA 7 - INFRAESTRUTURA
"Onde o {nome} vai rodar?

1. PaaS simples (Vercel, Railway, Render)
2. AWS (EC2, ECS, Lambda)
3. GCP (Cloud Run, GKE)
4. Azure
5. Self-hosted (VPS)
6. Serverless (Lambda, Workers)
7. Outro (descreva)

Digite o número:"

PERGUNTA 8 - PADRÕES OPCIONAIS
"O framework já usa DDD + Clean Architecture + TDD (obrigatórios).

Quer adicionar padrões opcionais?

1. CQRS (separar leitura/escrita)
2. Event Sourcing
3. Repository Pattern
4. Nenhum adicional
5. Outro (descreva)

Digite o número (pode escolher mais de um, ex: 1,3):"

PERGUNTA 9 - OBSERVABILIDADE MVP
"O que é essencial de observabilidade pro MVP?

1. Básico (logs estruturados apenas)
2. Moderado (logs + métricas básicas)
3. Completo (logs + métricas + tracing)
4. Enterprise (+ Sentry, alertas, dashboards)
5. Outro (descreva)

Digite o número:"

PERGUNTA 10 - CI/CD
"Como você quer fazer CI/CD?

1. Git push → Deploy automático (Vercel, Railway)
2. GitHub Actions → Build → Deploy
3. GitLab CI/CD
4. Docker Compose (manual)
5. Kubernetes/Helm
6. Outro (descreva)

Digite o número:"

PERGUNTA 11 - RESTRIÇÕES
"Tem alguma restrição técnica que eu deva saber?

1. Não, sem restrições
2. Precisa de free tier / budget limitado
3. Compatibilidade com sistema legado
4. Compliance específico (LGPD, SOC2, etc.)
5. Time já conhece stack específica
6. Outro (descreva)

Digite o número ou descreva:"

PERGUNTA 12 - INFORMAÇÕES ADICIONAIS
"Mais alguma coisa sobre a arquitetura?

1. Não, podemos prosseguir
2. Sim, tenho mais informações (descreva)

Digite o número ou adicione informações:"
```

### Confirmação Final

Após todas as perguntas, apresente um resumo:

```
RESUMO DA ARQUITETURA:
━━━━━━━━━━━━━━━━━━━━━

🏗️ Projeto: {nome}
📦 Tipo: {tipo de aplicação}

💻 STACK:
   • Linguagem: {linguagem}
   • Framework: {framework}
   • Database: {database}
   • Auth: {método}

☁️ INFRAESTRUTURA:
   • Hosting: {onde}
   • CI/CD: {como}
   • Deploy: {método}

📐 PADRÕES:
   • DDD ✅
   • Clean Architecture ✅
   • TDD ✅
   • {outros padrões}

🔍 OBSERVABILIDADE:
   • Logging: {solução}
   • Métricas: {solução}
   • Errors: {solução}

🔗 INTEGRAÇÕES:
   • {integração 1}
   • {integração 2}

Está tudo certo? Posso gerar o documento de arquitetura?
(responda 'sim' para continuar ou me diga o que quer ajustar)
```

---

## FASE 1.5: PESQUISA DE VERSÕES, COMPATIBILIDADE E SEGURANÇA (OBRIGATÓRIO)

### Objetivo

Após a confirmação do usuário, **ANTES de gerar os documentos**, realizar pesquisa web **COMPLETA E RIGOROSA** para:
1. Obter as **versões mais atualizadas e estáveis** de cada biblioteca/framework
2. Verificar **compatibilidade entre dependências**
3. Identificar **combinações problemáticas** conhecidas
4. Documentar **versões mínimas recomendadas**
5. **🔒 VERIFICAR VULNERABILIDADES DE SEGURANÇA** em cada versão específica (CVEs, advisories)
6. **🔒 GARANTIR** que nenhuma versão escolhida tenha vulnerabilidades conhecidas não corrigidas

> **⚠️ SEGURANÇA É INEGOCIÁVEL:** Nenhuma biblioteca deve ser incluída na arquitetura se sua versão tiver vulnerabilidades conhecidas (CVE) sem patch disponível.

### Processo de Pesquisa

**PASSO 1: Listar Tecnologias para Pesquisar**

Baseado nas escolhas do usuário, criar lista de tecnologias:

```
STACK A PESQUISAR:
━━━━━━━━━━━━━━━━━━
• Runtime: {linguagem} {versão?}
• Framework: {framework backend}
• ORM/DB Client: {biblioteca de banco}
• Validação: {biblioteca}
• Testes: {biblioteca}
• Linter/Formatter: {ferramentas}
• {outras bibliotecas essenciais}
```

**PASSO 2: Pesquisar Versões Atuais**

Para cada tecnologia core, usar **WebSearch** para obter:
- Versão estável mais recente
- Versão LTS (se aplicável)
- Data de lançamento
- Compatibilidades declaradas

```
PESQUISAS OBRIGATÓRIAS:
1. "{framework} latest stable version 2025"
2. "{framework} {linguagem} version compatibility"
3. "{biblioteca1} {biblioteca2} compatibility matrix"
4. "{framework} recommended dependencies versions"
```

**PASSO 2.5: 🔒 VERIFICAÇÃO DE SEGURANÇA (OBRIGATÓRIO)**

Para CADA biblioteca/framework identificado, realizar pesquisa de segurança:

```
PESQUISAS DE SEGURANÇA OBRIGATÓRIAS:
1. "{biblioteca} {versão} CVE vulnerabilities"
2. "{biblioteca} security advisory {ano atual}"
3. "{biblioteca} known vulnerabilities"
4. "npm audit {pacote}" ou "pip-audit {pacote}" ou equivalente
5. "{biblioteca} {versão} security issues github"
```

**Fontes de verificação obrigatórias:**
- **NVD (National Vulnerability Database):** https://nvd.nist.gov/
- **GitHub Security Advisories:** Verificar no repositório oficial
- **Snyk Vulnerability DB:** https://snyk.io/vuln/
- **NPM Audit** (para Node.js): `npm audit`
- **PyPI Advisory DB** (para Python): https://github.com/pypa/advisory-database
- **OSV (Open Source Vulnerabilities):** https://osv.dev/

**Critérios de rejeição de versão:**
| Severidade CVE | Ação |
|----------------|------|
| **Critical (9.0-10.0)** | ❌ REJEITAR - buscar versão corrigida ou alternativa |
| **High (7.0-8.9)** | ❌ REJEITAR - buscar versão corrigida |
| **Medium (4.0-6.9)** | ⚠️ AVALIAR - documentar risco, preferir versão corrigida |
| **Low (0.1-3.9)** | ✅ ACEITAR com documentação do risco |

**Para cada vulnerabilidade encontrada, documentar:**
```
VULNERABILIDADE IDENTIFICADA:
• Biblioteca: {nome}
• Versão afetada: {versão}
• CVE ID: {CVE-XXXX-XXXXX}
• Severidade: {Critical/High/Medium/Low} ({score})
• Descrição: {resumo do problema}
• Versão corrigida: {versão com patch}
• Ação tomada: {usar versão X / substituir por Y / aceitar risco}
```

**PASSO 3: Validar Matriz de Compatibilidade**

Verificar compatibilidades críticas:

| Dependência A | Dependência B | Compatível? | Notas |
|---------------|---------------|-------------|-------|
| {framework} v{X} | {ORM} v{Y} | ✅/⚠️/❌ | {observações} |
| {linguagem} v{X} | {framework} v{Y} | ✅/⚠️/❌ | {observações} |
| {biblioteca1} | {biblioteca2} | ✅/⚠️/❌ | {observações} |

**PASSO 4: Resolver Conflitos**

Se encontrar incompatibilidades:
1. Propor versões alternativas compatíveis
2. Sugerir bibliotecas substitutas se necessário
3. Documentar trade-offs de cada opção

**PASSO 5: Apresentar Resultado ao Usuário**

```
📦 VERSÕES PESQUISADAS E VALIDADAS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ STACK COMPATÍVEL E SEGURA IDENTIFICADA:

| Tecnologia | Versão | Tipo | Compatível | 🔒 Seguro |
|------------|--------|------|------------|-----------|
| {linguagem} | {versão} | Runtime | ✅ | ✅ |
| {framework} | {versão} | Backend | ✅ | ✅ |
| {ORM} | {versão} | Database | ✅ | ✅ |
| {validação} | {versão} | Validation | ✅ | ✅ |
| {testes} | {versão} | Testing | ✅ | ✅ |

🔗 COMPATIBILIDADES VERIFICADAS:
• {framework} v{X} ↔ {linguagem} v{Y}: Compatível ✅
• {framework} v{X} ↔ {ORM} v{Z}: Compatível ✅
• {ORM} v{Z} ↔ {DB} v{W}: Compatível ✅

🔒 VERIFICAÇÃO DE SEGURANÇA:
• Total de bibliotecas verificadas: {N}
• CVEs Critical/High encontrados: 0 ✅
• CVEs Medium encontrados: {N} (documentados)
• CVEs Low encontrados: {N} (aceitos)
• Fontes consultadas: NVD, GitHub Advisories, Snyk, OSV

{SE HOUVER VULNERABILIDADES MEDIUM/LOW ACEITAS:}
⚠️ RISCOS ACEITOS (documentados):
• {biblioteca} v{versão}: CVE-XXXX-XXXXX (Medium) - {justificativa}

{SE ALGUMA VERSÃO FOI ALTERADA POR SEGURANÇA:}
🔄 VERSÕES AJUSTADAS POR SEGURANÇA:
• {biblioteca}: v{antiga} → v{nova} (CVE-XXXX-XXXXX corrigido)

⚠️ OBSERVAÇÕES:
• {qualquer nota importante sobre versões}
• {deprecations futuras a considerar}

📅 Data da pesquisa: {data atual}
🔒 Verificação de segurança: Concluída

Posso prosseguir com a geração dos documentos usando estas versões?
(responda 'sim' ou indique ajustes)
```

### Exemplos de Pesquisa por Stack

**Python + FastAPI:**
```
Pesquisar VERSÕES:
1. "FastAPI latest version 2025"
2. "FastAPI Python 3.12 compatibility"
3. "SQLAlchemy 2.0 FastAPI integration"
4. "Pydantic v2 FastAPI compatibility"
5. "pytest asyncio FastAPI recommended versions"

Pesquisar SEGURANÇA 🔒:
6. "FastAPI CVE vulnerabilities 2024 2025"
7. "FastAPI security advisory"
8. "Pydantic v2 security vulnerabilities"
9. "SQLAlchemy 2.0 CVE"
10. "uvicorn security issues"
```

**TypeScript + NestJS:**
```
Pesquisar VERSÕES:
1. "NestJS latest stable version 2025"
2. "NestJS Node.js version compatibility"
3. "TypeORM NestJS version matrix"
4. "NestJS TypeScript version requirements"
5. "Jest NestJS testing versions"

Pesquisar SEGURANÇA 🔒:
6. "NestJS CVE vulnerabilities"
7. "NestJS security advisory 2024 2025"
8. "TypeORM security vulnerabilities"
9. "Node.js 20 LTS security advisories"
10. "express security issues" (se usar express adapter)
```

**Go + Gin:**
```
Pesquisar VERSÕES:
1. "Gin framework latest version 2025"
2. "Gin Go version compatibility"
3. "GORM Gin integration versions"
4. "Go 1.22 Gin compatibility"

Pesquisar SEGURANÇA 🔒:
5. "Gin framework CVE vulnerabilities"
6. "Gin security advisory"
7. "GORM security vulnerabilities"
8. "Go 1.22 security advisories"
```

### Regras da Pesquisa

**Versões:**
1. **SEMPRE** pesquisar antes de gerar documentos
2. **NUNCA** assumir versões sem verificar
3. **PRIORIZAR** versões LTS/estáveis sobre bleeding edge
4. **DOCUMENTAR** fonte das informações de versão
5. **ALERTAR** sobre deprecations conhecidas
6. **VERIFICAR** no mínimo 3 compatibilidades críticas

**Segurança (OBRIGATÓRIO):**
7. **SEMPRE** pesquisar CVEs para CADA biblioteca core
8. **NUNCA** usar versão com CVE Critical ou High não corrigido
9. **DOCUMENTAR** todas as vulnerabilidades encontradas e ações tomadas
10. **CONSULTAR** no mínimo 2 fontes de segurança (NVD + GitHub Advisories ou Snyk)
11. **PREFERIR** versões com patches de segurança recentes
12. **REJEITAR** bibliotecas abandonadas (sem updates > 1 ano) com CVEs pendentes

### Em Caso de Falha na Pesquisa

Se WebSearch falhar ou retornar dados inconclusivos:

```
⚠️ PESQUISA PARCIAL

Não foi possível verificar algumas versões:
• {tecnologia}: {motivo}

Opções:
1. Prosseguir com versões padrão recomendadas (pode haver incompatibilidades)
2. Você informa as versões que deseja usar
3. Tentar pesquisar novamente

Digite o número:
```

---

## FASE 2: GERAÇÃO DO DOCUMENTO

Após confirmação das versões pesquisadas, gerar o documento completo.

### Output (Modular)

Gerar arquivos modulares na estrutura:

```
context/ARQUITETURA/
├── _index.md            # Resumo da arquitetura (~1KB)
├── visao-geral.md       # Diagramas C4, contexto
├── stack.md             # Stack tecnologica completa
├── padroes.md           # DDD, Clean Architecture, TDD
├── dominios/
│   ├── {dominio-1}.md   # Um dominio por arquivo
│   ├── {dominio-2}.md
│   └── ...
└── decisoes/
    ├── adr-001-{slug}.md  # ADRs
    ├── adr-002-{slug}.md
    └── ...
```

**Processo de geracao:**
1. Gerar `_index.md` com resumo (stack, estrutura, ADRs principais)
2. Gerar `visao-geral.md` com diagramas C4 (secoes 2-3 do template)
3. Gerar `stack.md` com secao 4 do template
4. Gerar `padroes.md` com secao 5 do template
5. Para cada bounded context/agregado, gerar `dominios/{slug}.md`
6. Para cada ADR, gerar `decisoes/adr-{N}-{slug}.md`
7. Atualizar `context/MANIFEST.md` com novos arquivos

**Manter compatibilidade:** Tambem gerar `context/ARQUITETURA.md` completo para fallback.

---

## TEMPLATE DO ARQUITETURA.md

```markdown
# Arquitetura: {Nome do Projeto}

**Versão:** 1.0
**Data:** {data}
**Status:** Draft | Em Revisão | Aprovado
**Autor:** {autor}

---

## 1. Visão Geral

### 1.1 Propósito
{Descrição do que este documento cobre e para quem é destinado}

### 1.2 Escopo
{O que está incluído e excluído deste documento}

### 1.3 Contexto do Produto
| Atributo | Valor |
|----------|-------|
| Produto | {nome} |
| Tipo | {web app, API, etc.} |
| Escala inicial | {usuários/requests} |
| Escala em 1 ano | {projeção} |

### 1.4 Requisitos Arquiteturais (do PRD)

| Requisito | Especificação |
|-----------|---------------|
| Performance | {latência, throughput} |
| Disponibilidade | {uptime target} |
| Segurança | {compliance, auth} |
| Escalabilidade | {horizontal/vertical} |

---

## 2. Diagrama de Contexto (C4 - Nível 1)

```
┌─────────────────────────────────────────────────────────────────┐
│                         SISTEMA: {Nome}                          │
│                                                                  │
│  ┌──────────┐       ┌─────────────────┐       ┌──────────┐     │
│  │ Usuário  │──────►│   {Nome do      │◄─────►│ Sistema  │     │
│  │ {tipo}   │       │   Sistema}      │       │ Externo  │     │
│  └──────────┘       └─────────────────┘       └──────────┘     │
│                              │                                   │
│                              ▼                                   │
│                     ┌──────────────┐                            │
│                     │   Database   │                            │
│                     └──────────────┘                            │
└─────────────────────────────────────────────────────────────────┘
```

**Atores:**
- **{Usuário tipo 1}**: {descrição e como interage}
- **{Sistema externo}**: {descrição e propósito da integração}

---

## 3. Diagrama de Containers (C4 - Nível 2)

```
┌────────────────────────────────────────────────────────────────────┐
│                          {Nome do Sistema}                          │
│                                                                     │
│   ┌─────────────┐    ┌─────────────┐    ┌─────────────────────┐   │
│   │   Frontend  │    │   Backend   │    │     Workers         │   │
│   │             │───►│   API       │───►│   (Background)      │   │
│   │ {framework} │    │ {framework} │    │   {se aplicável}    │   │
│   │ {hosting}   │    │ {hosting}   │    │                     │   │
│   └─────────────┘    └──────┬──────┘    └─────────────────────┘   │
│                             │                                      │
│              ┌──────────────┼──────────────┐                      │
│              ▼              ▼              ▼                      │
│      ┌───────────┐   ┌───────────┐   ┌───────────┐              │
│      │ Database  │   │   Cache   │   │  Storage  │              │
│      │ {tipo}    │   │ {tipo}    │   │  {tipo}   │              │
│      └───────────┘   └───────────┘   └───────────┘              │
└────────────────────────────────────────────────────────────────────┘
```

### 3.1 Containers

| Container | Tecnologia | Responsabilidade | Comunicação |
|-----------|------------|------------------|-------------|
| Frontend | {stack} | {função} | HTTPS → Backend |
| Backend API | {stack} | {função} | REST/GraphQL |
| Database | {tipo} | {função} | TCP |
| Cache | {tipo} | {função} | TCP |
| {Outros} | {stack} | {função} | {protocolo} |

---

## 4. Stack Tecnológica

### 4.1 Linguagem e Runtime

| Camada | Tecnologia | Versão | Justificativa |
|--------|------------|--------|---------------|
| Backend | {linguagem} | {versão} | {por que escolheu} |
| Frontend | {linguagem} | {versão} | {por que escolheu} |

### 4.2 Frameworks e Bibliotecas Core

| Categoria | Biblioteca | Versão | Propósito |
|-----------|------------|--------|-----------|
| Web Framework | {nome} | {versão} | {para que} |
| ORM/Database | {nome} | {versão} | {para que} |
| Validação | {nome} | {versão} | {para que} |
| Testes | {nome} | {versão} | {para que} |
| Logging | {nome} | {versão} | {para que} |

### 4.3 Banco de Dados

| Tipo | Tecnologia | Uso | Hosting |
|------|------------|-----|---------|
| Principal | {nome} | {para que} | {onde} |
| Cache | {nome} | {para que} | {onde} |
| {Outro} | {nome} | {para que} | {onde} |

### 4.4 Serviços Externos

| Serviço | Provider | Propósito | Tier |
|---------|----------|-----------|------|
| Auth | {nome} | Autenticação | {free/paid} |
| Storage | {nome} | Arquivos | {free/paid} |
| Email | {nome} | Transacional | {free/paid} |
| {Outro} | {nome} | {função} | {free/paid} |

---

## 5. Arquitetura de Software

### 5.1 Padrões Adotados

| Padrão | Aplicação | Benefício |
|--------|-----------|-----------|
| **DDD** | Todo o domínio | Modelo rico, linguagem ubíqua |
| **Clean Architecture** | Estrutura de camadas | Independência de frameworks |
| **TDD** | Todo código | Qualidade, design emergente |
| {Padrão opcional} | {onde aplica} | {benefício} |

### 5.2 Estrutura de Diretórios (Clean Architecture + DDD)

```
src/
├── domain/                    # 🎯 Regras de negócio puras (0 dependências)
│   ├── entities/              # Entidades do domínio
│   │   ├── __init__.py
│   │   └── {entity}.py
│   ├── value_objects/         # Objetos de valor imutáveis
│   │   ├── __init__.py
│   │   └── {value_object}.py
│   ├── aggregates/            # Agregados (raiz + entidades)
│   │   ├── __init__.py
│   │   └── {aggregate}.py
│   ├── events/                # Eventos de domínio
│   │   ├── __init__.py
│   │   └── {event}.py
│   ├── services/              # Serviços de domínio
│   │   ├── __init__.py
│   │   └── {domain_service}.py
│   ├── repositories/          # Interfaces de repositório (ports)
│   │   ├── __init__.py
│   │   └── i_{entity}_repository.py
│   └── errors/                # Erros tipados do domínio
│       ├── __init__.py
│       └── {domain}_errors.py
│
├── application/               # 📋 Casos de uso (orquestra domínio)
│   ├── use_cases/             # Um arquivo por caso de uso
│   │   ├── __init__.py
│   │   └── {action}_{entity}.py
│   ├── dtos/                  # Data Transfer Objects
│   │   ├── __init__.py
│   │   ├── requests/
│   │   └── responses/
│   ├── interfaces/            # Ports para serviços externos
│   │   ├── __init__.py
│   │   └── i_{service}.py
│   └── services/              # Serviços de aplicação
│       ├── __init__.py
│       └── {app_service}.py
│
├── infrastructure/            # 🔌 Implementações concretas (adapters)
│   ├── repositories/          # Implementa interfaces do domínio
│   │   ├── __init__.py
│   │   └── {database}_{entity}_repository.py
│   ├── external_services/     # Implementa interfaces da aplicação
│   │   ├── __init__.py
│   │   └── {provider}_{service}.py
│   ├── persistence/           # Config de banco, migrations
│   │   ├── __init__.py
│   │   ├── database.py
│   │   └── migrations/
│   └── config/                # Configurações, env vars
│       ├── __init__.py
│       └── settings.py
│
├── presentation/              # 🖥️ Interface com usuário/mundo externo
│   ├── api/                   # REST/GraphQL endpoints
│   │   ├── __init__.py
│   │   ├── routes/
│   │   ├── middleware/
│   │   └── schemas/           # Schemas de request/response
│   ├── cli/                   # Comandos CLI (se aplicável)
│   │   └── __init__.py
│   └── handlers/              # Event handlers (se aplicável)
│       └── __init__.py
│
├── shared/                    # 🔧 Utilitários compartilhados
│   ├── __init__.py
│   ├── result.py              # Result type (Success/Failure)
│   ├── logger.py              # Logging estruturado
│   └── utils/
│
└── main.py                    # Entry point

tests/
├── unit/                      # Testes sem I/O
│   ├── domain/
│   └── application/
├── integration/               # Testes com dependências reais
│   └── infrastructure/
└── e2e/                       # Testes ponta a ponta
    └── api/
```

### 5.3 Fluxo de Dependências

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│   Presentation ──► Application ──► Domain ◄── Infrastructure    │
│                                      ▲                          │
│                                      │                          │
│                         Dependências apontam para DENTRO        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

Regras:
• Domain: ZERO dependências externas (nem framework, nem libs de infra)
• Application: Depende apenas de Domain
• Infrastructure: Implementa interfaces definidas em Domain/Application
• Presentation: Depende de Application, nunca acessa Domain diretamente
```

### 5.4 Modelo de Domínio (DDD)

#### Entidades Principais

| Entidade | Descrição | Aggregate Root |
|----------|-----------|----------------|
| {Entity1} | {descrição} | Sim/Não |
| {Entity2} | {descrição} | Sim/Não |

#### Value Objects

| Value Object | Entidade | Validações |
|--------------|----------|------------|
| {VO1} | {entidade} | {regras} |
| {VO2} | {entidade} | {regras} |

#### Regras de Negócio Invariantes

```
{Entity1}:
  - {invariante 1}
  - {invariante 2}

{Entity2}:
  - {invariante 1}
```

---

## 6. Architecture Decision Records (ADRs)

### ADR-001: {Título da Decisão}

**Status:** Accepted | Proposed | Deprecated | Superseded
**Data:** {data}
**Contexto:** {contexto}

#### Contexto
{Descreva o contexto e o problema que motivou esta decisão}

#### Decisão
{Descreva a decisão tomada}

#### Alternativas Consideradas

| Alternativa | Prós | Contras |
|-------------|------|---------|
| {opção 1} | {prós} | {contras} |
| {opção 2} | {prós} | {contras} |
| **{escolhida}** | **{prós}** | **{contras}** |

#### Consequências

**Positivas:**
- {consequência positiva 1}
- {consequência positiva 2}

**Negativas:**
- {consequência negativa 1}
- {trade-off aceito}

**Neutras:**
- {impacto neutro}

---

### ADR-002: {Título da Decisão}

**Status:** Accepted
**Data:** {data}

#### Contexto
{contexto}

#### Decisão
{decisão}

#### Consequências
{consequências resumidas}

---

[Adicionar ADRs para cada decisão técnica significativa]

---

## 7. Autenticação e Autorização

### 7.1 Método de Autenticação

| Aspecto | Implementação |
|---------|---------------|
| Método | {JWT/OAuth2/Session/etc.} |
| Provider | {self-hosted/Auth0/etc.} |
| Token Storage | {httpOnly cookie/localStorage/etc.} |
| Token Lifetime | Access: {tempo}, Refresh: {tempo} |

### 7.2 Fluxo de Autenticação

```
┌────────┐     ┌─────────┐     ┌──────────┐     ┌──────────┐
│ Client │────►│ API     │────►│ Auth     │────►│ Database │
│        │     │ Gateway │     │ Service  │     │          │
└────────┘     └─────────┘     └──────────┘     └──────────┘
    │               │               │               │
    │  1. Login     │               │               │
    │──────────────►│               │               │
    │               │  2. Validate  │               │
    │               │──────────────►│               │
    │               │               │  3. Check     │
    │               │               │──────────────►│
    │               │               │◄──────────────│
    │               │◄──────────────│               │
    │  4. Token     │               │               │
    │◄──────────────│               │               │
```

### 7.3 Modelo de Autorização

| Recurso | Permissões | Roles |
|---------|------------|-------|
| {recurso} | read, write, delete | {roles} |
| {recurso} | read | {roles} |

---

## 8. API Design

### 8.1 Estilo

| Aspecto | Escolha |
|---------|---------|
| Estilo | REST | GraphQL | gRPC |
| Versionamento | URL (/v1/) | Header | Query param |
| Formato | JSON | Protocol Buffers |
| Documentação | OpenAPI/Swagger | GraphQL Playground |

### 8.2 Convenções de Endpoint (REST)

```
# Recursos
GET    /api/v1/{resources}          # Listar
GET    /api/v1/{resources}/{id}     # Obter um
POST   /api/v1/{resources}          # Criar
PUT    /api/v1/{resources}/{id}     # Atualizar completo
PATCH  /api/v1/{resources}/{id}     # Atualizar parcial
DELETE /api/v1/{resources}/{id}     # Remover

# Ações especiais
POST   /api/v1/{resources}/{id}/{action}

# Filtros e paginação
GET    /api/v1/{resources}?page=1&limit=20&sort=-created_at&filter[status]=active
```

### 8.3 Formato de Resposta

```json
// Sucesso
{
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100
  }
}

// Erro
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Descrição legível",
    "details": [
      { "field": "email", "message": "Email inválido" }
    ],
    "correlation_id": "uuid-para-debug"
  }
}
```

---

## 9. Observabilidade

### 9.1 Logging

| Aspecto | Implementação |
|---------|---------------|
| Formato | JSON estruturado |
| Níveis | DEBUG, INFO, WARN, ERROR |
| Destino | {stdout, serviço, arquivo} |
| Ferramenta | {biblioteca} |

**Padrão de Log:**
```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "level": "ERROR",
  "service": "{nome}",
  "correlation_id": "uuid",
  "event": "user.creation.failed",
  "message": "Email already exists",
  "context": {
    "user_id": "123",
    "email": "***@domain.com"
  }
}
```

### 9.2 Métricas

| Métrica | Tipo | Descrição |
|---------|------|-----------|
| http_requests_total | Counter | Total de requests por endpoint |
| http_request_duration_seconds | Histogram | Latência por endpoint |
| {custom_metric} | {tipo} | {descrição} |

### 9.3 Health Checks

```
GET /health         # Liveness - aplicação rodando
GET /health/ready   # Readiness - pronto para tráfego

Response:
{
  "status": "healthy",
  "checks": {
    "database": "healthy",
    "cache": "healthy",
    "external_api": "degraded"
  },
  "version": "1.0.0"
}
```

---

## 10. Segurança

### 10.1 Checklist de Segurança

| Controle | Implementação | Status |
|----------|---------------|--------|
| HTTPS everywhere | {como} | ✅/⏳ |
| Input validation | {biblioteca} | ✅/⏳ |
| SQL Injection | ORM/Prepared statements | ✅/⏳ |
| XSS | {sanitização} | ✅/⏳ |
| CSRF | {tokens} | ✅/⏳ |
| Rate limiting | {implementação} | ✅/⏳ |
| Secrets management | {env vars/vault} | ✅/⏳ |
| Dependency scanning | {ferramenta} | ✅/⏳ |

### 10.2 Headers de Segurança

```
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Content-Security-Policy: default-src 'self'
```

---

## 11. CI/CD e Deploy

### 11.1 Pipeline de CI

```yaml
# Representação conceitual
stages:
  - lint:
      - {ferramenta de lint}
      - {formatador}
  - test:
      - unit tests
      - integration tests
      - coverage check (mínimo: 80%)
  - security:
      - dependency scan
      - SAST (se aplicável)
  - build:
      - build application
      - build container (se aplicável)
```

### 11.2 Pipeline de CD

```
┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
│  Push   │───►│ CI Pass │───►│ Deploy  │───►│ Verify  │
│  main   │    │         │    │ Staging │    │ Health  │
└─────────┘    └─────────┘    └────┬────┘    └────┬────┘
                                   │              │
                              ┌────▼────┐    ┌────▼────┐
                              │ Manual  │───►│ Deploy  │
                              │ Approve │    │  Prod   │
                              └─────────┘    └─────────┘
```

### 11.3 Ambientes

| Ambiente | URL | Propósito | Deploy |
|----------|-----|-----------|--------|
| Local | localhost:{port} | Desenvolvimento | Manual |
| Staging | {url} | Testes/QA | Auto (push main) |
| Production | {url} | Produção | Manual approval |

---

## 12. Estratégia de Testes (TDD)

### 12.1 Pirâmide de Testes

```
        /\
       /E2E\        <- Poucos (críticos)
      /──────\
     /Integração\   <- Médio
    /────────────\
   / Unit Tests   \ <- Muitos (base)
  /────────────────\
```

### 12.2 Cobertura por Camada

| Camada | Cobertura Mínima | Tipo |
|--------|------------------|------|
| Domain | 100% | Unit |
| Application | 90% | Unit |
| Infrastructure | 80% | Integration |
| Presentation | E2E críticos | E2E |

### 12.3 Comandos de Teste

```bash
# Unit tests
{comando_unit_tests}

# Integration tests
{comando_integration_tests}

# E2E tests
{comando_e2e_tests}

# Coverage report
{comando_coverage}

# Todos (CI)
{comando_todos_testes}
```

---

## 13. Validação Automatizada (5 Níveis)

### Comandos por Nível

```bash
# Nível 1: Syntax & Style
{comando_lint_format}

# Nível 2: Unit Tests
{comando_unit_tests_com_coverage}

# Nível 3: Integration Tests
{comando_integration}

# Nível 4: E2E Tests
{comando_e2e}

# Nível 5: Architecture Tests
{comando_arch_tests}

# COMANDO COMPLETO (todos os níveis)
{comando_validacao_completa}
```

### Critérios de Aprovação

| Nível | Critério | Obrigatório |
|-------|----------|-------------|
| 1 | Zero erros de lint | Sim |
| 2 | 100% domain, 90% app | Sim |
| 3 | Todos passando | Sim |
| 4 | Happy paths passando | MVP |
| 5 | Sem violações | Sim |

---

## 14. Decisões Pendentes

| # | Decisão | Opções | Deadline | Responsável |
|---|---------|--------|----------|-------------|
| 1 | {decisão pendente} | {opções} | {quando} | {quem} |

---

## 15. Riscos Técnicos

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| {risco técnico 1} | Alta/Média/Baixa | Alto/Médio/Baixo | {como mitigar} |
| {risco técnico 2} | Alta/Média/Baixa | Alto/Médio/Baixo | {como mitigar} |

---

## 16. Glossário Técnico

| Termo | Definição |
|-------|-----------|
| {termo técnico} | {definição no contexto do projeto} |
| {termo do domínio} | {definição} |

---

## Apêndice

### A. Referencias

| Documento | Link |
|-----------|------|
| Pesquisa de Mercado | `context/PESQUISA_MERCADO.md` |
| PRD | `context/PRD.md` |
| Tasks | `context/TASKS.md` |

### B. Links de Documentação

| Tecnologia | Documentação |
|------------|--------------|
| {framework} | {url} |
| {biblioteca} | {url} |

### C. Histórico de Versões

| Versão | Data | Autor | Mudanças |
|--------|------|-------|----------|
| 1.0 | {data} | {autor} | Versão inicial |

---

*Arquitetura gerada pelo Context Engineering Framework*
*Baseado em: C4 Model, arc42, ADRs, Clean Architecture, DDD*
```

---

## PRÓXIMOS PASSOS

Após gerar o documento, informar:

```
Arquitetura gerada com sucesso!

📁 ESTRUTURA MODULAR:
   context/ARQUITETURA/
   ├── _index.md (resumo)
   ├── visao-geral.md (diagramas C4)
   ├── stack.md
   ├── padroes.md
   ├── dominios/
   │   ├── {dominio-1}.md
   │   └── ...
   └── decisoes/
       ├── adr-001-{slug}.md
       └── ...

📄 FALLBACK: context/ARQUITETURA.md (completo)

📊 Economia de contexto: ~85% por tarefa

Proximos passos sugeridos:
1. Adicionar tarefas em context/TASKS.md
2. /generate-prp "descricao da feature" - Gerar PRP diretamente

Validar estrutura:
   /sync-context
```

---

## CHECKLIST DE QUALIDADE

### Entrevista
- [ ] PRD carregado (se existir)
- [ ] Todas as perguntas essenciais respondidas (1-11)
- [ ] Resumo confirmado pelo usuário

### Pesquisa de Versões (FASE 1.5)
- [ ] Todas as tecnologias core pesquisadas via WebSearch
- [ ] Versões estáveis/LTS identificadas para cada biblioteca
- [ ] Matriz de compatibilidade verificada (mínimo 3 pares)
- [ ] Conflitos de dependência identificados e resolvidos
- [ ] Versões finais confirmadas pelo usuário

### 🔒 Verificação de Segurança (FASE 1.5 - OBRIGATÓRIO)
- [ ] CVEs pesquisados para CADA biblioteca core
- [ ] Mínimo 2 fontes de segurança consultadas (NVD, GitHub, Snyk, OSV)
- [ ] ZERO vulnerabilidades Critical ou High não corrigidas
- [ ] Vulnerabilidades Medium documentadas com justificativa
- [ ] Versões ajustadas quando necessário por segurança
- [ ] Relatório de segurança apresentado ao usuário
- [ ] Confirmação do usuário sobre riscos aceitos (se houver)

### Documento
- [ ] Diagrama de contexto (C4 Level 1)
- [ ] Diagrama de containers (C4 Level 2)
- [ ] Stack completa documentada
- [ ] Estrutura de diretórios definida (Clean Architecture)
- [ ] Modelo de domínio (DDD)
- [ ] Pelo menos 2-3 ADRs documentados
- [ ] Autenticação definida
- [ ] API design documentada
- [ ] Observabilidade planejada
- [ ] CI/CD pipeline definido
- [ ] Estratégia de testes (TDD)
- [ ] Comandos de validação (5 níveis)

---

## NOTAS DE EXECUÇÃO

- **Entrevista:** Uma pergunta por vez, sugira opções baseadas em best practices
- **Contexto:** Use dados do PRD quando disponível
- **Pesquisa de Versões:** OBRIGATÓRIO usar WebSearch para cada tecnologia core antes de gerar documentos
- **Compatibilidade:** Verificar dependências cruzadas - ex: FastAPI requer Pydantic v2, SQLAlchemy 2.0 tem breaking changes
- **Versões:** Sempre documentar versões específicas pesquisadas, nunca usar "latest" genérico
- **🔒 SEGURANÇA:** OBRIGATÓRIO pesquisar CVEs para CADA biblioteca - consultar NVD, GitHub Advisories, Snyk
- **🔒 REJEIÇÃO:** NUNCA incluir versões com CVE Critical (9.0+) ou High (7.0+) não corrigidos
- **🔒 DOCUMENTAÇÃO:** Toda vulnerabilidade encontrada DEVE ser documentada com CVE ID, severidade e ação tomada
- **ADRs:** Escreva como se fosse para um desenvolvedor futuro (ou IA)
- **Diagramas:** Use ASCII art para C4, funciona bem em markdown
- **Stack:** Seja específico com versões PESQUISADAS, VERIFICADAS e SEGURAS
- **Comandos:** Todos devem ser copy-paste ready
- **Clean Architecture:** Estrutura obrigatória conforme PILARES.md
- **DDD:** Modelo de domínio obrigatório conforme PILARES.md
- **TDD:** Estratégia de testes obrigatória conforme PILARES.md
