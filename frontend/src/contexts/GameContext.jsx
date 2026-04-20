import { createContext, useContext, useEffect, useState } from "react";

const GameContext = createContext();

export const useGameContext = () => useContext(GameContext);

export function GameProvider({ children }) {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const storedFavorites = localStorage.getItem("favoriteGames");
    if (storedFavorites) {
      setFavorites(JSON.parse(storedFavorites));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("favoriteGames", JSON.stringify(favorites));
  }, [favorites]);

  const addToFavorites = (game) => {
    setFavorites((previous) => {
      if (previous.some((favorite) => favorite.id === game.id)) {
        return previous;
      }
      return [...previous, game];
    });
  };

  const removeFromFavorites = (gameId) => {
    setFavorites((previous) =>
      previous.filter((game) => game.id !== gameId),
    );
  };

  const isFavorite = (gameId) => {
    return favorites.some((game) => game.id === gameId);
  };

  return (
    <GameContext.Provider
      value={{ favorites, addToFavorites, removeFromFavorites, isFavorite }}
    >
      {children}
    </GameContext.Provider>
  );
}
