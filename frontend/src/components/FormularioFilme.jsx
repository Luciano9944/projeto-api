import { useState } from 'react';
import { cadastrarFilme } from '../services/filmeService';

function FormularioFilme({ aoCadastrar }) {

    const [titulo, setTitulo] = useState('');
    const [ano, setAno] = useState('');
    const [mensagem, setMensagem] = useState('');

    async function enviarFormulario(e) {
        e.preventDefault();

        if (!titulo || !ano) {
            setMensagem('Informe o título e o ano.');
            return;
        }

        try {
            const filme = await cadastrarFilme({
                titulo: titulo,
                ano: Number(ano)
            });

            setMensagem('Filme cadastrado com sucesso!');

            // Limpa o formulário
            setTitulo('');
            setAno('');

            // Atualiza a lista
            aoCadastrar(filme);

        } catch (erro) {
            setMensagem(erro.message);
        }
    }

    return (
        <section>
            <h2>Cadastrar filme</h2>

            <form onSubmit={enviarFormulario}>

                <div>
                    <label htmlFor="titulo">
                        Título:
                    </label>

                    <input
                        id="titulo"
                        type="text"
                        value={titulo}
                        onChange={(e) => setTitulo(e.target.value)}
                        placeholder="Ex.: Pantera Negra"
                    />
                </div>

                <div>
                    <label htmlFor="ano">
                        Ano:
                    </label>

                    <input
                        id="ano"
                        type="number"
                        value={ano}
                        onChange={(e) => setAno(e.target.value)}
                        placeholder="Ex.: 2018"
                    />
                </div>

                <button type="submit">
                    Cadastrar filme
                </button>

            </form>

            {mensagem && (
                <p>{mensagem}</p>
            )}

        </section>
    );
}

export default FormularioFilme;