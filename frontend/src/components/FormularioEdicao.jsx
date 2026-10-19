import { useEffect, useState } from 'react';
import { atualizarFilme } from '../services/filmeService';

function FormularioEdicao({ filmeSelecionado, aoAtualizar }) {

    const [id, setId] = useState('');
    const [titulo, setTitulo] = useState('');
    const [ano, setAno] = useState('');
    const [mensagem, setMensagem] = useState('');

    useEffect(() => {

        if (filmeSelecionado) {
            setId(filmeSelecionado.id);
            setTitulo(filmeSelecionado.titulo);
            setAno(filmeSelecionado.ano);
            setMensagem('');
        }

    }, [filmeSelecionado]);

    async function enviar(e) {
        e.preventDefault();

        if (!id || !titulo || !ano) {
            setMensagem('Informe o título e o ano.');
            return;
        }

        try {
            const filmeAtualizado = await atualizarFilme(id, {
                titulo,
                ano: Number(ano)
            });

            setMensagem('Filme atualizado com sucesso!');

            aoAtualizar(filmeAtualizado);

        } catch (erro) {
            setMensagem(erro.message);
        }
    }

    return (
        <section>
            <h2>Atualizar filme</h2>

            <form onSubmit={enviar}>

                <input
                    type="number"
                    placeholder="ID do filme"
                    value={id}
                    disabled
                />

                <input
                    type="text"
                    placeholder="Novo título"
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                />

                <input
                    type="number"
                    placeholder="Novo ano"
                    value={ano}
                    onChange={(e) => setAno(e.target.value)}
                />

                <button type="submit">
                    Salvar alterações
                </button>

            </form>

            {mensagem && (
                <p>{mensagem}</p>
            )}

        </section>
    );
}

export default FormularioEdicao;