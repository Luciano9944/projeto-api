function ListaFilmes({ filmes, aoAlterar, aoExcluir }) {
    return (
        <section className="lista-section">

            <div className="section-titulo">
                <h2>Filmes cadastrados</h2>
                <span>{filmes.length} filme(s)</span>
            </div>

            {filmes.length === 0 ? (
                <p className="vazio">
                    Nenhum filme cadastrado.
                </p>
            ) : (
                <div className="tabela-container">
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Título</th>
                                <th>Ano</th>
                                <th>Ações</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filmes.map((filme) => (
                                <tr key={filme.id}>
                                    <td>{filme.id}</td>

                                    <td>{filme.titulo}</td>

                                    <td>{filme.ano}</td>

                                    <td className="acoes">

                                        <button
                                            className="botao-acao alterar"
                                            title="Alterar filme"
                                            onClick={() => aoAlterar(filme)}
                                        >
                                            ✏️
                                        </button>

                                        <button
                                            className="botao-acao excluir"
                                            title="Excluir filme"
                                            onClick={() => aoExcluir(filme)}
                                        >
                                            🗑️
                                        </button>

                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

        </section>
    );
}

export default ListaFilmes;