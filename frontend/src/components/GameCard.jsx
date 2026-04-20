import { Link } from "react-router-dom";
import "../css/GameCard.css";
import { useGameContext } from "../contexts/GameContext";

function GameCard({ game }) {
  const { isFavorite, addToFavorites, removeFromFavorites } = useGameContext();
  const favorite = isFavorite(game.id);

  const toggleFavorite = (event) => {
    event.preventDefault();
    if (favorite) {
      removeFromFavorites(game.id);
    } else {
      addToFavorites(game);
    }
  };

  return (
    <Link className="game-card" to={`/games/${game.id}`}>
      <div className="game-card-media">
        <img
          src={
            game.cover
              ? game.cover.replace("t_thumb", "t_1080p")
              : "https://placehold.co/600x900/101828/F8FAFC?text=No+Cover"
          }
          alt={game.name}
        />
        <button
          type="button"
          aria-label={favorite ? "Remove favorite" : "Add favorite"}
          className={`favorite-btn ${favorite ? "active" : ""}`}
          onClick={toggleFavorite}
        >
          ♥
        </button>
      </div>
      <div className="game-card-info">
        <h2>{game.name}</h2>
        <p>{game.platforms?.join(", ") || "Platform info unavailable"}</p>
      </div>
    </Link>
  );
}

export default GameCard;
