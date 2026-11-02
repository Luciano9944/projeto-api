
import { useState } from 'react';
import { cadastrarUsuario } from '../services/authService';

function Cadastro({ aoCadastrar, aoVoltarLogin }) {
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');
    const [mensagem, setMensagem] = useState('');
    const [carregando, setCarregando] = useState(false);

    async function cadastrar(event) {
        event.preventDefault();

        if (senha !== confirmarSenha) {
            setMensagem('As senhas não coincidem.');
            return;
        }

        try {
            setCarregando(true);
            setMensagem('');

            const dados = await cadastrarUsuario(
                nome,
                email,
                senha
            );

            setMensagem(
                dados.mensagem || 'Conta criada com sucesso!'
            );

            setNome('');
            setEmail('');
            setSenha('');
            setConfirmarSenha('');

            aoCadastrar();
        } catch (erro) {
            setMensagem(erro.message);
        } finally {
            setCarregando(false);
        }
    }

    return (
        <section className="cadastro">
            <h2>Criar conta</h2>

            <form onSubmit={cadastrar}>
                <input
                    type="text"
                    placeholder="Nome"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    required
                />

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

                <input
                    type="password"
                    placeholder="Confirme sua senha"
                    value={confirmarSenha}
                    onChange={(e) => setConfirmarSenha(e.target.value)}
                    required
                />

                <button type="submit" disabled={carregando}>
                    {carregando ? 'Cadastrando...' : 'Criar conta'}
                </button>
            </form>

            {mensagem && (
                <p>{mensagem}</p>
            )}

            <button
                type="button"
                onClick={aoVoltarLogin}
            >
                Já tenho uma conta
            </button>
        </section>
    );
}

export default Cadastro;
