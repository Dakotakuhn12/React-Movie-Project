const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";

async function request(path) {
  const response = await fetch(`${API_BASE}${path}`);
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }
  return response.json();
}

export function getGames({ start = 0, end = 20 } = {}) {
  return request(`/games?start=${start}&end=${end}`);
}

export function searchGames(query) {
  return request(`/games?search=${encodeURIComponent(query)}&start=0&end=50`);
}

export function getGameById(id) {
  return request(`/games/${id}`);
}
