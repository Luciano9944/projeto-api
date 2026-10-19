import { useState } from 'react';
import { excluirFilme } from '../services/filmeService';

function ExcluirFilme({ filme, aoExcluir, aoCancelar }) {

    const [mensagem, setMensagem] = useState('');
    const [excluindo, setExcluindo] = useState(false);

    async function confirmarExclusao() {

        try {
            setExcluindo(true);
            setMensagem('');

            await excluirFilme(filme.id);

            setMensagem('Filme excluído com sucesso!');

            aoExcluir(filme.id);

        } catch (erro) {
            setMensagem(erro.message);
            setExcluindo(false);
        }
    }

    return (
        <div className="confirmacao-exclusao">

            <div className="icone-confirmacao">
                ⚠️
            </div>

            <h3>Confirmar exclusão</h3>

            <p>
                Tem certeza que deseja excluir o filme:
            </p>

            <strong>
                {filme.titulo} ({filme.ano})
            </strong>

            <p className="aviso-exclusao">
                Essa ação não poderá ser desfeita.
            </p>

            {mensagem && (
                <p>{mensagem}</p>
            )}

            {!mensagem && (
                <div className="botoes-confirmacao">

                    <button
                        className="botao-cancelar"
                        onClick={aoCancelar}
                        disabled={excluindo}
                    >
                        Cancelar
                    </button>

                    <button
                        className="botao-confirmar-exclusao"
                        onClick={confirmarExclusao}
                        disabled={excluindo}
                    >
                        {excluindo
                            ? 'Excluindo...'
                            : 'Sim, excluir'}
                    </button>

                </div>
            )}

        </div>
    );
}

export default ExcluirFilme;