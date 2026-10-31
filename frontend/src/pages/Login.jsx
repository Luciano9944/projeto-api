import { useState } from 'react';
import { realizarLogin } from '../services/authService';

function Login({ onLogin }) {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [erro, setErro] = useState('');
    const [carregando, setCarregando] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();

        setErro('');
        setCarregando(true);

        try {
            const dados = await realizarLogin(email, senha);

            if (dados.usuario.papel !== 'admin') {
                setErro('Esta conta não possui permissão de administrador.');
                return;
            }

            onLogin(dados.usuario);
        } catch (erro) {
            setErro(erro.message);
        } finally {
            setCarregando(false);
        }
    }

    return (
        <section>
            <h2>Login administrativo</h2>

            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="email">E-mail:</label>

                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={event => setEmail(event.target.value)}
                        required
                    />
                </div>

                <div>
                    <label htmlFor="senha">Senha:</label>

                    <input
                        id="senha"
                        type="password"
                        value={senha}
                        onChange={event => setSenha(event.target.value)}
                        required
                    />
                </div>

                <button type="submit" disabled={carregando}>
                    {carregando ? 'Entrando...' : 'Entrar'}
                </button>
            </form>

            {erro && <p>{erro}</p>}
        </section>
    );
}

export default Login;