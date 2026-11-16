# Casos de teste do CineMarvel

Os IDs abaixo ligam cada teste à funcionalidade e à regra de aceite descritas na tabela. O arquivo de implementação e as pré-condições comuns aparecem em cada seção. Dados de conta são fictícios. Os resultados e o status correspondem à rodada documentada no [relatório de execução](RELATORIO_VVT.md).

## Cadastro e validações no serviço

Pré-condição comum: Jest carregado, TMDB e repositório simulados. O repositório devolve os dados recebidos. Nos casos CT, a base é o filme Homem Lata, ID TMDB 22, nota 8 e usuário 1. Cada caso altera somente o campo indicado.

Implementação: [catalogoService.test.js](../tests/unit/catalogoService.test.js) (UT-01 e UT-02) e [caixaPreta.test.js](../tests/functional/caixaPreta.test.js) (CT-01 a CT-06).

| ID | Funcionalidade e objetivo | Entrada | Passos | Esperado | Obtido | Status |
| --- | --- | --- | --- | --- | --- | --- |
| UT-01 | Cadastro aceita dados válidos | Filme 22, título Homem Lata, pôster relativo, nota 9,78 | Chamar `cadastrar` e consultar o mock do DAO | Preserva título e nota e chama DAO uma vez | Título e nota preservados. Uma chamada ao DAO | Aprovado |
| UT-02 | Cadastro rejeita pôster absoluto | Filme válido com URL HTTPS inteira em `poster_path` | Chamar `cadastrar` e observar a rejeição | Erro de caminho do pôster inválido | Mensagem de caminho inválido | Aprovado |
| CT-01 | Tipo aceito por partição válida | `serie` | Substituir tipo e chamar `cadastrar` | Aceita e retorna `serie` | Retornou `serie` | Aprovado |
| CT-02 | Tipo rejeitado por partição inválida | `novela` | Substituir tipo e chamar `cadastrar` | Erro de tipo inválido | Mensagem exige filme ou série | Aprovado |
| CT-03 | Nota abaixo do mínimo | `-0.1` | Substituir nota e chamar `cadastrar` | Rejeita por faixa de nota | Mensagem exige nota entre 0 e 10 | Aprovado |
| CT-04 | Nota no limite inferior | `0` | Substituir nota e chamar `cadastrar` | Aceita e preserva 0 | Retornou 0 | Aprovado |
| CT-05 | Nota no limite superior | `10` | Substituir nota e chamar `cadastrar` | Aceita e preserva 10 | Retornou 10 | Aprovado |
| CT-06 | Nota acima do máximo | `10.1` | Substituir nota e chamar `cadastrar` | Rejeita por faixa de nota | Mensagem exige nota entre 0 e 10 | Aprovado |

## Middlewares e localização das séries

Pré-condição comum: Jest carregado. Middlewares recebem objetos de requisição, resposta e `next` controlados. Na localização, TMDB devolve a fixture de Os Simpsons.

Implementação: [middlewares.test.js](../tests/unit/middlewares.test.js) (UT-03 a UT-05) e [serieIdioma.test.js](../tests/unit/serieIdioma.test.js) (UT-06 a UT-12).

| ID | Funcionalidade e objetivo | Entrada | Passos | Esperado | Obtido | Status |
| --- | --- | --- | --- | --- | --- | --- |
| UT-03 | Rota protegida bloqueia visitante | Sessão vazia | Executar `exigeLogin` | 401 e nenhuma chamada a `next` | 401. `next` não chamado | Aprovado |
| UT-04 | Rota protegida aceita sessão | Usuário 1 na sessão | Executar `exigeLogin` | Chama `next` sem erro | `next` chamado e nenhum status de erro | Aprovado |
| UT-05 | Rota ausente cria erro HTTP | GET `/api/inexistente` | Executar `rotaNaoEncontrada` | Encaminha 404 com método e rota | Erro 404 com método e rota | Aprovado |
| UT-06 | Séries populares em português | Página 2 | Listar populares no DAO de séries | `/tv/popular`, página 2, `pt-BR`, fixture preservada | Caminho, filtros e retorno conferidos | Aprovado |
| UT-07 | Séries Marvel em português | Página 2 | Listar Marvel no DAO | `/discover/tv`, página 2, produtoras Marvel, ordem por popularidade e `pt-BR` | Caminho, filtros e retorno conferidos | Aprovado |
| UT-08 | Busca mantém consulta e idioma | Lei & Ordem, página 2 | Buscar por nome no DAO | `/search/tv`, consulta íntegra, página 2 e `pt-BR` | Caminho, filtros e retorno conferidos | Aprovado |
| UT-09 | Detalhes em português | Série 456 | Consultar detalhes no DAO | `/tv/456`, `pt-BR`, fixture preservada | URL e retorno conferidos | Aprovado |
| UT-10 | Temporada especial em português | Série 456, temporada 0 | Consultar temporada no DAO | `/tv/456/season/0` com `pt-BR` | URL e retorno conferidos | Aprovado |
| UT-11 | Episódio em português | Série 456, temporada 1, episódio 2 | Consultar episódio no DAO | `/tv/456/season/1/episode/2` com `pt-BR` | URL e retorno conferidos | Aprovado |
| UT-12 | Detalhes preservam o contrato localizado | Série 456 com nome, sinopse e temporadas na fixture | Chamar `service.buscarPorId` | Retorna `nome`, `sinopse` e `temporadas` sem chave `name` | Campos localizados e ID preservados | Aprovado |

## Navegação do frontend

Pré-condição comum: Node Test Runner carregado. Os testes executam os utilitários do React sem navegador. Implementação: [navegacao.test.js](../frontend/src/utils/navegacao.test.js).

| ID | Funcionalidade e objetivo | Entrada | Passos | Esperado | Obtido | Status |
| --- | --- | --- | --- | --- | --- | --- |
| FE-01 | Comentário leva ao ID da obra | Comentário ID 7, obra 155, tipo filme ou série | Montar link para cada tipo | Hash usa ID 155 e caminho do tipo | `#filmes/155` e `#series/155` | Aprovado |
| FE-02 | Link direto abre detalhes | `#filmes/155`, `#series/1399` | Interpretar os hashes | Resolve página e ID de cada obra | Filmes/155 e séries/1399 | Aprovado |
| FE-03 | Rotas principais permanecem acessíveis | Hash vazio, séries, perfil e admin | Interpretar cada hash | Abre página correspondente sem ID | Filmes, séries, perfil e admin sem ID | Aprovado |
| FE-04 | Link inválido não abre obra | IDs alfabético, negativo, zero, caminho extra ou página desconhecida | Interpretar os hashes inválidos | Nenhum ID de detalhe. Página desconhecida volta a filmes | IDs nulos e fallback de filmes | Aprovado |
| FE-05 | Link exige tipo e ID de conteúdo válidos | Tipo anime, constructor, vazio ou sem `conteudo_id` | Montar link de cada entrada | Nenhum link | Retornou nulo em todas as entradas | Aprovado |

## Integração da API com PostgreSQL

Pré-condição de INT-01 a INT-03: Express carregado pelo Supertest, PostgreSQL configurado e requisições sem sessão. Implementação: [integracao.test.js](../tests/integration/integracao.test.js).

Pré-condição de INT-04 a INT-10: uma conexão real reservada em transação, tabelas temporárias criadas pelo esquema do projeto, `search_path` restrito a `pg_temp`, tabela de sessões temporária e admin de teste preparado. O Supertest mantém o cookie de cada perfil. O final da suíte executa `ROLLBACK`. Implementação: [contasCatalogo.test.js](../tests/integration/contasCatalogo.test.js).

| ID | Funcionalidade e objetivo | Entrada | Passos | Esperado | Obtido | Status |
| --- | --- | --- | --- | --- | --- | --- |
| INT-01 | Catálogo consulta PostgreSQL | Catálogo real de leitura, sem filtro | GET `/api/catalogo` | 200 e lista JSON | 200 com array | Aprovado |
| INT-02 | Filtro de catálogo valida tipo | `tipo=anime` | GET `/api/catalogo?tipo=anime` | 400 com erro de tipo | 400, mensagem exige filme ou série | Aprovado |
| INT-03 | Visitante não cadastra título | Filme 22, sem sessão | POST `/api/admin/catalogo` | 401 e mensagem de autenticação | 401 com erro esperado | Aprovado |
| INT-04 | Cadastro público mantém papel comum | Nome, e-mail fictício, senha gerada e `papel: admin` | POST `/api/cadastro` e inspecionar o usuário retornado | 201, papel `usuario`, sem hash de senha | 201, papel comum e hash ausente | Aprovado |
| INT-05 | Cliente entra e consulta o próprio perfil | Cliente criado via API | POST login, guardar cookie e GET perfil no mesmo agente | 200, cookie HttpOnly e perfil com mesmo ID, nome, e-mail e papel | Login e perfil 200. Cookie e identidade conferidos | Aprovado |
| INT-06 | Cliente não faz operações administrativas | Cliente logado, filme 22 e ID 1 para edição/desativação | Enviar POST, PUT e DELETE ao catálogo admin | 403 nos três métodos | Três 403 com erro de permissão | Aprovado |
| INT-07 | Admin entra com o papel correto | Conta admin temporária | POST login, guardar cookie e GET perfil | 200 nos dois, cookie HttpOnly e papel `admin` | Sessão mantida e papel admin confirmado | Aprovado |
| INT-08 | Admin executa CRUD de catálogo | Filme 22, título inicial e título editado | POST, GET pelo ID interno, PUT, novo GET, DELETE e novo GET | 201 na criação, 200 nas leituras/edição/desativação e 404 após desativar | Títulos conferidos, `ativo: false` no DELETE e 404 público final | Aprovado |
| INT-09 | Logout invalida a sessão anterior | Cliente autenticado e cookie emitido | POST logout, GET perfil e novo GET com o cookie anterior | Logout 200 e ambos os perfis 401 | 200 no logout. 401 sem cookie e com cookie antigo | Aprovado |
| INT-10 | Regressão da validação do ID TMDB | Admin em sessão e `tmdb_id: true` | POST `/api/admin/catalogo` | 400, ID do TMDB inválido | 400 com a mensagem esperada | Aprovado |

## Contratos HTTP

Pré-condição comum: Express carregado pelo Supertest, sem sessão. Implementação: [rotasApi.test.js](../tests/api/rotasApi.test.js).

| ID | Funcionalidade e objetivo | Entrada | Passos | Esperado | Obtido | Status |
| --- | --- | --- | --- | --- | --- | --- |
| API-01 | Rota desconhecida informa recurso ausente | GET `/api/rota-inexistente` | Fazer a requisição e inspecionar corpo | 404 e campo `erro` | 404 com campo `erro` | Aprovado |
| API-02 | Login rejeita JSON malformado | JSON incompleto com Content-Type JSON | POST `/api/login` | 400 com erro de JSON inválido | 400 e mensagem esperada | Aprovado |
| API-03 | Perfil exige autenticação | Sem cookie | GET `/api/perfil` | 401 e erro de autenticação | 401 com erro esperado | Aprovado |
| API-04 | Busca de filme exige consulta | Sem parâmetro de busca | GET `/api/filmes/buscar` | 400 e pedido de nome do filme | 400 e mensagem esperada | Aprovado |
| API-05 | Cadastro exige senha de oito caracteres | Nome e e-mail válidos, senha `123` | POST `/api/cadastro` | 400 por senha curta | 400 e mensagem de tamanho mínimo | Aprovado |

## Fluxos no navegador

Pré-condição comum: Express e Vite iniciados com integração real a PostgreSQL e TMDB. Usuário visitante. Os testes observam as respostas da API via Cypress. Nos cenários de filmes e séries, a grade inicial deve carregar antes da interação.

Implementação: [filmes](../tests/cypress/e2e/01-filmes.cy.js) (E2E-01 a 05), [séries](../tests/cypress/e2e/02-series.cy.js) (E2E-06 a 09), [formulários](../tests/cypress/e2e/03-formularios.cy.js) (E2E-10 a 15) e [navegação](../tests/cypress/e2e/04-navegacao.cy.js) (E2E-16 a 19).

| ID | Funcionalidade e objetivo | Entrada | Passos | Esperado | Obtido | Status |
| --- | --- | --- | --- | --- | --- | --- |
| E2E-01 | Inicial lista filmes com nota no local correto | Catálogo de populares | Abrir Filmes, esperar a API e inspecionar o primeiro cartão | Título e nota nos metadados, fora do pôster, com Anterior desativado | Página, cartão, nota e paginação conferidos | Aprovado |
| E2E-02 | Busca exibe resposta da API | Batman | Digitar a consulta e enviar | 200, resultado e primeiro título igual ao da API | Consulta e primeiro resultado coincidiram | Aprovado |
| E2E-03 | Busca sem resultados mostra estado vazio | `zzzxqvvtcine987654321` | Enviar busca e conferir resposta | Lista vazia, mensagem e nenhum cartão | Estado vazio visível | Aprovado |
| E2E-04 | Busca em branco é rejeitada na interface | Três espaços | Enviar busca e observar requisições | Alerta e zero chamadas de busca | Alerta exibido sem chamada | Aprovado |
| E2E-05 | Filtro Marvel pagina o catálogo | Marvel, página 2 | Selecionar filtro e avançar | Filtro ativo, 200 na página 2 e primeiro cartão condizente | Segunda página, cartão e botão Anterior conferidos | Aprovado |
| E2E-06 | Séries exibem nome localizado e nota | Séries populares | Abrir Séries e comparar o primeiro cartão à API | 200, título da API e nota abaixo do pôster | Título e nota conferidos | Aprovado |
| E2E-07 | Busca encontra série em português | Os Simpsons | Enviar busca em Séries | 200 com consulta enviada e título Os Simpsons visível | 200 e título em português | Aprovado |
| E2E-08 | Detalhes retornam à grade | Primeira série da lista | Abrir a série e clicar em Voltar | Título nos detalhes e cartões na grade de Séries | Detalhes e retorno conferidos | Aprovado |
| E2E-09 | Consulta temporada e episódio | Série 456, temporada 1, episódio 1 | Abrir série, consultar temporada e depois episódio | Temporada e episódio 200 com títulos exibidos | Temporada não vazia e títulos conferidos | Aprovado |
| E2E-10 | Campos obrigatórios bloqueiam login vazio | Formulário vazio | Clicar em Entrar | Validação nativa `valueMissing` e nenhum POST | Campo obrigatório e zero requisições | Aprovado |
| E2E-11 | E-mail inválido bloqueia envio | `email-invalido` e senha de teste | Preencher e enviar | `typeMismatch` e nenhum POST | Formato inválido e zero requisições | Aprovado |
| E2E-12 | Login inexistente mostra erro real | E-mail fictício inexistente e senha de teste | Enviar login | 401, mensagem de credenciais inválidas e sem usuário logado | 401, alerta e botão reabilitado | Aprovado |
| E2E-13 | Usuário navega entre os formulários | Página de login | Clicar Criar conta e depois Já tenho uma conta | Hash e título corretos nas duas telas | Cadastro e login renderizados | Aprovado |
| E2E-14 | Cadastro bloqueia senha curta | Dados fictícios e senha `curta` | Preencher, verificar tamanho mínimo e enviar | 400 e mensagem de oito caracteres | Atributo mínimo 8, 400 e alerta | Aprovado |
| E2E-15 | Cadastro bloqueia senhas diferentes | Senha e confirmação divergentes | Enviar cadastro | Alerta de divergência e nenhum POST | Alerta exibido e zero requisições | Aprovado |
| E2E-16 | Recarregar link mantém detalhes do filme | Batman, ID 155 | Abrir link, recarregar e voltar ao catálogo | 200, mesmo hash e título, retorno à grade | Detalhes preservados, favorito indisponível a visitante e retorno conferido | Aprovado |
| E2E-17 | Visitante não abre perfil | `#perfil` | Visitar rota sem sessão | 401 e tela Entrar | 401 e formulário de login | Aprovado |
| E2E-18 | Visitante não abre o painel admin | `#admin` | Visitar rota sem sessão | 401, aviso e nenhum formulário admin | 401, acesso restrito e painel ausente | Aprovado |
| E2E-19 | Busca móvel funciona sem rolagem horizontal | Tela 390 × 844 e Os Simpsons | Abrir filmes, trocar para séries, buscar e medir a largura | APIs 200, título visível e largura até 390 px | Busca exibida e largura dentro do limite | Aprovado |
