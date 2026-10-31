const API_URL = 'http://localhost:3000/api';

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
    let dados = null;

    try {
        dados = texto ? JSON.parse(texto) : null;
    } catch {
        throw new Error('O servidor retornou uma resposta inválida.');
    }

    if (!resposta.ok) {
        throw new Error(
            dados?.erro ||
            dados?.mensagem ||
            `Erro HTTP ${resposta.status}.`
        );
    }

    return dados;
}

export async function realizarLogin(email, senha) {
    return requisitar('/login', {
        method: 'POST',
        body: JSON.stringify({ email, senha })
    });
}

export async function buscarPerfil() {
    return requisitar('/perfil');
}

export async function realizarLogout() {
    return requisitar('/logout', {
        method: 'POST'
    });
}