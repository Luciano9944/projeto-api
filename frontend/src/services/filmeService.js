const API_URL = 'http://localhost:3000/api/filmes';

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