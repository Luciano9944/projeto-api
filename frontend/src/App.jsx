
import Filmes from './pages/Filmes';

function App() {
    return (
        <div className="app">
            <header>
                <h1>🎬 CineCatalog</h1>
                <p>Explore filmes, descubra novidades e encontre seus favoritos.</p>
            </header>

            <main>
                <Filmes />
            </main>

            <footer>
                Catálogo de filmes • React + Vite + Express + TMDB
            </footer>
        </div>
    );
}

export default App;
