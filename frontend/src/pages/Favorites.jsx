import "../css/Favorites.css";
import { useGameContext } from "../contexts/GameContext";
import GameCard from "../components/GameCard";

function Favorites() {
  const { favorites } = useGameContext();

  if (favorites.length === 0) {
    return (
      <section className="favorites-empty">
        <h1>No favorite games yet</h1>
        <p>
          Save a few titles and they will show up here for quick access later.
        </p>
      </section>
    );
  }

  return (
    <section className="favorites-page">
      <div className="page-header compact">
        <p className="eyebrow">Favorites</p>
        <h1>Your saved games</h1>
      </div>
      <div className="games-grid">
        {favorites.map((game) => (
          <GameCard key={game.id} game={game} />
        ))}
      </div>
    </section>
  );
}

export default Favorites;
