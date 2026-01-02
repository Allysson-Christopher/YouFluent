# Fazer Pesquisa de Mercado

## Input opcional: $ARGUMENTS

Realiza uma pesquisa de mercado completa e estruturada para validar uma ideia de produto/startup antes de iniciar o desenvolvimento.

> **Por que isso importa:** 35% das startups falham por falta de necessidade de mercado (CB Insights 2025). Esta pesquisa reduz esse risco.

---

## FASE 1: ENTREVISTA DE DESCOBERTA

### Instruções para o Claude

Conduza uma entrevista interativa com o usuário para coletar as informações necessárias. **FAÇA UMA PERGUNTA POR VEZ** e aguarde a resposta antes de prosseguir.

### Fluxo da Entrevista

**REGRAS DA ENTREVISTA:**
1. Faça **APENAS UMA pergunta por mensagem**
2. Aguarde a resposta do usuário antes de prosseguir
3. **Sempre ofereça opções numeradas** quando aplicável
4. O usuário pode responder apenas com o **número da opção**
5. Inclua sempre a opção "Outro" para respostas personalizadas
6. Se o usuário fornecer informações extras, aproveite e pule perguntas já respondidas
7. Use as respostas anteriores para contextualizar as próximas perguntas

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
PERGUNTA 1 - ABERTURA
"Vamos começar a pesquisa de mercado! Qual é o nome do seu projeto ou produto?

(Resposta livre - digite o nome)"

PERGUNTA 2 - ELEVATOR PITCH
"Legal, {nome}! Em uma ou duas frases, como você descreveria o que {nome} faz?

(Resposta livre - tipo um pitch de elevador)"

PERGUNTA 3 - CATEGORIA DO PRODUTO
"Em qual categoria {nome} se encaixa?

1. SaaS / Software B2B
2. App móvel B2C
3. E-commerce / Marketplace
4. Fintech / Pagamentos
5. Healthtech / Saúde
6. Edtech / Educação
7. Outro (descreva)

Digite o número:"

PERGUNTA 4 - PROBLEMA
"Qual é o problema específico que {nome} resolve?

1. Economizar tempo em tarefas repetitivas
2. Reduzir custos operacionais
3. Melhorar comunicação/colaboração
4. Automatizar processos manuais
5. Facilitar acesso a algo difícil
6. Outro (descreva o problema)

Digite o número ou descreva:"

PERGUNTA 5 - PÚBLICO-ALVO
"Quem é o cliente ideal do {nome}?

1. Consumidor final (pessoa física)
2. Pequenas empresas (1-50 funcionários)
3. Médias empresas (50-500 funcionários)
4. Grandes empresas (500+ funcionários)
5. Freelancers / Profissionais autônomos
6. Outro (descreva)

Digite o número:"

PERGUNTA 6 - SOLUÇÃO ATUAL
"Como essas pessoas resolvem esse problema HOJE?

1. Usam concorrentes diretos (quais?)
2. Usam planilhas/ferramentas genéricas
3. Fazem manualmente
4. Contratam pessoas/serviços
5. Simplesmente não resolvem
6. Outro (descreva)

Digite o número ou descreva:"

PERGUNTA 7 - DIFERENCIAL
"O que faria {nome} ser melhor que as alternativas?

1. Preço mais acessível
2. Mais fácil de usar
3. Mais completo/funcionalidades
4. Tecnologia superior (IA, automação)
5. Melhor atendimento/suporte
6. Nicho específico não atendido
7. Outro (descreva)

Digite o número ou descreva:"

PERGUNTA 8 - MERCADO GEOGRÁFICO
"Qual mercado geográfico você quer atingir inicialmente?

1. Local (cidade/região específica)
2. Nacional (Brasil)
3. América Latina (LATAM)
4. Global (inglês)
5. Outro (especifique)

Digite o número:"

PERGUNTA 9 - MONETIZAÇÃO
"Como {nome} vai ganhar dinheiro?

1. Assinatura mensal (SaaS)
2. Freemium (grátis + plano pago)
3. Comissão por transação
4. Venda única (licença)
5. Publicidade
6. Ainda não sei
7. Outro (descreva)

Digite o número:"

PERGUNTA 10 - MOTIVAÇÃO
"Por que VOCÊ quer construir isso?

1. Experiência pessoal com o problema
2. Oportunidade de mercado identificada
3. Expertise técnica na área
4. Já validei com potenciais clientes
5. Outro (descreva)

Digite o número ou descreva:"

PERGUNTA 11 - INFORMAÇÕES ADICIONAIS
"Tem mais alguma coisa importante que eu deveria saber?

1. Não, podemos prosseguir
2. Já conheço alguns concorrentes (liste)
3. Tenho restrições de orçamento/tempo
4. Outro (descreva)

Digite o número ou adicione informações:"
```

### Comportamento Durante a Entrevista

1. **Início:** Se `$ARGUMENTS` contiver informações, extraia o que puder e pule perguntas já respondidas
2. **Validação:** Se uma resposta for muito vaga, peça gentilmente para elaborar
3. **Adaptação:** Use o nome do projeto nas perguntas após a primeira resposta
4. **Encerramento:** Após coletar as informações, confirme com o usuário antes de iniciar a pesquisa

### Confirmação Final

Após todas as perguntas, apresente um resumo:

```
RESUMO DA SUA IDEIA:
━━━━━━━━━━━━━━━━━━━━

📛 Projeto: {nome}
💡 O que faz: {elevator_pitch}
📁 Categoria: {categoria}
😤 Problema: {problema}
👥 Para quem: {publico_alvo}
🔄 Alternativas atuais: {solucao_atual}
⭐ Diferencial: {diferencial}
🌍 Mercado: {mercado_geografico}
💰 Monetização: {monetizacao}

Está tudo certo? Posso iniciar a pesquisa de mercado?

1. Sim, está tudo certo
2. Preciso ajustar algumas coisas

Digite o número:
```

---

## FASE 2: PESQUISA WEB AUTOMATIZADA

Após confirmação do usuário, realizar buscas estruturadas:

### Buscas Obrigatórias

```
1. TAMANHO DE MERCADO
   - "{problema} market size 2024 2025"
   - "{industria} TAM SAM market"

2. CONCORRENTES
   - "{solução} competitors"
   - "{solução} alternatives"
   - "best {categoria} software/app"

3. TENDÊNCIAS
   - "{indústria} trends 2025"
   - "{problema} statistics"

4. PÚBLICO-ALVO
   - "{público-alvo} pain points {problema}"
   - "{público-alvo} behavior statistics"

5. MODELO DE NEGÓCIO
   - "{tipo de produto} pricing models"
   - "{tipo de produto} business model"

6. REGULAMENTAÇÃO (se aplicável)
   - "{indústria} regulations {país}"
   - "{indústria} compliance requirements"
```

### Análise e Síntese

Para cada seção do relatório:
1. Coletar dados de múltiplas fontes
2. Validar informações cruzando fontes
3. Sintetizar em insights acionáveis
4. Documentar fontes com URLs

---

## FASE 3: GERAÇÃO DO RELATÓRIO

### Output

1. Salvar relatório: `context/PESQUISA_MERCADO.md`
2. Salvar respostas da entrevista: `context/ENTREVISTA.md`

### Template do Relatório

```markdown
# Pesquisa de Mercado: {Nome do Projeto}

**Data:** {data}
**Versão:** 1.0

---

## Sumário Executivo

[2-3 parágrafos resumindo os principais achados e recomendação GO/NO-GO]

**Veredicto:** [GO / NO-GO / PIVOT NECESSÁRIO]
**Confiança:** [Alta / Média / Baixa]
**Principais Riscos:** [Lista de 3-5 riscos]

---

## 1. Problema & Jobs to Be Done

### 1.1 Definição do Problema
[Descrição clara do problema que o produto resolve]

### 1.2 Jobs to Be Done (JTBD)
| Job Funcional | Job Emocional | Job Social |
|---------------|---------------|------------|
| [O que o usuário quer realizar] | [Como quer se sentir] | [Como quer ser percebido] |

### 1.3 Alternativas Atuais
| Alternativa | Tipo | Limitações |
|-------------|------|------------|
| [Nome] | [Direta/Indireta/Workaround] | [Por que não resolve bem] |

### 1.4 Validação do Problema
- **Evidências de que o problema existe:**
  - [Dados, pesquisas, tendências]
- **Intensidade da dor:** [Alta/Média/Baixa]
- **Frequência:** [Diária/Semanal/Mensal/Eventual]

---

## 2. Persona & ICP (Ideal Customer Profile)

### 2.1 Perfil Demográfico
| Atributo | Descrição |
|----------|-----------|
| Idade | |
| Gênero | |
| Localização | |
| Renda/Budget | |
| Ocupação | |

### 2.2 Perfil Psicográfico
- **Valores:**
- **Interesses:**
- **Comportamentos:**
- **Frustrações:**

### 2.3 Segmentos Prioritários
| Segmento | Tamanho Estimado | Prioridade | Justificativa |
|----------|------------------|------------|---------------|
| [Nome] | [N pessoas/empresas] | [1/2/3] | [Por que priorizar] |

### 2.4 Early Adopters
[Quem são os usuários mais prováveis de adotar primeiro e por quê]

---

## 3. Dimensionamento de Mercado (TAM/SAM/SOM)

### 3.1 TAM (Total Addressable Market)
- **Definição:** [Todo o mercado possível]
- **Valor:** $[X] / [Y] usuários
- **Metodologia:** [Top-down/Bottom-up]
- **Fontes:** [Links]

### 3.2 SAM (Serviceable Addressable Market)
- **Definição:** [Mercado que podemos servir com nossa solução]
- **Valor:** $[X] / [Y] usuários
- **Restrições consideradas:** [Geográficas, técnicas, etc.]

### 3.3 SOM (Serviceable Obtainable Market)
- **Definição:** [Mercado que realisticamente podemos capturar em 1-3 anos]
- **Valor:** $[X] / [Y] usuários
- **Premissas:** [Market share esperado, taxa de conversão, etc.]

### 3.4 Visualização
```
TAM: $[X]B ████████████████████████████████████████
SAM: $[X]M ████████████████████
SOM: $[X]M ████████
```

---

## 4. Análise Competitiva

### 4.1 Mapa de Concorrentes

| Concorrente | Tipo | Funding | Usuários | Pricing | Força Principal | Fraqueza Principal |
|-------------|------|---------|----------|---------|-----------------|-------------------|
| [Nome] | [Direto/Indireto] | [Valor] | [Est.] | [Modelo] | | |

### 4.2 Matriz de Funcionalidades

| Feature | Nós | Conc. A | Conc. B | Conc. C |
|---------|-----|---------|---------|---------|
| [Feature 1] | [Planned/Yes] | [Yes/No] | [Yes/No] | [Yes/No] |

### 4.3 Posicionamento

```
                    Alto Preço
                        │
           [Conc. A]    │    [Conc. B]
                        │
    Menos ──────────────┼────────────── Mais
    Features            │              Features
                        │
           [Conc. C]    │    [NÓS?]
                        │
                   Baixo Preço
```

### 4.4 Diferenciação Proposta
[Como nos diferenciamos dos concorrentes]

---

## 5. Análise Porter's 5 Forces

### 5.1 Ameaça de Novos Entrantes: [Alta/Média/Baixa]
- **Barreiras de entrada:** [Lista]
- **Capital necessário:** [Estimativa]
- **Expertise técnica:** [Nível]

### 5.2 Poder de Barganha dos Fornecedores: [Alta/Média/Baixa]
- **Fornecedores-chave:** [Lista]
- **Dependência:** [Nível]
- **Alternativas:** [Existem?]

### 5.3 Poder de Barganha dos Compradores: [Alta/Média/Baixa]
- **Sensibilidade a preço:** [Nível]
- **Custo de troca:** [Alto/Baixo]
- **Informação disponível:** [Muita/Pouca]

### 5.4 Ameaça de Substitutos: [Alta/Média/Baixa]
- **Substitutos identificados:** [Lista]
- **Custo-benefício comparado:** [Análise]

### 5.5 Rivalidade Competitiva: [Alta/Média/Baixa]
- **Número de competidores:** [N]
- **Taxa de crescimento do mercado:** [%]
- **Diferenciação existente:** [Nível]

### 5.6 Resumo Visual
```
                    Novos Entrantes
                    [ALTA/MÉDIA/BAIXA]
                          │
                          ▼
Fornecedores ──► RIVALIDADE ◄── Compradores
[NÍVEL]          [NÍVEL]         [NÍVEL]
                          ▲
                          │
                    Substitutos
                    [NÍVEL]
```

---

## 6. Análise PESTEL

### 6.1 Político
| Fator | Impacto | Oportunidade/Ameaça |
|-------|---------|---------------------|
| [Ex: Regulamentação de dados] | [Descrição] | [O/A] |

### 6.2 Econômico
| Fator | Impacto | Oportunidade/Ameaça |
|-------|---------|---------------------|
| [Ex: Taxa de juros] | [Descrição] | [O/A] |

### 6.3 Social
| Fator | Impacto | Oportunidade/Ameaça |
|-------|---------|---------------------|
| [Ex: Mudança de comportamento] | [Descrição] | [O/A] |

### 6.4 Tecnológico
| Fator | Impacto | Oportunidade/Ameaça |
|-------|---------|---------------------|
| [Ex: IA generativa] | [Descrição] | [O/A] |

### 6.5 Ecológico/Ambiental
| Fator | Impacto | Oportunidade/Ameaça |
|-------|---------|---------------------|
| [Ex: Sustentabilidade] | [Descrição] | [O/A] |

### 6.6 Legal
| Fator | Impacto | Oportunidade/Ameaça |
|-------|---------|---------------------|
| [Ex: LGPD/GDPR] | [Descrição] | [O/A] |

---

## 7. Análise SWOT

### 7.1 Matriz SWOT

|  | **Positivo** | **Negativo** |
|--|--------------|--------------|
| **Interno** | **FORÇAS** | **FRAQUEZAS** |
|  | • [F1] | • [Fr1] |
|  | • [F2] | • [Fr2] |
| **Externo** | **OPORTUNIDADES** | **AMEAÇAS** |
|  | • [O1] | • [A1] |
|  | • [O2] | • [A2] |

### 7.2 Estratégias Derivadas

| Estratégia | Combinação | Ação |
|------------|------------|------|
| Ofensiva | Forças + Oportunidades | [Como usar forças para capturar oportunidades] |
| Defensiva | Forças + Ameaças | [Como usar forças para mitigar ameaças] |
| Reorientação | Fraquezas + Oportunidades | [Como superar fraquezas para capturar oportunidades] |
| Sobrevivência | Fraquezas + Ameaças | [Como minimizar fraquezas e evitar ameaças] |

---

## 8. Validação de Hipóteses

### 8.1 Hipóteses Críticas

| # | Hipótese | Risco se Falsa | Status |
|---|----------|----------------|--------|
| H1 | [O problema X existe e é significativo] | [Alto/Médio/Baixo] | [Validada/Invalidada/A testar] |
| H2 | [Usuários pagariam $Y por solução] | [Alto/Médio/Baixo] | [Status] |
| H3 | [Podemos construir com tecnologia Z] | [Alto/Médio/Baixo] | [Status] |

### 8.2 Experimentos Recomendados

| Hipótese | Experimento | Métrica de Sucesso | Custo | Tempo |
|----------|-------------|-------------------|-------|-------|
| H1 | [Ex: Landing page + ads] | [Ex: >5% conversão] | [R$X] | [X dias] |
| H2 | [Ex: Entrevistas com 20 usuários] | [Ex: >60% dispostos a pagar] | [R$X] | [X dias] |

### 8.3 Lean Validation Canvas

```
┌─────────────────────────────────────────────────────────┐
│ CLIENTE          │ PROBLEMA           │ SOLUÇÃO         │
│ [Quem]           │ [O quê]            │ [Como resolver] │
├──────────────────┼────────────────────┼─────────────────┤
│ RISKIEST         │ MÉTODO             │ CRITÉRIO        │
│ ASSUMPTION       │ [Como testar]      │ [Sucesso se...] │
│ [Hipótese + perigosa]│                │                 │
├──────────────────┼────────────────────┼─────────────────┤
│ RESULTADO        │ APRENDIZADO        │ DECISÃO         │
│ [Dados obtidos]  │ [Insight]          │ [Pivotar/Perseverar]│
└─────────────────────────────────────────────────────────┘
```

---

## 9. Modelo de Negócio (Canvas Simplificado)

### 9.1 Business Model Canvas

```
┌──────────────────┬──────────────────┬──────────────────┐
│ PARCEIROS-CHAVE  │ ATIVIDADES-CHAVE │ PROPOSTA DE VALOR│
│                  │                  │                  │
│ • [Parceiro 1]   │ • [Atividade 1]  │ • [Valor 1]      │
│ • [Parceiro 2]   │ • [Atividade 2]  │ • [Valor 2]      │
│                  ├──────────────────┤                  │
│                  │ RECURSOS-CHAVE   │                  │
│                  │                  │                  │
│                  │ • [Recurso 1]    │                  │
│                  │ • [Recurso 2]    │                  │
├──────────────────┴──────────────────┼──────────────────┤
│ ESTRUTURA DE CUSTOS                 │ FONTES DE RECEITA│
│                                     │                  │
│ • [Custo fixo 1]                    │ • [Receita 1]    │
│ • [Custo variável 1]                │ • [Receita 2]    │
└─────────────────────────────────────┴──────────────────┘
```

### 9.2 Proposta de Valor Detalhada

**Para** [segmento de cliente]
**Que** [tem esse problema/necessidade]
**Nosso produto** [nome]
**É um** [categoria]
**Que** [benefício principal]
**Diferente de** [alternativa principal]
**Nosso produto** [diferencial-chave]

### 9.3 Modelo de Monetização

| Modelo | Pricing | Justificativa |
|--------|---------|---------------|
| [Ex: SaaS subscription] | [Ex: R$99/mês] | [Por que esse modelo e preço] |

### 9.4 Unit Economics (Projeção)

| Métrica | Valor Estimado | Premissas |
|---------|----------------|-----------|
| CAC (Customer Acquisition Cost) | R$[X] | [Como calculou] |
| LTV (Lifetime Value) | R$[X] | [Churn estimado, ticket médio] |
| LTV:CAC Ratio | [X]:1 | [Saudável se >3:1] |
| Payback Period | [X] meses | |

---

## 10. Recomendações & Próximos Passos

### 10.1 Veredicto Final

| Critério | Score (1-5) | Justificativa |
|----------|-------------|---------------|
| Tamanho do Mercado | [X] | |
| Intensidade do Problema | [X] | |
| Diferenciação Competitiva | [X] | |
| Viabilidade Técnica | [X] | |
| Viabilidade Financeira | [X] | |
| Timing de Mercado | [X] | |
| **SCORE TOTAL** | **[X]/30** | |

**Recomendação:** [GO / NO-GO / PIVOT]

### 10.2 Riscos Principais

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| [Risco 1] | [Alta/Média/Baixa] | [Alto/Médio/Baixo] | [Como mitigar] |

### 10.3 MVP Recomendado

**Escopo do MVP:**
- [Feature essencial 1]
- [Feature essencial 2]
- [Feature essencial 3]

**Fora do MVP (v2+):**
- [Feature futura 1]
- [Feature futura 2]

**Estimativa de esforço MVP:** [Pequeno/Médio/Grande]

### 10.4 Próximos Passos Imediatos

1. [ ] [Ação 1 - Ex: Validar H1 com landing page]
2. [ ] [Ação 2 - Ex: Entrevistar 10 potenciais clientes]
3. [ ] [Ação 3 - Ex: Criar protótipo de baixa fidelidade]
4. [ ] [Ação 4 - Ex: Definir stack técnica]
5. [ ] [Ação 5 - Ex: Gerar INITIAL.md para MVP]

---

## Apêndice

### A. Fontes Consultadas

| # | Fonte | URL | Data de Acesso |
|---|-------|-----|----------------|
| 1 | [Nome] | [URL] | [Data] |

### B. Dados Brutos

[Dados relevantes coletados durante a pesquisa]

### C. Respostas da Entrevista

[Link para ENTREVISTA.md com as respostas originais do usuário]

---

*Pesquisa gerada automaticamente pelo Context Engineering Framework*
*Metodologia baseada em: Lean Startup, Jobs to Be Done, Porter's 5 Forces, PESTEL, SWOT*
```

---

## Template do Arquivo ENTREVISTA.md

```markdown
# Entrevista de Descoberta: {Nome do Projeto}

**Data:** {data}
**Entrevistado:** Fundador/Idealizador

---

## Respostas Coletadas

### 1. Nome do Projeto
> {resposta}

### 2. Elevator Pitch
> {resposta}

### 3. Problema que Resolve
> {resposta}

### 4. Público-Alvo
> {resposta}

### 5. Soluções Atuais (Concorrência)
> {resposta}

### 6. Diferencial
> {resposta}

### 7. Mercado Geográfico
> {resposta}

### 8. Modelo de Monetização
> {resposta}

### 9. Motivação Pessoal
> {resposta}

### 10. Informações Adicionais
> {resposta}

---

## Notas do Entrevistador

[Observações, insights ou pontos de atenção identificados durante a entrevista]
```

---

## Próximo Passo

Após concluir a pesquisa de mercado, se o veredicto for GO:

```
/generate-prp "Criar MVP de {nome do projeto} baseado na pesquisa de mercado em context/PESQUISA_MERCADO.md"
```

---

## Checklist de Qualidade

### Entrevista
- [ ] Todas as perguntas essenciais respondidas (1-8)
- [ ] Resumo confirmado pelo usuário
- [ ] ENTREVISTA.md salvo

### Pesquisa
- [ ] Todas as 10 seções preenchidas
- [ ] TAM/SAM/SOM com fontes verificáveis
- [ ] Mínimo 3 concorrentes analisados
- [ ] Hipóteses críticas identificadas
- [ ] Experimentos de validação propostos
- [ ] Veredicto GO/NO-GO fundamentado
- [ ] Próximos passos acionáveis
- [ ] Todas as fontes documentadas com URLs

---

## Notas de Execução

- **Entrevista:** Uma pergunta por vez, seja conversacional
- **Pesquisa:** Use WebSearch extensivamente
- **Fontes:** Priorize dados recentes (últimos 2 anos)
- **Estimativas:** Seja conservador nos números
- **Foco:** Insights acionáveis > volume de dados
