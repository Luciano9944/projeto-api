
const API_URL = 'http://localhost:3000/api/filmes';
const API_CATALOGO = 'http://localhost:3000/api/catalogo';

async function requisitar(url) {
    let resposta;

    try {
        resposta = await fetch(url);
    } catch {
        throw new Error(
            'Não foi possível conectar ao servidor da API.'
        );
    }

    const texto = await resposta.text();
    let dados = null;

    if (texto.trim()) {
        try {
            dados = JSON.parse(texto);
        } catch {
            throw new Error(
                `A API retornou uma resposta inválida (HTTP ${resposta.status}).`
            );
        }
    }

    if (!resposta.ok) {
        throw new Error(
            dados?.erro ||
            dados?.mensagem ||
            `Erro ao consultar a API (HTTP ${resposta.status}).`
        );
    }

    if (dados === null) {
        throw new Error(
            'A API retornou uma resposta vazia.'
        );
    }

    return dados;
}

// Consulta filmes populares no TMDB.
export async function listarPopulares(pagina = 1) {
    return requisitar(`${API_URL}/populares?page=${pagina}`);
}

// Pesquisa filmes no TMDB.
export async function buscarFilmes(query, pagina = 1) {
    const parametros = new URLSearchParams({
        query,
        page: pagina
    });

    return requisitar(`${API_URL}/buscar?${parametros}`);
}

// Consulta filmes da Marvel no TMDB.
export async function listarMarvel(pagina = 1) {
    return requisitar(`${API_URL}/marvel?page=${pagina}`);
}

// Busca detalhes de um filme no TMDB.
export async function buscarFilme(id) {
    return requisitar(`${API_URL}/${id}`);
}

// Busca o elenco de um filme.
export async function buscarElenco(id) {
    return requisitar(`${API_URL}/${id}/elenco`);
}

// Busca a equipe técnica de um filme.
export async function buscarEquipe(id) {
    return requisitar(`${API_URL}/${id}/equipe`);
}

// Lista os filmes cadastrados no catálogo próprio.
export async function listarFilmesCatalogo() {
    return requisitar(`${API_CATALOGO}?tipo=filme`);
}
