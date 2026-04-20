import "./css/App.css";
import Favorites from "./pages/Favorites";
import GameDetails from "./pages/GameDetails";
import Home from "./pages/Home";
import SearchResults from "./pages/SearchResults";
import { Routes, Route } from "react-router-dom";
import { GameProvider } from "./contexts/GameContext";
import NavBar from "./components/NavBar";

function App() {
  return (
    <GameProvider>
      <div className="app-shell">
        <NavBar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/games/:id" element={<GameDetails />} />
            <Route path="/favorites" element={<Favorites />} />
          </Routes>
        </main>
      </div>
    </GameProvider>
  );
}

export default App;
