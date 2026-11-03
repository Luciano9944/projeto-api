const formatoNota = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1, minimumFractionDigits: 1 });
const formatoData = new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' });

function dataCompleta(data) {
    const valor = data ? new Date(data) : null;
    return valor && !Number.isNaN(valor.getTime()) ? formatoData.format(valor) : 'Não informado';
}

export default function ResumoConteudoAdmin({ item, cadastrado = false, children }) {
    const temNota = item.nota_media !== null && item.nota_media !== undefined && item.nota_media !== '';

    return (
        <>
            <div className="admin-item-resumo">
                {item.poster_path ? (
                    <img className="admin-item-poster" src={`https://image.tmdb.org/t/p/w185${item.poster_path}`} alt={`Pôster de ${item.titulo}`} width="56" height="84" loading="lazy" />
                ) : <span className="admin-item-sem-poster" aria-hidden="true">Sem capa</span>}
                <div className="admin-item-info">
                    <h3>{item.titulo}</h3>
                    <div className="admin-item-meta">
                        <span>{item.tipo_conteudo === 'serie' ? 'Série' : 'Filme'}</span>
                        <span><span className="sr-only">Ano: </span>{item.data_lancamento ? item.data_lancamento.slice(0, 4) : 'Ano não informado'}</span>
                        <span><span aria-hidden="true">★ </span><span className="sr-only">Nota: </span>{temNota ? formatoNota.format(Number(item.nota_media)) : 'Não informada'}</span>
                        {cadastrado && <span className={item.ativo ? 'admin-status ativo' : 'admin-status'}>{item.ativo ? 'Ativo' : 'Inativo'}</span>}
                    </div>
                </div>
                <div className="admin-item-acoes">{children}</div>
            </div>
            <details className="admin-item-detalhes">
                <summary>Mais informações<span className="sr-only"> sobre {item.titulo}</span></summary>
                <dl>
                    {cadastrado && <div><dt>ID no catálogo</dt><dd>{item.id}</dd></div>}
                    <div><dt>ID TMDB</dt><dd>{item.tmdb_id}</dd></div>
                    <div><dt>Lançamento</dt><dd>{dataCompleta(item.data_lancamento)}</dd></div>
                </dl>
                <p>{item.sinopse || 'Sinopse não disponível.'}</p>
            </details>
        </>
    );
}
