const API_URL = 'http://localhost:3000';

export async function fazerLogin(access_token) {
    const resposta = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
            access_token
        })
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
        throw new Error(dados.erro || 'Erro ao fazer login');
    }

    return dados;
}

export async function fazerLogout() {
    const resposta = await fetch(`${API_URL}/logout`, {
        method: 'POST',
        credentials: 'include'
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
        throw new Error(dados.erro || 'Erro ao fazer logout');
    }

    return dados;
}