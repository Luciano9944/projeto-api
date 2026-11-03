
import { useState } from 'react';

import {
    realizarLogin,
    buscarPerfil
} from '../services/authService';

function Login({ onLogin, onCadastro, aviso }) {
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
            <h1>Entrar</h1>

            {aviso && <p className="mensagem" role="status">{aviso}</p>}
            <form className="login-form" onSubmit={entrar}>
                <label htmlFor="Login-email">E-mail</label>
                <input type="email" id="Login-email" name="email" autoComplete="email" spellCheck={false}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />

                <label htmlFor="Login-senha">Senha</label>
                <input type="password" id="Login-senha" name="senha" autoComplete="current-password"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    required
                />

                <button type="submit" disabled={carregando}>
                    {carregando ? 'Entrando…' : 'Entrar'}
                </button>
            </form>

            {mensagem && (
                <p className="erro" role="alert">
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
