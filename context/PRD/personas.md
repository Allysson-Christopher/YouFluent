# Personas e Jornadas

---

## Persona Primaria: Lucas, o Dev Curioso

| Atributo | Descricao |
|----------|-----------|
| **Papel** | Desenvolvedor de software |
| **Idade** | 24-30 anos |
| **Contexto** | Trabalha remoto em startup, consome conteudo tech em ingles |
| **Objetivos** | Melhorar listening para reunioes e entrevistas em ingles |
| **Frustracoes** | Apps tradicionais sao entediantes e nao usam conteudo relevante |
| **Comportamento** | Assiste YouTube diariamente (tech talks, tutoriais, podcasts) |

**Quote representativa:**
> "Eu ja assisto tudo em ingles, mas queria uma forma de realmente aprender com isso, nao so consumir passivamente."

### Necessidades

1. Aprender vocabulario tecnico no contexto real
2. Melhorar compreensao de sotaques variados
3. Praticar no proprio ritmo, sem horario fixo
4. Ver transcricao quando nao entender algo

### Cenarios de Uso

**Cenario 1:** Lucas esta assistindo uma tech talk sobre arquitetura de software. Nao entende um trecho. Abre YouFluent, cola a URL, e vai direto pro chunk que nao entendeu. Gera uma licao com o vocabulario daquele trecho.

**Cenario 2:** Antes de uma entrevista em ingles, Lucas pratica com videos de mock interviews, gerando licoes para se preparar.

---

## Persona Secundaria: Marina, a Estudante

| Atributo | Descricao |
|----------|-----------|
| **Papel** | Estudante universitaria (Relacoes Internacionais) |
| **Idade** | 20-25 anos |
| **Contexto** | Precisa de ingles para intercambio e carreira |
| **Objetivos** | Atingir nivel avancado em 1 ano |
| **Frustracoes** | Cursos caros, apps com conteudo "infantil" |
| **Comportamento** | Assiste series, documentarios, TED Talks |

**Quote representativa:**
> "Quero aprender ingles de verdade, nao ficar repetindo 'the cat is on the table' eternamente."

---

## Persona Anti: Joao, o Iniciante

| Atributo | Descricao |
|----------|-----------|
| **Papel** | Profissional de 40+ anos, nivel zero de ingles |
| **Por que NAO e nosso usuario** | Precisa de estrutura basica, gramatica, fundamentos. Videos em ingles sao inacessiveis para ele. |

**Implicacao para o produto:** YouFluent NAO e para iniciantes absolutos. Requer pelo menos nivel pre-intermediario (A2/B1).

---

## Jornada do Usuario (Happy Path)

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ DESCOBERTA  │───►│ ATIVACAO    │───►│ ENGAJAMENTO │───►│ SUCESSO     │
│             │    │             │    │             │    │             │
│ Ve video    │    │ Cola URL    │    │ Faz licoes  │    │ Entende     │
│ quer        │    │ no app      │    │ regularmente│    │ video sem   │
│ entender    │    │ 1a licao    │    │             │    │ pausar      │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

### Detalhamento

1. **Descoberta:** Usuario encontra video interessante no YouTube, percebe que nao entende tudo
2. **Ativacao:** Acessa YouFluent, cola URL, ve transcricao sincronizada, gera primeira licao
3. **Engajamento:** Volta regularmente para processar novos videos, revisa vocabulario
4. **Sucesso:** Percebe melhora real na compreensao, consegue assistir sem pausar

### Pontos de Friccao

| Etapa | Friccao | Mitigacao |
|-------|---------|-----------|
| Descoberta | Nao conhece o app | Marketing em comunidades tech |
| Ativacao | Video sem legenda | Informar limitacao, sugerir alternativa |
| Engajamento | Esquece de usar | (v1.0) Notificacoes, streaks |

---

*Atualizado em: 2026-01-02*
