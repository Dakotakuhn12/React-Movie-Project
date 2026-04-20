import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getGameById } from "../services/api";
import { useGameContext } from "../contexts/GameContext";
import "../css/GameDetails.css";

function DetailList({ title, items, renderItem }) {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <section className="detail-panel">
      <h2>{title}</h2>
      <div className="chip-list">
        {items.map((item, index) => (
          <div className="chip" key={`${title}-${index}`}>
            {renderItem ? renderItem(item) : item}
          </div>
        ))}
      </div>
    </section>
  );
}

function GameDetails() {
  const { id } = useParams();
  const [game, setGame] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const { addToFavorites, isFavorite, removeFromFavorites } = useGameContext();

  useEffect(() => {
    const loadGame = async () => {
      try {
        const data = await getGameById(id);
        setGame(data);
      } catch (err) {
        console.error(err);
        setError("Unable to load this game.");
      } finally {
        setLoading(false);
      }
    };

    loadGame();
  }, [id]);

  if (loading) {
    return <div className="status-message">Loading game details...</div>;
  }

  if (error || !game) {
    return (
      <div className="status-message error">{error || "Game not found."}</div>
    );
  }

  const favorite = isFavorite(game.id);

  const toggleFavorite = () => {
    if (favorite) {
      removeFromFavorites(game.id);
    } else {
      addToFavorites(game);
    }
  };

  return (
    <article className="game-details">
      <section className="detail-hero">
        <div className="detail-cover-frame">
          <img
            src={
              game.cover
                ? game.cover.replace("t_thumb", "t_1080p")
                : "https://placehold.co/600x900/101828/F8FAFC?text=No+Cover"
            }
            alt={game.name}
          />
        </div>
        <div className="detail-copy">
          <p className="eyebrow">Game Profile</p>
          <h1>{game.name}</h1>
          <p className="detail-category">
            {game.category || "Unknown category"}
          </p>
          <p className="detail-summary">
            {game.summary || "No summary is available for this game yet."}
          </p>
          <div className="detail-actions">
            <button
              type="button"
              className="favorite-toggle"
              onClick={toggleFavorite}
            >
              {favorite ? "Remove Favorite" : "Add Favorite"}
            </button>
            <Link className="secondary-link" to="/favorites">
              View Favorites
            </Link>
          </div>
        </div>
      </section>

      <div className="detail-grid">
        <DetailList title="Platforms" items={game.platforms} />
        <DetailList title="Genres" items={game.genres} />
        <DetailList
          title="Websites"
          items={game.websites}
          renderItem={(site) => (
            <a href={site.url} target="_blank" rel="noreferrer">
              {site.category ? `${site.category}: ` : ""}
              {site.url}
            </a>
          )}
        />
      </div>

      {game.screenshots?.length > 0 ? (
        <section className="detail-panel">
          <h2>Screenshots</h2>
          <div className="screenshot-grid">
            {game.screenshots.map((shot, index) => (
              <img
                key={`${shot}-${index}`}
                className="screenshot"
                src={shot}
                alt={`${game.name} screenshot ${index + 1}`}
              />
            ))}
          </div>
        </section>
      ) : null}

      {game.similarGames?.length > 0 ? (
        <section className="detail-panel">
          <h2>Similar Games</h2>
          <div className="similar-grid">
            {game.similarGames.map((similarGame) => (
              <Link
                className="similar-card"
                key={similarGame.id}
                to={`/games/${similarGame.id}`}
              >
                <img
                  src={
                    similarGame.cover ||
                    "https://placehold.co/300x420/0F172A/E2E8F0?text=No+Cover"
                  }
                  alt={similarGame.name}
                />
                <div>
                  <h3>{similarGame.name}</h3>
                  <p>
                    {similarGame.platforms?.join(", ") ||
                      "Platform info unavailable"}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </article>
  );
}

export default GameDetails;
