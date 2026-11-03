export default function BarraCatalogo({ tipo, categoria, consultaAtiva, consulta, onConsulta, onPesquisar, onCategoria }) {
    const series = tipo === 'series';
    const id = `busca-${tipo}`;

    return (
        <>
            <div className={`barra-catalogo${categoria === 'busca' ? ' busca-ativa' : ''}`}>
                <h1 id="acervo" tabIndex={-1}>
                    {categoria === 'busca' ? `Resultados para “${consultaAtiva}”` : series ? 'Séries' : 'Filmes'}
                </h1>
                <form className="formulario-busca" role="search" aria-label={series ? 'Buscar séries' : 'Buscar filmes'} onSubmit={onPesquisar}>
                    <label className="sr-only" htmlFor={id}>Buscar pelo título</label>
                    <input
                        id={id}
                        name="busca"
                        type="search"
                        autoComplete="off"
                        placeholder={series ? 'Buscar série…' : 'Buscar filme…'}
                        value={consulta}
                        onChange={event => onConsulta(event.target.value)}
                    />
                    <button type="submit" aria-label={series ? 'Pesquisar séries' : 'Pesquisar filmes'}>
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" focusable="false">
                            <circle cx="10.5" cy="10.5" r="6.5" />
                            <path d="m16 16 5 5" />
                        </svg>
                    </button>
                </form>
            </div>
            <nav className="filtros-catalogo" aria-label={series ? 'Categorias de séries' : 'Categorias de filmes'}>
                {[['populares', 'Populares'], ['marvel', 'Marvel'], ['catalogo', 'Disponíveis no site']].map(([valor, titulo]) => (
                    <button
                        key={valor}
                        type="button"
                        className={categoria === valor ? 'ativo' : ''}
                        aria-pressed={categoria === valor}
                        onClick={() => onCategoria(valor)}
                    >
                        {titulo}
                    </button>
                ))}
            </nav>
        </>
    );
}
