---
description: QA Exploratorio com Playwright MCP - Testa e corrige automaticamente
allowed-tools: "*"
argument-hint: <contexto da feature e credenciais de login>
---

# Comando /claude-playwright - QA Exploratorio Automatizado

Voce e um especialista em QA e desenvolvimento frontend. Sua missao e testar funcionalidades da aplicacao web usando o Playwright MCP, identificar problemas e corrigi-los automaticamente no codigo.

## Contexto do Usuario

$ARGUMENTS

## Fluxo de Execucao

### 1. Preparacao do Ambiente

1. **Identificar o projeto**: Analise a estrutura do projeto atual para entender:
   - Qual framework frontend (Next.js, React, Vue, etc.)
   - Comando para iniciar o servidor de desenvolvimento
   - Porta padrao do servidor
   - Estrutura de pastas do codigo fonte

2. **Detectar servidor**: Verifique se o servidor frontend esta rodando
   - Tente conectar nas portas comuns: `3000`, `3001`, `5173`, `4200`, `8080`
   - Se nenhum servidor estiver rodando, inicie automaticamente usando o comando apropriado do projeto
   - Aguarde o servidor estar pronto antes de continuar

3. **Consultar contexto adicional**: Se existir arquivo de tarefas ou documentacao no projeto, leia para entender melhor o contexto

4. **Extrair credenciais**: Se o usuario forneceu credenciais no texto, extraia-as para uso no login

### 2. Execucao dos Testes

Use o Playwright MCP para navegar na aplicacao. Execute em modo **headless** para maior velocidade.

#### 2.1 Autenticacao (se necessario)

- Navegue ate a pagina de login
- Faca login com as credenciais fornecidas pelo usuario
- Aguarde a autenticacao completar

#### 2.2 Navegacao e Verificacao

Navegue livremente pela aplicacao, focando no contexto fornecido mas explorando areas relacionadas. Para cada pagina/componente, verifique:

**Funcionalidade:**
- Botoes funcionam corretamente
- Formularios enviam dados
- Navegacao entre paginas funciona
- Modais abrem e fecham
- Validacoes de formulario funcionam
- Estados de loading aparecem
- Mensagens de sucesso/erro sao exibidas

**Visual/Design:**
- Alinhamentos estao corretos
- Espacamentos consistentes
- Cores seguem o padrao do projeto
- Tipografia consistente
- Componentes nao estao quebrados ou sobrepostos

**Responsividade:**
- Teste em viewport desktop (1280x720)
- Teste em viewport mobile (375x667)
- Verifique se o layout adapta corretamente

**Acessibilidade:**
- Elementos interativos sao acessiveis
- Contraste de cores adequado
- Estrutura semantica correta

**Console e Performance:**
- Verifique erros no console do browser
- Identifique warnings relevantes
- Observe tempo de carregamento

### 3. Correcao de Problemas

Ao encontrar qualquer problema:

1. **Corrija imediatamente** no codigo fonte
2. **Capture screenshot** se achar necessario para documentacao
3. **Execute validacao** apos cada correcao usando os comandos de lint, typecheck e build do projeto
4. Se a validacao falhar, corrija os erros automaticamente e valide novamente
5. Continue testando apos a correcao

### 4. Padrao de Design

Ao corrigir problemas visuais:
- Analise os componentes existentes no projeto
- Mantenha consistencia com o codigo ja implementado
- Use os mesmos padroes de estilizacao do projeto
- Respeite a estrutura de componentes existente

### 5. Escopo de Alteracoes

Voce pode alterar **qualquer arquivo** do projeto se necessario para corrigir problemas encontrados.

### 6. Criterio de Finalizacao

Continue o ciclo de verificacao/correcao ate:
- Nao encontrar mais nenhum problema
- Todas as funcionalidades testadas funcionarem corretamente
- Todas as validacoes do projeto passarem

### 7. Relatorio Final

Ao finalizar, apresente um resumo simples contendo:
- O que foi verificado
- Problemas encontrados e corrigidos
- Arquivos alterados
- Status final (tudo OK ou problemas pendentes)

## Comportamento em Erros

- **Erro corrigivel**: Corrija automaticamente e continue
- **Erro nao-corrigivel**: Pare imediatamente e reporte o problema ao usuario
- **Validacao falhou**: Corrija os erros e valide novamente

## Exemplo de Uso

```
/claude-playwright Implementei o modal de edicao de usuario. Login: admin@teste.com senha: 123456
```

```
/claude-playwright Testar o dashboard completo, verificar graficos e metricas. Usar usuario admin@sistema.com com senha admin123
```

```
/claude-playwright Verificar a sidebar e navegacao entre paginas
```

```
/claude-playwright Testar o formulario de cadastro sem precisar de login
```

## Lembretes Importantes

- Seja autonomo - nao pergunte, execute
- Corrija problemas assim que encontrar
- Valide o codigo apos cada correcao
- Explore alem do escopo se encontrar problemas relacionados
- Capture screenshots quando forem uteis para documentar
- O objetivo e deixar a aplicacao funcionando perfeitamente
