import { useEffect, useState } from 'react';

import FormularioFilme from './FormularioFilme';
import BuscarFilme from './BuscarFilme';
import FormularioEdicao from './FormularioEdicao';
import ExcluirFilme from './ExcluirFilme';

function PainelOperacoes({
    aoCadastrar,
    aoAtualizar,
    aoExcluir,
    filmeParaEditar,
    filmeParaExcluir,
    cancelarExclusao,
    aoEncontrarFilme,
    aoLimparBusca
}) {

    const [operacao, setOperacao] = useState(null);
    
    useEffect(() => {
    if (filmeParaEditar) {
        setOperacao('atualizar');
    }

}, [filmeParaEditar]);

    if (filmeParaEditar && operacao !== 'atualizar') {
        setOperacao('atualizar');
    }

function selecionarOperacao(nome) {
    if (operacao === nome) {
        setOperacao(null);
    } else {
        setOperacao(nome);
    }

    // Limpa o resultado da busca ao trocar de operação
    aoLimparBusca();
}

    return (
        <section className="operacoes">

            <h2>Operações</h2>

            <div className="botoes-operacoes">

                <button
                    className={operacao === 'listar' ? 'ativo' : ''}
                    onClick={() => selecionarOperacao('listar')}
                >
                    📋 Listar
                </button>

                <button
                    className={operacao === 'buscar' ? 'ativo' : ''}
                    onClick={() => selecionarOperacao('buscar')}
                >
                    🔎 Buscar
                </button>

                <button
                    className={operacao === 'cadastrar' ? 'ativo' : ''}
                    onClick={() => selecionarOperacao('cadastrar')}
                >
                    ➕ Cadastrar
                </button>


            </div>

            {operacao && (
                <div className="painel-operacao">

                    {operacao === 'listar' && (
                        <div className="mensagem-operacao">
                            <h3>Lista de filmes</h3>
                            <p>
                                A lista de filmes está exibida abaixo.
                            </p>
                        </div>
                    )}

                    {operacao === 'buscar' && (
                        <BuscarFilme
                            aoEncontrar={aoEncontrarFilme}
                            aoLimpar={aoLimparBusca}
                        />
                    )}

                    {operacao === 'cadastrar' && (
                        <FormularioFilme
                            aoCadastrar={aoCadastrar}
                        />
                    )}

                    {operacao === 'atualizar' && (
                        <FormularioEdicao
                            filmeSelecionado={filmeParaEditar}
                            aoAtualizar={aoAtualizar}
                        />
                    )}

                </div>
            )}

            {filmeParaExcluir && (
                <div className="painel-confirmacao">

                    <ExcluirFilme
                        filme={filmeParaExcluir}
                        aoExcluir={aoExcluir}
                        aoCancelar={cancelarExclusao}
                    />

                </div>
            )}

        </section>
    );
}

export default PainelOperacoes;