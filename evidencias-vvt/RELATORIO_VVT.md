# Relatório de testes do CineMarvel

## Objetivo, escopo e estratégia

Verificar o comportamento do catálogo e das contas do Projeto Web Final. A rodada avalia busca, detalhes, temporadas, formulários, navegação móvel, autenticação, autorização e CRUD de títulos. A [especificação dos 57 casos](CASOS_VVT.md) liga cada teste à funcionalidade, aos dados, ao aceite e ao código que o executa.

- **Unitário:** Jest isola serviços, middlewares e o cliente TMDB. O Node Test Runner executa os utilitários de navegação do React.
- **Funcional e API:** partição de equivalência para tipo de conteúdo e análise de valor-limite para nota média. O Supertest confere status e corpo JSON em cenários HTTP de sucesso e erro.
- **Integração:** Express e PostgreSQL reais. A suíte de contas usa uma conexão reservada, tabelas temporárias e `search_path` restrito a `pg_temp`. Ela cria usuários fictícios, guarda sessões reais e testa o CRUD. Um `ROLLBACK` encerra a rodada sem gravar nas tabelas compartilhadas.
- **Ponta a ponta:** Cypress em navegador usa o React, a API Express e as integrações reais de leitura. As interceptações observam as respostas e retiram cabeçalhos condicionais de cache.

**Entrada.** Dependências instaladas, variáveis configuradas em `.env`, PostgreSQL acessível com permissão para criar tabelas temporárias e TMDB respondendo. Para o Cypress, confirmar Vite e API locais e HTTP 200 na consulta do catálogo.

**Saída.** Executar as baterias planejadas, registrar o status de cada caso e repetir os testes após correções. A rodada fecha com os casos críticos de sessão e CRUD aprovados e cada reprovação explicada com evidência e situação.

## Ambiente e reprodução

Execução local em **10/11/2026**, aplicação na revisão `30eb9d1` com a nova suíte e esta documentação no diretório de trabalho. Windows, Node.js 24.19.0, Jest 29, Cypress 16.2.1 com Electron 146 em modo headless, Express na porta 3000 e Vite na porta 5174. PostgreSQL no Neon e API TMDB reais para os fluxos aplicáveis.

Na raiz, após a [instalação do projeto](../README.md#instalação-e-execução-local):

~~~powershell
npm test -- --runInBand
npm test --prefix frontend
npm run test:coverage -- --runInBand
~~~

Para o Cypress, deixe os dois primeiros comandos em terminais separados e use um terceiro para executar os testes:

~~~powershell
npm start
npm run dev --prefix frontend -- --host 127.0.0.1 --port 5174 --strictPort
npm run test:e2e -- --browser electron --config baseUrl=http://127.0.0.1:5174
~~~

Para a demonstração interativa, use `npm run test:e2e:open -- --config baseUrl=http://127.0.0.1:5174`. Se o pacote Cypress estiver instalado sem o binário, execute `npx cypress install`.

## Execução e regressão

| Bateria | Casos | Executados | Aprovados | Reprovados |
| --- | --- | ---: | ---: | ---: |
| Jest, unitários | UT-01 a UT-12 | 12 | 12 | 0 |
| Jest, integração | INT-01 a INT-10 | 10 | 10 | 0 |
| Jest, caixa-preta | CT-01 a CT-06 | 6 | 6 | 0 |
| Jest, API | API-01 a API-05 | 5 | 5 | 0 |
| Node Test Runner | FE-01 a FE-05 | 5 | 5 | 0 |
| Cypress | E2E-01 a E2E-19 | 19 | 19 | 0 |
| **Total** | | **57** | **57** | **0** |

Trechos da rodada final. Os casos INT-04 a INT-10 são a nova bateria de regressão de autenticação, autorização e catálogo.

~~~text
PASS tests/integration/contasCatalogo.test.js
  INT-04 cadastro público mantém o papel cliente
  INT-05 cliente entra e consulta o próprio perfil com o cookie
  INT-06 cliente autenticado recebe 403 nas três operações administrativas
  INT-07 administrador entra e mantém o papel no perfil
  INT-08 administrador cadastra, consulta, edita e desativa um item do catálogo
  INT-09 logout invalida a sessão do cliente
  INT-10 administrador recebe 400 para ID TMDB booleano

Test Suites: 7 passed, 7 total
Tests:       33 passed, 33 total

Node Test Runner: tests 5 | pass 5 | fail 0

Cypress
01-filmes.cy.js          5 aprovados
02-series.cy.js          4 aprovados
03-formularios.cy.js     6 aprovados
04-navegacao.cy.js       4 aprovados
All specs passed!       19 aprovados
~~~

Na primeira execução da nova suíte, o INT-05 falhou porque a asserção copiava `criado_em` da resposta de cadastro para a expectativa do perfil. O perfil devolveu os quatro campos de identidade documentados. A asserção passou a conferir ID, nome, e-mail e papel. A nova rodada aprovou o caso sem alteração no código da aplicação.

## Registro de defeitos

| ID | Condição e descrição | Esperado | Obtido antes | Evidência | Situação |
| --- | --- | --- | --- | --- | --- |
| DEF-01 | Inicialização com arquivo de ambiente não carregado | Variáveis lidas e servidor iniciado | Processo encerrou por variáveis obrigatórias ausentes | Histórico de `npm start` e mensagem do dotenv | Ambiente local corrigido. A inicialização passou na rodada atual |
| DEF-02 | Cadastro com `tmdb_id: true` | 400, ID inválido | Booleano convertido em 1 e aceito | Reprodução com repositório simulado em `d30e229` e `30eb9d1`. INT-10 repetiu o cenário pela API real | Corrigido. Regressão aprovada |
| DEF-03 | Carregamento das rotas de créditos de filmes | Um registro por rota de elenco e equipe | Cada rota estava declarada duas vezes | Comparação de `src/routes/filmeRoutes.js` antes e após `f2dd7a9` | Duplicatas removidas |
| DEF-04 | Login pela antiga página estática | Autenticação por `POST /api/login` | A página chamava `POST /login` e recebia 404 | Histórico da página e remoção de `public/index.html` no Git | Página legada removida. Login e formulários são testados pela API e pelo React |
| DEF-05 | Rota desconhecida sem cookie | 404 com erro em JSON | 401 por middleware de favoritos aplicado a todas as rotas | Resposta da versão anterior e API-01 no Jest | Corrigido no código testado localmente. A confirmação desta revisão na Vercel é separada |

## Cobertura e limites

O Jest mediu **36,47% de linhas** (399/1094) e **21,58% de ramos** (142/658) nos arquivos instrumentados do backend. A rodada anterior media 29,25% e 14,74%, respectivamente. O ganho corresponde à execução de caminhos reais de autenticação, permissão e catálogo.

O CRUD foi comprovado pela API. O Cypress cobre busca, formulários e acesso de visitante. A automação de navegador ainda não inclui o painel admin com sessão, comentários, favoritos autenticados ou reprodução de mídia. Os testes de frontend e Cypress ficam fora da instrumentação do Jest. Os pontos de cobertura mais baixa incluem essas operações e as falhas de serviços externos. Não há workflow de CI na revisão inspecionada.

## Demonstração

No Cypress interativo, abra `04-navegacao.cy.js` e mostre a busca de Os Simpsons em tela móvel. Em outro terminal, execute `npm test -- --runInBand contasCatalogo` para apresentar os casos de sessão, autorização e CRUD com dados temporários. Explique por que 403 bloqueia o cliente, enquanto a remoção pelo administrador é lógica e resulta em 404 nas consultas públicas.
