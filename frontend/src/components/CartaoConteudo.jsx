import { useState } from 'react';

const formatoNota = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

export default function CartaoConteudo({ titulo, poster, data, nota, prioridade, onAbrir }) {
    const [imagemFalhou, setImagemFalhou] = useState(false);
    const avaliacao = Number(nota || 0);

    return (
        <article className="cartao-filme">
            <div className="capa-conteudo">
                <button type="button" className="filme-clicavel" onClick={onAbrir} aria-label={`Ver detalhes de ${titulo}`}>
                    {poster && !imagemFalhou ? (
                        <img
                            src={`https://image.tmdb.org/t/p/w500${poster}`}
                            alt={`Pôster de ${titulo}`}
                            width="500"
                            height="750"
                            loading={prioridade ? 'eager' : 'lazy'}
                            onError={() => setImagemFalhou(true)}
                        />
                    ) : (
                        <span className="poster-indisponivel">
                            <svg viewBox="0 0 40 40" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" focusable="false">
                                <rect x="6" y="5" width="28" height="30" rx="2" />
                                <path d="M12 5v30m16-30v30M6 12h6m-6 8h6m-6 8h6m16-16h6m-6 8h6m-6 8h6" />
                            </svg>
                            Pôster indisponível
                        </span>
                    )}
                </button>
            </div>
            <div className="informacoes-filme">
                <h2>
                    <button type="button" className="filme-titulo-clicavel" onClick={onAbrir}>{titulo}</button>
                </h2>
                <div className="metadados-filme">
                    {avaliacao > 0 && (
                        <span className="nota-filme">
                            <span aria-hidden="true">★</span>
                            <span className="sr-only">Nota: </span>{formatoNota.format(avaliacao)}
                            <span className="sr-only"> de 10</span>
                        </span>
                    )}
                    <p><span className="sr-only">Ano: </span>{data ? data.slice(0, 4) : 'Ano não informado'}</p>
                </div>
            </div>
        </article>
    );
}
