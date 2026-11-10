
const API_URL = `${import.meta.env.VITE_API_URL || '/api'}/series`;
const API_CATALOGO = `${import.meta.env.VITE_API_URL || '/api'}/catalogo`;

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

export async function listarMarvel(pagina = 1) {
    return requisitar(`${API_URL}/marvel?page=${pagina}`);
}

export async function buscarPorNome(query, pagina = 1) {
    const parametros = new URLSearchParams({
        query,
        page: pagina
    });

    return requisitar(`${API_URL}/buscar?${parametros}`);
}

export async function buscarPorId(id) {
    return requisitar(`${API_URL}/${id}`);
}

export async function buscarTemporada(id, temporada) {
    return requisitar(
        `${API_URL}/${id}/temporadas/${temporada}`
    );
}

export async function buscarEpisodio(id, temporada, episodio) {
    return requisitar(
        `${API_URL}/${id}/temporadas/${temporada}/episodios/${episodio}`
    );
}

export async function buscarElenco(id) {
    return requisitar(`${API_URL}/${id}/elenco`);
}

export async function buscarEquipe(id) {
    return requisitar(`${API_URL}/${id}/equipe`);
}

// Lista as séries cadastradas no catálogo próprio.
export async function listarSeriesCatalogo() {
    return requisitar(`${API_CATALOGO}?tipo=serie`);
}
