const API_URL = 'http://localhost:3000/api/admin/catalogo';
const API_PUBLICA = 'http://localhost:3000/api/catalogo';

async function requisitar(url, opcoes = {}) {
    let resposta;

    try {
        resposta = await fetch(url, {
            ...opcoes,
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                ...opcoes.headers
            }
        });
    } catch {
        throw new Error('Não foi possível conectar ao servidor.');
    }

    const texto = await resposta.text();

    let dados;

    try {
        dados = texto ? JSON.parse(texto) : null;
    } catch {
        throw new Error('O servidor retornou uma resposta inválida.');
    }

    if (!resposta.ok) {
        throw new Error(
            dados?.mensagem ||
            dados?.erro ||
            `Erro HTTP ${resposta.status}.`
        );
    }

    return dados;
}

export async function pesquisarNoTmdb(tipo, consulta) {
    const parametros = new URLSearchParams({
        tipo,
        consulta
    });

    return requisitar(
        `${API_URL}/pesquisar?${parametros.toString()}`
    );
}

export async function cadastrarNoCatalogo(item) {
    return requisitar(API_URL, {
        method: 'POST',
        body: JSON.stringify(item)
    });
}

export async function listarCatalogo(tipo = '') {
    const parametros = new URLSearchParams();

    if (tipo) {
        parametros.set('tipo', tipo);
    }

    const query = parametros.toString();

    return requisitar(
        `${API_PUBLICA}${query ? `?${query}` : ''}`
    );
}

export async function atualizarConteudo(id, dados) {
    return requisitar(`${API_URL}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(dados)
    });
}

export async function desativarConteudo(id) {
    return requisitar(`${API_URL}/${id}`, {
        method: 'DELETE'
    });
}