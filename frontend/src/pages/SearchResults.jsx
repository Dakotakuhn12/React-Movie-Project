import GameCard from "../components/GameCard";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { searchGames } from "../services/api";
import "../css/Home.css";

function SearchResults() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q")?.trim() ?? "";
  const [games, setGames] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadResults = async () => {
      if (!query) {
        setGames([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const data = await searchGames(query);
        setGames(data.records);
        setError("");
      } catch (err) {
        console.error(err);
        setError("Search failed. Try another title.");
      } finally {
        setLoading(false);
      }
    };

    loadResults();
  }, [query]);

  return (
    <section className="page page-home">
      <div className="page-header compact">
        <p className="eyebrow">Search</p>
        <h1>{query ? `Results for "${query}"` : "Search for a game title"}</h1>
        <p className="lede">
          Matching titles are pulled from the backend by name.
        </p>
      </div>

      {error ? <div className="status-message error">{error}</div> : null}

      {loading ? (
        <div className="status-message">Searching...</div>
      ) : games.length > 0 ? (
        <div className="games-grid">
          {games.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      ) : (
        <div className="status-message">No games matched that search.</div>
      )}
    </section>
  );
}

export default SearchResults;
