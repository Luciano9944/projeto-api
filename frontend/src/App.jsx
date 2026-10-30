
import { useState } from 'react';
import Filmes from './pages/Filmes';
import Series from './pages/Series';

function App() {
    const [catalogo, setCatalogo] = useState('filmes-populares');

    return (
        <div className="app">
            <header>
                <h1>🎬 CineCatalog</h1>
                <p>Explore filmes, séries e descubra novidades.</p>

                <nav className="navegacao-catalogo">
                    <button
                        className={catalogo === 'filmes-populares' ? 'ativo' : ''}
                        onClick={() => setCatalogo('filmes-populares')}
                    >
                        Filmes populares
                    </button>

                    <button
                        className={catalogo === 'filmes-marvel' ? 'ativo' : ''}
                        onClick={() => setCatalogo('filmes-marvel')}
                    >
                        Filmes Marvel
                    </button>

                    <button
                        className={catalogo === 'series-populares' ? 'ativo' : ''}
                        onClick={() => setCatalogo('series-populares')}
                    >
                        Séries populares
                    </button>

                    <button
                        className={catalogo === 'series-marvel' ? 'ativo' : ''}
                        onClick={() => setCatalogo('series-marvel')}
                    >
                        Séries Marvel
                    </button>
                </nav>
            </header>

            <main>
                {catalogo.startsWith('filmes') ? (
                    <Filmes
                        key={catalogo}
                        categoriaInicial={
                            catalogo === 'filmes-marvel'
                                ? 'marvel'
                                : 'populares'
                        }
                    />
                ) : (
                    <Series
                        key={catalogo}
                        categoriaInicial={
                            catalogo === 'series-marvel'
                                ? 'marvel'
                                : 'populares'
                        }
                    />
                )}
            </main>

            <footer>
                Catálogo de filmes e séries • React + Vite + Express + TMDB
            </footer>
        </div>
    );
}

export default App;
