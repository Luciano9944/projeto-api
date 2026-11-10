# CineMarvel

Catálogo de filmes e séries para o trabalho semestral de Programação para Web Avançada. A interface consulta metadados do TMDB e permite que o grupo mantenha seu próprio catálogo de conteúdos e mídias.

- [Aplicação na Vercel](https://cinemarvel-frontend.vercel.app/)
- [API publicada · consulta do catálogo](https://cinemarvel.vercel.app/api/catalogo)
- [Repositório do projeto](https://github.com/Luciano9944/projeto-api)

## Funcionalidades e perfis

| Acesso | Funcionalidades |
| --- | --- |
| Visitante | Consulta, busca e paginação de filmes e séries, detalhes, temporadas e episódios. |
| Usuário autenticado | Favoritos, publicação e gerenciamento dos próprios comentários e perfil com suas interações. |
| Administrador | Busca de títulos no TMDB, cadastro, edição e desativação de itens do catálogo e gerenciamento das mídias vinculadas. |

O cadastro público cria contas com papel `usuario`. As operações de administração passam por `exigeLogin` e `exigeAdmin`. O segundo middleware consulta o papel e o estado da conta no PostgreSQL. Um visitante recebe `401`. Uma conta comum autenticada recebe `403` ao chamar uma rota de administração.

## Tecnologias e arquitetura

React e Vite compõem a interface. Node.js e Express expõem a API. O PostgreSQL no Neon guarda usuários, sessões e os registros do catálogo. O TMDB fornece pôsteres e informações de filmes e séries.

~~~text
React → rota Express → middlewares → controller → service → repository → PostgreSQL
                                             ↘ resposta HTTP em JSON
~~~

No fluxo de catálogo, a rota seleciona o controller, o service valida os dados e o repository exerce a função de DAO por meio de SQL parametrizado. A resposta JSON é a camada View/Response da API. Na autenticação, o controller coordena a validação de senha e sessão, e o `UsuarioRepository` concentra as consultas à tabela de usuários.

- `frontend/src/pages/` e `frontend/src/components/` contêm as telas e a interface.
- `frontend/src/services/` concentra as chamadas HTTP.
- `src/routes/`, `src/controllers/`, `src/services/` e `src/repositories/` separam roteamento, resposta, regras e acesso a dados.
- `src/middlewares/` aplica autorização, limite de requisições e tratamento de erros.
- `src/config/` configura PostgreSQL e TMDB. `database/schema.sql` contém a estrutura inicial do banco.
- `server.js` inicia o backend local. `src/index.js` exporta o app Express para a Vercel.

### Dados e sessão

`usuarios` é a referência para favoritos e comentários. `conteudo_midias` relaciona o ID interno de `conteudos_catalogo` ao ID de `midias`. A gravação de mídia e vínculo ocorre em uma transação. O ID do TMDB identifica a obra externa e é usado com o tipo nas interações. O ID interno identifica um registro do catálogo para edição, desativação e vínculos.

O login verifica a senha com bcrypt, regenera a sessão e armazena seus dados em `sessoes` com `connect-pg-simple`. O navegador recebe o cookie `cinecatalog.sid`, com `HttpOnly` e validade de 24 horas. Em produção o cookie é `Secure`. O logout destrói a sessão. No Express, `FRONTEND_URL` define a origem autorizada pelo CORS com `credentials: true`. Os serviços autenticados do React enviam `credentials: 'include'`.

## Instalação e execução local

Use Node.js 24, npm, uma conexão PostgreSQL e um token de leitura do TMDB. Em um banco vazio, execute [database/schema.sql](database/schema.sql) pelo editor SQL do Neon ou por um cliente PostgreSQL. O arquivo cria as tabelas da aplicação sem registros. A tabela de sessões é criada quando o armazenamento de sessões é usado.

Em um clone novo, copie `.env.example` para `.env` e configure as variáveis. Mantenha as credenciais no ambiente local ou no painel da hospedagem.

| Variável | Uso |
| --- | --- |
| `DATABASE_URL_POOLED` | String de conexão com pool do PostgreSQL no Neon. |
| `SESSION_SECRET` | Segredo usado para assinar o cookie de sessão. |
| `TMDB_BEARER_TOKEN` | Token de leitura da API externa. |
| `FRONTEND_URL` | Origem autorizada no CORS. Use `http://localhost:5174` com os comandos abaixo. |
| `PORT` | Porta local do backend. O padrão é `3000`. |

~~~powershell
npm ci
npm ci --prefix frontend
~~~

Em dois terminais na raiz do projeto:

~~~powershell
# Terminal 1
npm start

# Terminal 2
npm run dev --prefix frontend -- --port 5174 --strictPort
~~~

Abra [http://localhost:5174](http://localhost:5174). O Vite encaminha `/api` para `http://localhost:3000`. A API direta também fica disponível em `http://localhost:3000/api`.

## API REST

Base pública: `https://cinemarvel.vercel.app/api`. Acrescente `/api` antes dos caminhos abaixo ao chamar o servidor. Requisições com corpo usam `Content-Type: application/json`. As respostas de erro têm o formato `{"erro":"mensagem"}`.

### Conta, perfil e interações

| Método e caminho | Acesso | Exemplo de entrada | Resposta de sucesso |
| --- | --- | --- | --- |
| `POST /cadastro` | Público | `{"nome":"Cliente de teste","email":"cliente@example.invalid","senha":"<senha de demonstração>"}` | `201` com `mensagem` e `usuario`. |
| `POST /login` | Público | `{"email":"cliente@example.invalid","senha":"<senha de demonstração>"}` | `200` com `usuario` e `Set-Cookie`. |
| `POST /logout` | Sessão | Cookie de sessão | `200` com `mensagem`. |
| `GET /perfil` | Sessão | Cookie de sessão | `200` com `autenticado` e `usuario`. |
| `GET /perfil/detalhado` | Sessão | Cookie de sessão | `200` com `usuario`, `favoritos` e `comentarios`. |
| `GET /favoritos` | Sessão | Cookie de sessão | `200` com `total` e `favoritos`. |
| `POST /favoritos` | Sessão | `{"tipo_conteudo":"serie","conteudo_id":"84958"}` | `201` ao criar ou `200` se já existe. |
| `GET /favoritos/:tipo/:conteudoId` | Sessão | `/favoritos/serie/84958` | `200`, por exemplo `{"favoritado":true}`. |
| `DELETE /favoritos/:tipo/:conteudoId` | Sessão | `/favoritos/serie/84958` | `200` com `mensagem`. |
| `GET /comentarios/:tipo/:conteudoId` | Público | `/comentarios/serie/84958` | `200` com `total` e `comentarios`. |
| `GET /meus-comentarios` | Sessão | Cookie de sessão | `200` com `total` e `comentarios`. |
| `POST /comentarios` | Sessão | `{"tipo_conteudo":"serie","conteudo_id":"84958","texto":"Comentário de demonstração"}` | `201` com `mensagem` e `comentario`. |
| `PUT /comentarios/:id` | Autor | `{"texto":"Comentário atualizado"}` | `200` com o comentário atualizado. |
| `DELETE /comentarios/:id` | Autor | ID do comentário no caminho | `200` com `mensagem`. |

### Consulta ao TMDB

Rotas públicas `GET`. As listagens paginadas retornam `results` e metadados de paginação.

| Caminhos | Exemplo de entrada | Resposta `200` |
| --- | --- | --- |
| `/filmes/populares`, `/filmes/marvel` | `/filmes/populares?page=1` | Lista paginada de filmes. |
| `/filmes/buscar` | `/filmes/buscar?query=Batman&page=1` | Filmes que correspondem à busca. |
| `/filmes/empresas-marvel`, `/filmes/palavras-chave-marvel` | `?query=Marvel&page=1` | Empresas ou palavras-chave, conforme a rota. |
| `/filmes/:id` | `/filmes/155` | Objeto com detalhes do filme. |
| `/filmes/:id/elenco`, `/filmes/:id/equipe` | `/filmes/155/elenco` | Elenco ou equipe do filme. |
| `/series/populares`, `/series/marvel` | `/series/populares?page=1` | Lista paginada de séries. |
| `/series/buscar` | `/series/buscar?query=Loki&page=1` | Séries que correspondem à busca. |
| `/series/:id` | `/series/84958` | Detalhes com `nome`, `sinopse`, temporadas e episódios. |
| `/series/:id/elenco`, `/series/:id/equipe` | `/series/84958/elenco` | Elenco ou equipe da série. |
| `/series/:id/temporadas/:temporada` | `/series/84958/temporadas/1` | Objeto da temporada com episódios. |
| `/series/:id/temporadas/:temporada/episodios/:episodio` | `/series/84958/temporadas/1/episodios/1` | Objeto com detalhes do episódio. |

### Catálogo e mídias

| Método e caminho | Acesso | Exemplo de entrada | Resposta de sucesso |
| --- | --- | --- | --- |
| `GET /catalogo` | Público | `/catalogo?tipo=serie` | `200` com array de itens ativos e suas mídias. |
| `GET /catalogo/:id` | Público | ID interno do conteúdo | `200` com o registro. |
| `GET /midias` | Público | Sem corpo | `200` com array de mídias ativas. |
| `GET /midias/:id` | Público | ID interno da mídia | `200` com a mídia. |
| `GET /midias/conteudo/:conteudoId` | Público | ID interno do conteúdo | `200` com as mídias associadas. |
| `GET /admin/catalogo/pesquisar` | Admin | `?tipo=serie&consulta=Loki` | `200` com títulos do TMDB para importação. |
| `POST /admin/catalogo` | Admin | `{"tipo_conteudo":"serie","tmdb_id":84958,"titulo":"Loki"}` | `201` com o registro. |
| `PUT /admin/catalogo/:id` | Admin | `{"titulo":"Loki","sinopse":"Sinopse revisada"}` | `200` com o registro atualizado. |
| `DELETE /admin/catalogo/:id` | Admin | ID interno do conteúdo | `200` com `mensagem` e `conteudo.ativo: false`. |
| `POST /admin/midias` | Admin | Campos `titulo`, `google_drive_file_id`, `conteudo_id`. Para séries, informe `temporada` e `episodio`. | `201` com a mídia vinculada. |
| `PUT /admin/midias/:id` | Admin | ID da mídia e JSON dos dados editados | `200` com a mídia atualizada. |
| `DELETE /admin/midias/:id` | Admin | ID interno da mídia | `200` com mensagem e registro desativado. |

Exemplo de resposta sem sessão em `GET /api/perfil`, com status `401`:

~~~json
{
  "erro": "É necessário estar autenticado para continuar."
}
~~~

Exemplo de resposta à verificação de favorito com sessão, com status `200`:

~~~json
{
  "favoritado": false
}
~~~

Outros casos demonstráveis incluem `400` por dados inválidos, `403` por falta de permissão, `404` para recurso ou rota inexistente e `409` por e-mail ou título já cadastrado.

## Deploy na Vercel

A aplicação publicada usa dois projetos. Para publicar esta revisão com essa estrutura:

1. No projeto da API, use a raiz do repositório. A Vercel detecta o Express e carrega `src/index.js`. Em **Production**, configure `DATABASE_URL_POOLED`, `SESSION_SECRET`, `TMDB_BEARER_TOKEN` e `FRONTEND_URL=https://cinemarvel-frontend.vercel.app`.
2. No projeto de interface, use `frontend` como **Root Directory** e o preset Vite. Se `VITE_API_URL` estiver configurada, o frontend usa essa URL como base, incluindo o sufixo `/api`. Sem essa variável, o [frontend/vercel.json](frontend/vercel.json) encaminha as chamadas relativas `/api/*` para a API publicada pelo domínio da interface.
3. Após publicar os dois projetos, confira a interface, `/api/catalogo` e o login após recarregar a página. Use os logs da Vercel para diagnosticar falhas de ambiente.

## Contas de demonstração

A entrega para a professora deve acompanhar **dois acessos de teste**. O grupo mantém as credenciais em material privado de entrega, fora do Git e dos slides.

| Perfil | Acesso a entregar | Demonstração |
| --- | --- | --- |
| Cliente | E-mail e senha da conta comum de demonstração. | Login, favoritos, comentários e perfil. |
| Administrador | E-mail e senha da conta de teste admin fornecida pelo grupo. | Importar, editar e desativar um item de demonstração e gerenciar mídias. |

Use perfis separados do navegador. Confira o bloqueio `403` da conta comum em uma rota admin e o acesso administrativo da segunda conta.

## Verificações de desenvolvimento

~~~powershell
npm test -- --runInBand
npm run lint --prefix frontend
npm run build --prefix frontend
npm test --prefix frontend
~~~

Com frontend e backend locais ligados, `npm run test:e2e:open` abre o Cypress. As evidências da disciplina de testes são mantidas separadas da apresentação de Programação para Web Avançada.
