const API_URL = 'http://localhost:3000/api';

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

// Lista todas as mídias ativas de um conteúdo.
export async function listarMidiasPorConteudo(conteudoId) {
    return requisitar(
        `${API_URL}/midias/conteudo/${conteudoId}`
    );
}

// Cadastra uma mídia e associa ao conteúdo.
export async function cadastrarMidia(dados) {
    return requisitar(`${API_URL}/admin/midias`, {
        method: 'POST',
        body: JSON.stringify(dados)
    });
}

// Atualiza uma mídia existente.
export async function atualizarMidia(id, dados) {
    return requisitar(`${API_URL}/admin/midias/${id}`, {
        method: 'PUT',
        body: JSON.stringify(dados)
    });
}

// Desativa uma mídia.
export async function desativarMidia(id) {
    return requisitar(`${API_URL}/admin/midias/${id}`, {
        method: 'DELETE'
    });
}