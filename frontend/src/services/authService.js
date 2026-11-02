
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

// Cria uma conta de usuário comum.
export async function cadastrarUsuario(nome, email, senha) {
    return requisitar('/cadastro', {
        method: 'POST',
        body: JSON.stringify({ nome, email, senha })
    });
}

// Realiza o login.
export async function realizarLogin(email, senha) {
    return requisitar('/login', {
        method: 'POST',
        body: JSON.stringify({ email, senha })
    });
}

// Consulta os dados da sessão.
export async function buscarPerfil() {
    return requisitar('/perfil');
}

// Encerra a sessão.
export async function realizarLogout() {
    return requisitar('/logout', {
        method: 'POST'
    });
}
