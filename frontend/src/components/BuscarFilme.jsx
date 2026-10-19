import { useState } from 'react';
import { buscarFilme } from '../services/filmeService';

function BuscarFilme({ aoEncontrar, aoLimpar }) {
    const [id, setId] = useState('');
    const [erro, setErro] = useState('');

    async function buscar(e) {
        e.preventDefault();

        if (!id) {
            setErro('Informe o ID do filme.');
            return;
        }

        try {
            setErro('');

            const filme = await buscarFilme(id);

            aoEncontrar(filme);

        } catch (erro) {
            setErro(erro.message);
            aoLimpar();
        }
    }

    return (
        <div>
            <h3>Buscar filme</h3>

            <form onSubmit={buscar}>

                <input
                    type="number"
                    placeholder="ID do filme"
                    value={id}
                    onChange={(e) => setId(e.target.value)}
                />

                <button type="submit">
                    Buscar
                </button>

            </form>

            {erro && (
                <p className="erro">
                    {erro}
                </p>
            )}
        </div>
    );
}

export default BuscarFilme;