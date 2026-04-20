import GameCard from "../components/GameCard";
import { useEffect, useState } from "react";
import { getGames } from "../services/api";
import "../css/Home.css";

function Home() {
  const [games, setGames] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadGames = async () => {
      try {
        const data = await getGames({ start: 0, end: 20 });
        setGames(data.records);
      } catch (err) {
        console.error(err);
        setError("Unable to load games right now.");
      } finally {
        setLoading(false);
      }
    };

    loadGames();
  }, []);

  return (
    <section className="page page-home">
      <div className="page-header">
        <p className="eyebrow">Featured Library</p>
        <h1>Discover 20 games from the IGDB collection.</h1>
        <p className="lede">
          Browse the latest set, search from the navbar, and open any title for
          a full game breakdown with screenshots, links, and similar games.
        </p>
      </div>

      {error ? <div className="status-message error">{error}</div> : null}

      {loading ? (
        <div className="status-message">Loading games...</div>
      ) : (
        <div className="games-grid">
          {games.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      )}
    </section>
  );
}

export default Home;
