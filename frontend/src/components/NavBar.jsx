import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import "../css/Navbar.css";

function NavBar() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) {
      navigate("/");
      return;
    }
    navigate(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  return (
    <header className="navbar">
      <Link className="navbar-brand" to="/">
        PixelAtlas
      </Link>
      <form className="navbar-search" onSubmit={handleSubmit}>
        <input
          aria-label="Search games"
          className="navbar-search-input"
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search games by title"
          type="search"
          value={query}
        />
        <button className="navbar-search-button" type="submit">
          Search
        </button>
      </form>
      <nav className="navbar-links">
        <Link to="/" className="nav-link">
          Home
        </Link>
        <Link to="/favorites" className="nav-link">
          Favorites
        </Link>
      </nav>
    </header>
  );
}

export default NavBar;
