import { useState } from 'react';
import { fazerLogin, fazerLogout } from '../services/authService';

function Login({ aoAutenticar }) {

    const [accessToken, setAccessToken] = useState('');
    const [mensagem, setMensagem] = useState('');
    const [logado, setLogado] = useState(false);

    async function entrar() {

        if (!accessToken) {
            setMensagem('Informe o access_token.');
            return;
        }

        try {
            const dados = await fazerLogin(accessToken);

            setMensagem(dados.mensagem);

            setAccessToken('');
            setLogado(true);

            aoAutenticar(true);

        } catch (erro) {
            setMensagem(erro.message);
        }
    }

    async function sair() {

        try {
            const dados = await fazerLogout();

            setMensagem(dados.mensagem);
            setLogado(false);

            aoAutenticar(false);

        } catch (erro) {
            setMensagem(erro.message);
        }
    }

    return (
        <section className="login">

            <div className="login-topo">
                <div>
                    <h2>Autenticação</h2>

                    <span className={logado ? 'status online' : 'status'}>
                        {logado ? '● Conectado' : '● Desconectado'}
                    </span>
                </div>

                {logado && (
                    <button
                        className="botao-sair"
                        onClick={sair}
                    >
                        Sair
                    </button>
                )}
            </div>

            {!logado && (
                <div className="login-form">

                    <input
                        type="password"
                        placeholder="Digite o access_token"
                        value={accessToken}
                        onChange={(e) => setAccessToken(e.target.value)}
                    />

                    <button onClick={entrar}>
                        Entrar
                    </button>

                </div>
            )}

            {mensagem && (
                <p className="mensagem-login">
                    {mensagem}
                </p>
            )}

        </section>
    );
}

export default Login;