# Carregar Contexto

## Input: $ARGUMENTS

Carrega contexto modular baseado em tags ou tipo de tarefa.

> **Uso:** `/carregar-contexto PRD:features/auth ARQUITETURA:dominios/user`
> **Ou:** `/carregar-contexto --tipo=feature --feature=auth`

---

## Modos de Uso

### Modo 1: Por Tags (Explicito)

```
/carregar-contexto PRD:visao PRD:features/auth ARQUITETURA:dominios/user
```

Carrega exatamente os arquivos especificados.

### Modo 2: Por Tipo de Tarefa

```
/carregar-contexto --tipo=setup
/carregar-contexto --tipo=feature --feature=auth
/carregar-contexto --tipo=bugfix --dominio=user
/carregar-contexto --tipo=refactor --dominio=order
```

Carrega contexto pre-definido para cada tipo.

### Modo 3: Por Tarefa do TASKS/

```
/carregar-contexto --tarefa=T-001
```

Extrai tags da tarefa e carrega automaticamente.

---

## Processo

### 1. Parsear Argumentos

```
Se $ARGUMENTS contem ":"
  → Modo Tags (ex: "PRD:features/auth")

Se $ARGUMENTS contem "--tipo"
  → Modo Tipo de Tarefa

Se $ARGUMENTS contem "--tarefa"
  → Modo Tarefa TASKS/
```

### 2. Resolver Arquivos

**Modo Tags:**
```
PRD:visao           → context/PRD/visao.md
PRD:features/auth   → context/PRD/features/auth.md
ARQUITETURA:stack   → context/ARQUITETURA/stack.md
```

**Modo Tipo de Tarefa:**

| Tipo | Arquivos Carregados |
|------|---------------------|
| `setup` | ARQUITETURA/_index, stack, padroes |
| `feature` | PRD/_index, features/{feature} + ARQUITETURA/_index, dominios/{dominio} |
| `bugfix` | ARQUITETURA/_index, dominios/{dominio} |
| `refactor` | ARQUITETURA/_index, padroes, dominios/{dominio} |

**Modo Tarefa:**
1. Ler `context/TASKS/_index.md` (ordem) + `context/TASKS/T-XXX.md` (tarefa)
2. Encontrar tarefa T-XXX
3. Extrair bloco "Tags de Contexto" (formato padrao abaixo)
4. Resolver tags para arquivos

**Formato Padrao de Tags (nas tarefas T-XXX.md):**
```markdown
## Tags de Contexto

```
PRD: features/auth
ARQUITETURA: dominios/user, decisoes/adr-001
```
```

> O bloco usa header H2 + bloco de codigo. Parsear o conteudo entre ``` e ```.

### 3. Carregar e Apresentar

Para cada arquivo resolvido:

```markdown
---
## {caminho relativo}
---

{conteudo do arquivo}
```

### 4. Resumo Final

```
CONTEXTO CARREGADO:
━━━━━━━━━━━━━━━━━━

📁 Arquivos: {N}
📊 Tamanho total: ~{X}KB

Arquivos carregados:
- context/PRD/_index.md
- context/PRD/features/auth.md
- context/ARQUITETURA/_index.md
- context/ARQUITETURA/dominios/user.md

Economia vs monolitico: ~{Y}% menos tokens
```

---

## Fallback Hierarchy

Se um arquivo nao existir:

1. **Nivel 1:** Tentar arquivo especifico
   - `context/PRD/features/auth.md`

2. **Nivel 2:** Tentar _index do modulo
   - `context/PRD/_index.md`

3. **Nivel 3:** Tentar arquivo legado (monolitico)
   - `context/PRD.md`

4. **Nivel 4:** Avisar que contexto nao existe
   - "Arquivo nao encontrado. Execute /gerar-prd primeiro."

---

## Exemplos de Uso

### Setup Inicial
```
/carregar-contexto --tipo=setup
```
Carrega: stack, padroes, tarefa atual

### Implementar Feature
```
/carregar-contexto --tipo=feature --feature=auth --dominio=user
```
Carrega: PRD de auth, dominio user, tarefa atual

### Por Tarefa
```
/carregar-contexto --tarefa=T-003
```
Extrai tags da T-003 e carrega automaticamente

### Explicito
```
/carregar-contexto PRD:_index PRD:features/payment ARQUITETURA:dominios/order ARQUITETURA:decisoes/adr-002
```
Carrega exatamente esses 4 arquivos

---

## Integracao com /next

O comando `/next` usa este loader internamente:

```
1. Consultar Git para ultima tarefa concluida
2. Ler TASKS/_index.md + T-XXX.md para encontrar proxima tarefa
3. Extrair bloco "## Tags de Contexto" da tarefa (H2 + bloco de codigo)
4. Chamar loader com essas tags
5. Passar contexto carregado para subagents
```

---

## Notas

- **Sempre carrega _index.md** do modulo para contexto minimo
- **Git e fonte de progresso** - consulta commits para saber tarefa atual
- **Fallback automatico** para arquivos legados
- **Estimativa de economia** calculada vs carregar tudo
