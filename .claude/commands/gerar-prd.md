# Gerar PRD (Product Requirements Document)

## Input opcional: $ARGUMENTS

Gera um PRD completo a partir da pesquisa de mercado, definindo O QUÊ será construído.

> **Contexto:** O PRD transforma insights de mercado em especificação de produto. Ele define funcionalidades, user stories e critérios de sucesso - mas NÃO define stack técnica (isso vai no ARQUITETURA.md).

---

## ⚠️ REGRAS CRÍTICAS - LEIA ANTES DE COMEÇAR

### 1. PERGUNTAS COM OPÇÕES NUMERADAS (OBRIGATÓRIO)

```
SEMPRE faça perguntas neste formato:

"Qual é o tipo de usuário principal?

1. Consumidor final (B2C)
2. Pequenas empresas (SMB)
3. Empresas médias/grandes (Enterprise)
4. Outro (descreva)

Digite o número:"
```

**NUNCA** faça perguntas abertas sem opções. O usuário deve poder responder apenas digitando um número.

### 2. OUTPUT MODULAR (OBRIGATÓRIO)

```
SEMPRE gere arquivos SEPARADOS nesta estrutura:

context/PRD/
├── _index.md                    # Resumo executivo
├── visao.md                     # Visão e proposta de valor
├── personas.md                  # Personas e jornadas
├── features/
│   ├── {feature-1-slug}.md      # Uma feature por arquivo
│   ├── {feature-2-slug}.md
│   └── ...
└── requisitos-nao-funcionais.md
```

**NUNCA** gere apenas `context/PRD.md`. A estrutura modular é obrigatória para economia de tokens.

---

## PRÉ-REQUISITO

Antes de iniciar, verificar se existe uma pesquisa de mercado:
- Buscar em `context/PESQUISA_MERCADO.md`
- Se existir, carregar e usar como contexto
- Se não existir, informar o usuário e sugerir executar `/fazer-pesquisa-mercado` primeiro

---

## FASE 1: ENTREVISTA DE DEFINIÇÃO DE PRODUTO

### Instruções para o Claude

Conduza uma entrevista interativa para definir o produto. **FAÇA UMA PERGUNTA POR VEZ** e aguarde a resposta antes de prosseguir.

### Fluxo da Entrevista

**REGRAS DA ENTREVISTA:**
1. Faça **APENAS UMA pergunta por mensagem**
2. Aguarde a resposta do usuário antes de prosseguir
3. **Sempre ofereça opções numeradas** quando aplicável
4. O usuário pode responder apenas com o **número da opção**
5. Inclua sempre a opção "Outro" para respostas personalizadas
6. Use dados da PESQUISA_MERCADO.md para sugerir opções contextualizadas
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
"Vamos criar o PRD do {nome do projeto}!

[Se existir pesquisa de mercado, mostrar resumo:]
Baseado na pesquisa de mercado, seu produto:
- Resolve: {problema}
- Para: {público-alvo}
- Diferencial: {diferencial}

Isso ainda está correto?

1. Sim, está tudo certo
2. Preciso ajustar algumas coisas
3. Mudou bastante, vou explicar

Digite o número ou sua resposta:"

PERGUNTA 2 - VISÃO DO PRODUTO
"Qual é a visão de longo prazo do {nome}?

Exemplos:
1. Ser a principal plataforma de {categoria} no Brasil
2. Democratizar o acesso a {solução} para {público}
3. Revolucionar a forma como {público} faz {ação}
4. Outro (descreva sua visão)

Digite o número ou escreva sua visão:"

PERGUNTA 3 - PROPOSTA DE VALOR
"O que torna o {nome} único? Complete:
'{nome} é a única solução que ____________'

1. {sugestão baseada na pesquisa de mercado}
2. {sugestão alternativa}
3. {sugestão alternativa}
4. Outro (descreva)

Digite o número ou sua proposta:"

PERGUNTA 4 - TIPO DE USUÁRIO PRINCIPAL
"Quem é o usuário PRINCIPAL do {nome}?

1. Consumidor final (B2C)
2. Pequenas empresas (SMB)
3. Empresas médias/grandes (Enterprise)
4. Desenvolvedores/Técnicos
5. Outro (descreva)

Digite o número:"

PERGUNTA 5 - PERSONAS
"Descreva 2-3 personas principais.

Para cada uma, me diga:
- Nome/papel (ex: 'Maria, a gestora')
- O que essa pessoa quer alcançar
- Sua maior frustração hoje

(Resposta livre - descreva suas personas)"

PERGUNTA 6 - JORNADA DO USUÁRIO
"Qual é o 'happy path' - o caminho ideal do usuário?

1. Descoberta → Cadastro → Primeira ação → Resultado
2. Indicação → Trial → Uso recorrente → Upgrade
3. Busca orgânica → Landing → Compra → Onboarding
4. Outro (descreva a jornada)

Digite o número ou descreva:"

PERGUNTA 7 - FUNCIONALIDADES CORE (MVP)
"Quais funcionalidades são ESSENCIAIS para o MVP?
Liste de 5 a 10 funcionalidades obrigatórias.

(Resposta livre - liste as funcionalidades, uma por linha)"

PERGUNTA 8 - FUNCIONALIDADES FUTURAS
"Quais funcionalidades são desejáveis mas podem esperar a v2?

(Resposta livre - liste as funcionalidades futuras)"

PERGUNTA 9 - FORA DE ESCOPO
"O que o {nome} NÃO vai fazer? (importante para evitar scope creep)

(Resposta livre - liste o que está fora do escopo)"

PERGUNTA 10 - REQUISITOS DE PERFORMANCE
"Qual nível de performance é necessário?

1. Básico (< 2s resposta, centenas de usuários)
2. Moderado (< 500ms resposta, milhares de usuários)
3. Alto (< 100ms resposta, dezenas de milhares)
4. Crítico (real-time, alta disponibilidade 99.9%+)
5. Outro (especifique)

Digite o número:"

PERGUNTA 11 - REQUISITOS DE SEGURANÇA
"Quais requisitos de segurança se aplicam?

1. Básico (autenticação simples, HTTPS)
2. Dados sensíveis (criptografia, LGPD)
3. Financeiro (PCI-DSS, auditoria)
4. Saúde (HIPAA, dados médicos)
5. Enterprise (SOC2, SSO, audit logs)
6. Outro (especifique)

Digite o número (pode escolher mais de um, ex: 1,2):"

PERGUNTA 12 - NORTH STAR METRIC
"Qual será a métrica principal de sucesso (North Star)?

1. Usuários ativos mensais (MAU)
2. Receita recorrente mensal (MRR)
3. Taxa de conversão
4. NPS / Satisfação
5. Retenção / Churn
6. Outro (especifique)

Digite o número:"

PERGUNTA 13 - RISCOS
"Quais são os maiores riscos para o sucesso do {nome}?

1. Técnico (complexidade, escalabilidade)
2. Mercado (competição, timing)
3. Regulatório (compliance, licenças)
4. Financeiro (custos, monetização)
5. Todos os anteriores
6. Outro (especifique)

Digite o número (pode escolher mais de um, ex: 1,3):"

PERGUNTA 14 - INFORMAÇÕES ADICIONAIS
"Tem mais alguma coisa importante que eu deveria saber?

1. Não, podemos prosseguir
2. Sim, tenho mais informações (descreva)

Digite o número ou adicione informações:"
```

### Confirmação Final

Após todas as perguntas, apresente um resumo:

```
RESUMO DO PRODUTO:
━━━━━━━━━━━━━━━━━━

📛 Produto: {nome}
🎯 Visão: {visão}
💎 Proposta de Valor: {proposta}

👥 PERSONAS:
   • {persona_1}
   • {persona_2}

✅ FUNCIONALIDADES MVP:
   • {func_1}
   • {func_2}
   • ...

⏳ FUNCIONALIDADES FUTURAS:
   • {func_futura_1}
   • ...

🚫 FORA DE ESCOPO:
   • {nao_fazer_1}
   • ...

📊 NORTH STAR: {metrica_principal}

Está tudo certo? Posso gerar o PRD completo?
(responda 'sim' para continuar ou me diga o que quer ajustar)
```

---

## FASE 2: GERAÇÃO DO PRD

Após confirmação, gerar o documento completo.

### Output (Modular)

Gerar arquivos modulares na estrutura:

```
context/PRD/
├── _index.md            # Resumo executivo (~1KB)
├── visao.md             # Visao e proposta de valor
├── personas.md          # Personas e jornadas
├── features/
│   ├── {feature-1}.md   # Uma feature por arquivo
│   ├── {feature-2}.md
│   └── ...
└── requisitos-nao-funcionais.md
```

**Processo de geracao:**
1. Gerar `_index.md` com resumo executivo
2. Gerar `visao.md` com secoes 1.1-1.4 do template
3. Gerar `personas.md` com secao 2 do template
4. Para cada funcionalidade MUST/SHOULD, gerar `features/{slug}.md`
5. Gerar `requisitos-nao-funcionais.md` com secao 5 do template
6. Atualizar `context/MANIFEST.md` com novos arquivos

**Manter compatibilidade:** Tambem gerar `context/PRD.md` completo para fallback.

---

## TEMPLATE DO PRD.md

```markdown
# PRD: {Nome do Produto}

**Versão:** 1.0
**Data:** {data}
**Status:** Draft | Em Revisão | Aprovado
**Autor:** {autor}

---

## 1. Sumário Executivo

### 1.1 Visão do Produto
{Visão de longo prazo em uma frase}

### 1.2 Proposta de Valor
**Para** {segmento de cliente}
**Que** {tem esse problema/necessidade}
**O** {nome do produto}
**É um** {categoria do produto}
**Que** {benefício principal}
**Diferente de** {alternativa principal}
**Nosso produto** {diferencial-chave}

### 1.3 Resumo do Problema
{2-3 parágrafos descrevendo o problema que o produto resolve, baseado na pesquisa de mercado}

### 1.4 Oportunidade de Mercado
| Métrica | Valor | Fonte |
|---------|-------|-------|
| TAM | {valor} | {fonte} |
| SAM | {valor} | {fonte} |
| SOM | {valor} | {fonte} |

---

## 2. Personas & Jornadas

### 2.1 Persona Primária: {Nome}

| Atributo | Descrição |
|----------|-----------|
| **Papel** | {cargo/função} |
| **Idade** | {faixa etária} |
| **Contexto** | {onde trabalha/vive} |
| **Objetivos** | {o que quer alcançar} |
| **Frustrações** | {dores atuais} |
| **Comportamento** | {como busca soluções} |

**Quote representativa:**
> "{Frase que essa persona diria}"

### 2.2 Persona Secundária: {Nome}

| Atributo | Descrição |
|----------|-----------|
| **Papel** | {cargo/função} |
| **Idade** | {faixa etária} |
| **Contexto** | {onde trabalha/vive} |
| **Objetivos** | {o que quer alcançar} |
| **Frustrações** | {dores atuais} |
| **Comportamento** | {como busca soluções} |

### 2.3 Jornada do Usuário (Happy Path)

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ DESCOBERTA  │───►│ ATIVAÇÃO    │───►│ ENGAJAMENTO │───►│ SUCESSO     │
│             │    │             │    │             │    │             │
│ {como       │    │ {primeira   │    │ {uso        │    │ {resultado  │
│  descobre}  │    │  ação}      │    │  recorrente}│    │  obtido}    │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

**Detalhamento:**
1. **Descoberta:** {como o usuário descobre o produto}
2. **Ativação:** {primeira experiência de valor}
3. **Engajamento:** {uso recorrente}
4. **Sucesso:** {resultado final desejado}

---

## 3. Funcionalidades

### 3.1 Priorização MoSCoW

#### MUST HAVE (MVP)
| ID | Funcionalidade | Descrição | Persona |
|----|----------------|-----------|---------|
| F01 | {nome} | {descrição curta} | {persona} |
| F02 | {nome} | {descrição curta} | {persona} |
| F03 | {nome} | {descrição curta} | {persona} |

#### SHOULD HAVE (v1.0)
| ID | Funcionalidade | Descrição | Persona |
|----|----------------|-----------|---------|
| F04 | {nome} | {descrição curta} | {persona} |
| F05 | {nome} | {descrição curta} | {persona} |

#### COULD HAVE (v2.0+)
| ID | Funcionalidade | Descrição | Persona |
|----|----------------|-----------|---------|
| F06 | {nome} | {descrição curta} | {persona} |
| F07 | {nome} | {descrição curta} | {persona} |

#### WON'T HAVE (Fora de Escopo)
| Funcionalidade | Motivo |
|----------------|--------|
| {nome} | {por que não fazer} |
| {nome} | {por que não fazer} |

### 3.2 Mapa de Funcionalidades

```
{Nome do Produto}
├── Módulo 1: {nome}
│   ├── F01: {funcionalidade}
│   ├── F02: {funcionalidade}
│   └── F03: {funcionalidade}
├── Módulo 2: {nome}
│   ├── F04: {funcionalidade}
│   └── F05: {funcionalidade}
└── Módulo 3: {nome}
    └── F06: {funcionalidade}
```

---

## 4. User Stories & Acceptance Criteria

### 4.1 Épico: {Nome do Épico}

#### US-001: {Título da User Story}

**Story:**
> Como {persona},
> Eu quero {ação/funcionalidade},
> Para que {benefício/objetivo}.

**Acceptance Criteria:**
- [ ] {Critério 1 - específico e testável}
- [ ] {Critério 2 - específico e testável}
- [ ] {Critério 3 - específico e testável}

**Cenário Principal (Given/When/Then):**
```gherkin
Dado que {contexto inicial}
Quando {ação do usuário}
Então {resultado esperado}
```

**Edge Cases:**
- {Caso especial 1}: {comportamento esperado}
- {Caso especial 2}: {comportamento esperado}

**Prioridade:** Must Have | Should Have | Could Have
**Estimativa:** P | M | G
**Dependências:** {outras US ou sistemas}

---

#### US-002: {Título da User Story}

**Story:**
> Como {persona},
> Eu quero {ação/funcionalidade},
> Para que {benefício/objetivo}.

**Acceptance Criteria:**
- [ ] {Critério 1}
- [ ] {Critério 2}
- [ ] {Critério 3}

**Prioridade:** Must Have | Should Have | Could Have
**Estimativa:** P | M | G

---

[Repetir para cada User Story...]

---

## 5. Requisitos Não-Funcionais

### 5.1 Performance

| Requisito | Métrica | Target |
|-----------|---------|--------|
| Tempo de resposta | P95 latency | < {X}ms |
| Tempo de carregamento | First Contentful Paint | < {X}s |
| Throughput | Requests/segundo | > {X} |

### 5.2 Escalabilidade

| Métrica | Inicial | Em 6 meses | Em 1 ano |
|---------|---------|------------|----------|
| Usuários simultâneos | {X} | {X} | {X} |
| Requisições/dia | {X} | {X} | {X} |
| Armazenamento | {X} GB | {X} GB | {X} GB |

### 5.3 Segurança

| Requisito | Descrição | Obrigatório |
|-----------|-----------|-------------|
| Autenticação | {método} | Sim/Não |
| Autorização | {modelo} | Sim/Não |
| Criptografia | {em trânsito/repouso} | Sim/Não |
| Compliance | {LGPD, SOC2, etc.} | Sim/Não |

### 5.4 Disponibilidade

| Requisito | Target |
|-----------|--------|
| Uptime | {X}% |
| RTO (Recovery Time Objective) | {X} horas |
| RPO (Recovery Point Objective) | {X} horas |

### 5.5 Acessibilidade

| Requisito | Target |
|-----------|--------|
| WCAG | Nível {A/AA/AAA} |
| Leitores de tela | Sim/Não |
| Navegação por teclado | Sim/Não |

---

## 6. Métricas de Sucesso

### 6.1 North Star Metric

| Métrica | Definição | Target MVP | Target 6 meses |
|---------|-----------|------------|----------------|
| **{Nome}** | {como é calculada} | {valor} | {valor} |

### 6.2 KPIs por Categoria

#### Aquisição
| KPI | Definição | Target |
|-----|-----------|--------|
| {nome} | {definição} | {valor} |

#### Ativação
| KPI | Definição | Target |
|-----|-----------|--------|
| {nome} | {definição} | {valor} |

#### Retenção
| KPI | Definição | Target |
|-----|-----------|--------|
| {nome} | {definição} | {valor} |

#### Receita
| KPI | Definição | Target |
|-----|-----------|--------|
| {nome} | {definição} | {valor} |

#### Referral
| KPI | Definição | Target |
|-----|-----------|--------|
| {nome} | {definição} | {valor} |

### 6.3 Critérios de Sucesso do MVP

O MVP será considerado um sucesso se:
- [ ] {Critério quantitativo 1}
- [ ] {Critério quantitativo 2}
- [ ] {Critério qualitativo 1}

---

## 7. Riscos & Mitigações

| # | Risco | Probabilidade | Impacto | Mitigação |
|---|-------|---------------|---------|-----------|
| R1 | {descrição} | Alta/Média/Baixa | Alto/Médio/Baixo | {estratégia} |
| R2 | {descrição} | Alta/Média/Baixa | Alto/Médio/Baixo | {estratégia} |
| R3 | {descrição} | Alta/Média/Baixa | Alto/Médio/Baixo | {estratégia} |

### Matriz de Riscos

```
              IMPACTO
           Baixo  Médio  Alto
         ┌──────┬──────┬──────┐
    Alta │      │      │ R1   │
PROB     ├──────┼──────┼──────┤
   Média │      │ R2   │      │
         ├──────┼──────┼──────┤
   Baixa │      │      │ R3   │
         └──────┴──────┴──────┘
```

---

## 8. Dependências & Integrações

### 8.1 Dependências Externas

| Dependência | Tipo | Criticidade | Status |
|-------------|------|-------------|--------|
| {nome} | API/Serviço/Dados | Alta/Média/Baixa | {status} |

### 8.2 Integrações Necessárias

| Sistema | Tipo | Descrição | Prioridade |
|---------|------|-----------|------------|
| {nome} | {tipo} | {para que serve} | MVP/v1/v2 |

---

## 9. Fora de Escopo (Explícito)

Para evitar scope creep, os seguintes itens estão **EXPLICITAMENTE FORA DO ESCOPO**:

| Item | Motivo | Quando Reconsiderar |
|------|--------|---------------------|
| {item} | {justificativa} | {condição} |
| {item} | {justificativa} | {condição} |

---

## 10. Glossário

| Termo | Definição |
|-------|-----------|
| {termo} | {definição no contexto do produto} |
| {termo} | {definição no contexto do produto} |

---

## Apêndice

### A. Referencias

| Documento | Link |
|-----------|------|
| Pesquisa de Mercado | `context/PESQUISA_MERCADO.md` |
| Arquitetura | `context/ARQUITETURA.md` |
| Tasks | `context/TASKS.md` |

### B. Histórico de Versões

| Versão | Data | Autor | Mudanças |
|--------|------|-------|----------|
| 1.0 | {data} | {autor} | Versão inicial |

---

*PRD gerado pelo Context Engineering Framework*
*Template baseado em: OpenAI AI PRD, ChatPRD, Lean Product Playbook*
```

---

## PRÓXIMOS PASSOS

Após gerar o PRD, informar:

```
PRD gerado com sucesso!

📁 ESTRUTURA MODULAR:
   context/PRD/
   ├── _index.md (resumo)
   ├── visao.md
   ├── personas.md
   ├── features/
   │   ├── {feature-1}.md
   │   └── ...
   └── requisitos-nao-funcionais.md

📄 FALLBACK: context/PRD.md (completo)

📊 Economia de contexto: ~80% por tarefa

Proximos passos sugeridos:
1. /gerar-arquitetura - Definir stack e padroes tecnicos
2. Adicionar tarefas em context/TASKS.md

Validar estrutura:
   /sync-context
```

---

## CHECKLIST DE QUALIDADE

### Entrevista
- [ ] Pesquisa de mercado carregada (se existir)
- [ ] Todas as perguntas essenciais respondidas (1-11)
- [ ] Resumo confirmado pelo usuário

### PRD
- [ ] Visão e proposta de valor claras
- [ ] Pelo menos 2 personas definidas
- [ ] Jornada do usuário mapeada
- [ ] Funcionalidades priorizadas (MoSCoW)
- [ ] User stories com acceptance criteria
- [ ] Requisitos não-funcionais especificados
- [ ] North Star metric definida
- [ ] Riscos identificados e mitigados
- [ ] Fora de escopo explícito
- [ ] Glossário com termos do domínio

---

## NOTAS DE EXECUÇÃO

- **Entrevista:** Uma pergunta por vez, seja conversacional
- **Contexto:** Use dados da pesquisa de mercado quando disponível
- **User Stories:** Mantenha atômicas (uma ação por story)
- **Acceptance Criteria:** Use bullets como checkboxes
- **Métricas:** Seja específico e mensurável
- **Escopo:** Seja explícito sobre o que NÃO fazer
