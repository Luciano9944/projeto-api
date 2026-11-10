
const API_URL = import.meta.env.VITE_API_URL || '/api';

async function requisitar(endpoint, opcoes = {}) {
    let resposta;

    try {
        resposta = await fetch(`${API_URL}${endpoint}`, {
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
        const erro = new Error(
            dados?.erro ||
            dados?.mensagem ||
            `Erro HTTP ${resposta.status}.`
        );
        erro.status = resposta.status;
        throw erro;
    }

    return dados;
}

// Consulta se o conteúdo está nos favoritos.
export async function verificarFavorito(tipo, conteudoId) {
    return requisitar(`/favoritos/${tipo}/${conteudoId}`);
}

// Adiciona um conteúdo aos favoritos.
export async function adicionarFavorito(tipo, conteudoId) {
    return requisitar('/favoritos', {
        method: 'POST',
        body: JSON.stringify({
            tipo_conteudo: tipo,
            conteudo_id: String(conteudoId)
        })
    });
}

// Remove um conteúdo dos favoritos.
export async function removerFavorito(tipo, conteudoId) {
    return requisitar(`/favoritos/${tipo}/${conteudoId}`, {
        method: 'DELETE'
    });
}

// Lista os comentários de um conteúdo.
export async function listarComentarios(tipo, conteudoId) {
    return requisitar(`/comentarios/${tipo}/${conteudoId}`);
}

// Publica um comentário.
export async function criarComentario(tipo, conteudoId, texto) {
    return requisitar('/comentarios', {
        method: 'POST',
        body: JSON.stringify({
            tipo_conteudo: tipo,
            conteudo_id: String(conteudoId),
            texto
        })
    });
}

// Atualiza um comentário.
export async function atualizarComentario(id, texto) {
    return requisitar(`/comentarios/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ texto })
    });
}

// Exclui um comentário.
export async function excluirComentario(id) {
    return requisitar(`/comentarios/${id}`, {
        method: 'DELETE'
    });
}
