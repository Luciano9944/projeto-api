
import { useState } from 'react';

import {
    realizarLogin,
    buscarPerfil
} from '../services/authService';

function Login({ onLogin, onCadastro }) {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [mensagem, setMensagem] = useState('');
    const [carregando, setCarregando] = useState(false);

    async function entrar(event) {
        event.preventDefault();

        if (!email.trim() || !senha) {
            setMensagem('Informe o e-mail e a senha.');
            return;
        }

        try {
            setCarregando(true);
            setMensagem('');

            await realizarLogin(email, senha);

            const dados = await buscarPerfil();

            onLogin(dados.usuario);

            setEmail('');
            setSenha('');
        } catch (erro) {
            setMensagem(erro.message);
        } finally {
            setCarregando(false);
        }
    }

    return (
        <section className="login">
            <h2>Entrar na conta</h2>

            <form className="login-form" onSubmit={entrar}>
                <input
                    type="email"
                    placeholder="E-mail"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />

                <input
                    type="password"
                    placeholder="Senha"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    required
                />

                <button type="submit" disabled={carregando}>
                    {carregando ? 'Entrando...' : 'Entrar'}
                </button>
            </form>

            {mensagem && (
                <p className="mensagem-login">
                    {mensagem}
                </p>
            )}

            <p>Ainda não tem uma conta?</p>

            <button type="button" onClick={onCadastro}>
                Criar conta
            </button>
        </section>
    );
}

export default Login;
