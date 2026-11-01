# Relatório de Verificação, Validação e Teste de Software (VV&T) — CineCatalog API


## 1. Estrutura da Suíte de Testes e Automação (Itens 1, 2, 3, 4 e 5)

A automação foi implementada utilizando **Jest** e **Supertest** (`npm test`), organizada nas seguintes pastas:

| Item do Trabalho | Pasta / Arquivo | Escopo Testado | Total de Casos | Status |
| :--- | :--- | :--- | :---: | :---: |
| **1. Teste Unitário** | `tests/unit/catalogoService.test.js`<br>`tests/unit/middlewares.test.js` | Regras isoladas do `CatalogoService` (com mocks de repositório/TMDB) e middlewares `exigeLogin` e `rotaNaoEncontrada` | 5 | PASS |
| **2. Teste de Integração** | `tests/integration/integracao.test.js` | Integração real entre Express (`app.js`), Rotas, Middlewares, Controllers, Services e Banco PostgreSQL | 3 | PASS |
| **3. Teste Funcional (Caixa-Preta)** | `tests/functional/caixaPreta.test.js` | Partição de Equivalência (`tipo_conteudo`) e Análise de Valor Limite (`nota_media` de `0` a `10`) | 6 | PASS |
| **4. Teste de API REST** | `tests/api/rotasApi.test.js` | Endpoints REST (`/api/login`, `/api/cadastro`, `/api/perfil`, `/api/filmes/buscar`, erro `404` e JSON inválido) | 5 | PASS |
| **5. Automação** | Todas as suítes (`npm test`) | Execução automatizada de todos os fluxos via Jest + Supertest | **19** | **100% PASS** |

---

## 2. Casos de Teste Funcional — Caixa-Preta (Item 3)


| ID | Funcionalidade / Campo | Técnica | Entrada Testada | Resultado Esperado | Resultado Obtido | Status |
| :- | :--- | :--- | :--- | :--- | :--- | :---: |
| CT-01 | `tipo_conteudo` (`'filme'` \| `'serie'`) | Partição Válida (PE) | `'serie'` | Aceita o cadastro com `tipo_conteudo = 'serie'` | Aceitou (`'serie'`) | PASS |
| CT-02 | `tipo_conteudo` (`'filme'` \| `'serie'`) | Partição Inválida (PE) | `'novela'` | Rejeita com erro `O tipo de conteúdo deve ser filme ou serie.` | Rejeitou com erro esperado | PASS |
| CT-03 | `nota_media` (`0` a `10`) | Valor Limite Inferior Inválido (AVL) | `-0.1` | Rejeita com erro `A nota média deve estar entre 0 e 10.` | Rejeitou com erro esperado | PASS |
| CT-04 | `nota_media` (`0` a `10`) | Valor Limite Inferior Válido (AVL) | `0` | Aceita nota `0` | Aceitou (`0`) | PASS |
| CT-05 | `nota_media` (`0` a `10`) | Valor Limite Superior Válido (AVL) | `10` | Aceita nota `10` | Aceitou (`10`) | PASS |
| CT-06 | `nota_media` (`0` a `10`) | Valor Limite Superior Inválido (AVL) | `10.1` | Rejeita com erro `A nota média deve estar entre 0 e 10.` | Rejeitou com erro esperado | PASS |

---

## 3. Evidências de Execução do Framework (Item 7)

Saída registrada na execução de `npm test` (`jest --verbose`):

```text
 PASS  tests/unit/middlewares.test.js
  Testes Unitários dos Middlewares
    √ exigeLogin deve retornar 401 quando não houver usuário na sessão (11 ms)
    √ exigeLogin deve chamar next() quando houver usuário autenticado na sessão (1 ms)
    √ rotaNaoEncontrada deve criar erro 404 e enviar para o next

 PASS  tests/functional/caixaPreta.test.js
  Testes Funcionais (Caixa-Preta: Partição de Equivalência e Valor Limite)
    √ Partição Válida: deve aceitar tipo_conteudo "serie" (12 ms)
    √ Partição Inválida: deve rejeitar tipo_conteudo "novela" (16 ms)
    √ Valor Limite Inferior Inválido: deve rejeitar nota -0.1 (2 ms)
    √ Valor Limite Inferior Válido: deve aceitar nota 0
    √ Valor Limite Superior Válido: deve aceitar nota 10 (1 ms)
    √ Valor Limite Superior Inválido: deve rejeitar nota 10.1 (1 ms)

 PASS  tests/unit/catalogoService.test.js
  Testes do CatalogoService
    √ aceitar filme válido (12 ms)
    √ rejeitar filme com URL completa no poster_path (15 ms)

 PASS  tests/api/rotasApi.test.js
  Testes de API REST (Endpoints, Status Codes e Erros)
    √ GET /api/rota-inexistente deve retornar 404 (Rota não encontrada) (36 ms)
    √ POST /api/login com JSON malformado deve retornar 400 (28 ms)
    √ GET /api/perfil sem estar logado deve retornar 401 (3 ms)
    √ GET /api/filmes/buscar sem informar o nome do filme deve retornar 400 (8 ms)
    √ POST /api/cadastro com senha menor que 8 caracteres deve retornar 400 (3 ms)

 PASS  tests/integration/integracao.test.js
  Testes de Integração (Express + Rotas + Controller + Service + PostgreSQL)
    √ Integração Banco + API: GET /api/catalogo deve buscar os itens ativos no PostgreSQL (346 ms)
    √ Integração Controller + Service + TrataErro: GET /api/catalogo?tipo=invalido deve retornar 400 (10 ms)
    √ Integração Rotas + Middleware exigeLogin: POST /api/admin/catalogo sem sessão deve bloquear com 401 (17 ms)

Test Suites: 5 passed, 5 total
Tests:       19 passed, 19 total
Snapshots:   0 total
Time:        1.945 s
Ran all test suites.
```

---

## 4. Registro de Defeitos Encontrados (Item 8)

| ID | Descrição | Condição de Ocorrência | Resultado Esperado | Resultado Obtido | Evidência | Situação após Correção |
| :- | :--- | :--- | :--- | :--- | :--- | :--- |
| **DEF-01** | Arquivo de variáveis de ambiente nomeado incorretamente como `env` sem o ponto inicial | Ao iniciar o servidor com `npm start` | Carregar as variáveis `SESSION_SECRET`, `TMDB_BEARER_TOKEN` e `DATABASE_URL_POOLED` do arquivo `.env` | `dotenv` injetou 0 variáveis e o servidor encerrou com erro de variáveis obrigatórias ausentes | Log do terminal: `Erro: variáveis de ambiente obrigatórias ausentes` | **Corrigido** (arquivo renomeado para `.env` e validado na inicialização e nos testes) |
| **DEF-02** | `validarTmdbId` em `src/services/CatalogoService.js` aceita valor booleano `true` devido à coerção `Number(true) === 1` | Ao chamar `CatalogoService.cadastrar` passando `tmdb_id: true` | Lançar erro `400` (`ID do TMDB inválido.`) | O valor booleano `true` é convertido para o número inteiro `1` e aceito na validação | Inspeção estática e análise sobre `CatalogoService.js` (linhas 37–48) | **Identificado / Documentado** (recomenda-se validar `/^\d+$/` assim como em `validarId`) |
| **DEF-03** | Rotas de elenco e equipe declaradas em duplicidade em `src/routes/filmeRoutes.js` | Registro das rotas `/filmes/:id/elenco` e `/filmes/:id/equipe` nas linhas 13–21 e novamente nas linhas 24–25 | Cada endpoint deve ser registrado apenas uma vez no roteador do Express | Duplicidade de declaração de rotas no mesmo arquivo | Inspeção do arquivo `src/routes/filmeRoutes.js` | **Identificado / Documentado** |
| **DEF-04** | Página estática legada (`public/index.html`) aponta para rota inexistente `POST /login` com `access_token` | Ao tentar autenticar pela interface estática servida em `http://localhost:3000` | Autenticar na API ou utilizar a rota atual `POST /api/login` com `email` e `senha` | Retorna `404 Rota não encontrada: POST /login` | Teste de navegação e log do middleware `rotaNaoEncontrada` | **Resolvido pelo uso do frontend React (`frontend/` na porta `5173`) integrado às rotas `/api/*`** |

---

## 5. Testes de Regressão (Item 6)

| Suíte Executada na Regressão | Casos Executados | Resultado Obtido | Regressão Detectada? |
| :--- | :---: | :---: | :---: |
| `tests/unit/catalogoService.test.js` | 2 | 2 Passaram (`PASS`) | Não |
| `tests/unit/middlewares.test.js` | 3 | 3 Passaram (`PASS`) | Não |
| `tests/functional/caixaPreta.test.js` | 6 | 6 Passaram (`PASS`) | Não |
| `tests/api/rotasApi.test.js` | 5 | 5 Passaram (`PASS`) | Não |
| `tests/integration/integracao.test.js` | 3 | 3 Passaram (`PASS`) | Não |
| **Total da Bateria de Regressão** | **19** | **19 Passaram (100%)** | **Nenhuma** |
