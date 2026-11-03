
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
            <h1>Criar conta</h1>

            <form onSubmit={cadastrar}>
                <label htmlFor="Cadastro-nome">Nome</label>
                <input type="text" id="Cadastro-nome" name="nome" autoComplete="name" maxLength={100}
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    required
                />

                <label htmlFor="Cadastro-email">E-mail</label>
                <input type="email" id="Cadastro-email" name="email" autoComplete="email" spellCheck={false}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />

                <label htmlFor="Cadastro-senha">Senha</label>
                <input type="password" id="Cadastro-senha" name="senha" autoComplete="new-password" minLength={8}
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    required
                />

                <p className="ajuda-campo">Use pelo menos 8 caracteres na senha.</p>
                <label htmlFor="Cadastro-confirmar-senha">Confirme sua senha</label>
                <input type="password" id="Cadastro-confirmar-senha" name="confirmar-senha" autoComplete="new-password"
                    value={confirmarSenha}
                    onChange={(e) => setConfirmarSenha(e.target.value)}
                    required
                />

                <button type="submit" disabled={carregando}>
                    {carregando ? 'Cadastrando…' : 'Criar conta'}
                </button>
            </form>

            {mensagem && (
                <p className="erro" role="alert">{mensagem}</p>
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
