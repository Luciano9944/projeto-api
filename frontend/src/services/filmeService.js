
const API_URL = 'http://localhost:3000/api/filmes';

async function requisitar(url) {
    const resposta = await fetch(url);
    const dados = await resposta.json();

    if (!resposta.ok) {
        throw new Error(dados.erro || 'Erro ao consultar o catálogo');
    }

    return dados;
}

export async function listarPopulares(pagina = 1) {
    return requisitar(`${API_URL}/populares?page=${pagina}`);
}

export async function buscarFilmes(query, pagina = 1) {
    const parametros = new URLSearchParams({
        query,
        page: pagina
    });

    return requisitar(`${API_URL}/buscar?${parametros}`);
}

export async function listarMarvel(pagina = 1) {
    return requisitar(`${API_URL}/marvel?page=${pagina}`);
}

export async function buscarFilme(id) {
    return requisitar(`${API_URL}/${id}`);
}
