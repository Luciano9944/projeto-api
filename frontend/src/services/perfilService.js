
const API_URL = '/api';

export async function buscarPerfilDetalhado() {
    let resposta;

    try {
        resposta = await fetch(`${API_URL}/perfil/detalhado`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
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
            dados?.erro ||
            dados?.mensagem ||
            `Erro HTTP ${resposta.status}.`
        );
    }

    return dados;
}
