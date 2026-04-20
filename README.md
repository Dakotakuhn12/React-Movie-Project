# React Video Game Project 2

This project combines:

- An Express + MySQL API for IGDB game data
- A React frontend that shows 20 games on load
- Navbar search by game title
- Game details with genres, platforms, screenshots, websites, and similar games
- Local favorites support

## Local setup

1. Copy `.env.example` to `.env` and update the MySQL credentials.
2. Copy `frontend/.env.example` to `frontend/.env` if you want to point the React app to a custom API URL during local development.
3. Install backend dependencies with `npm install`.
4. Install frontend dependencies with `cd frontend && npm install`.
5. Start the API with `npm start`.
6. Start the frontend with `cd frontend && npm run dev`.

## API routes

- `GET /api/games?start=0&end=20`
- `GET /api/games?search=halo`
- `GET /api/games/:id`
- `POST /api/games`
- `PUT /api/games/:id`
- `DELETE /api/games/:id`

## Deployment

`render.yaml` is set up for a single Render web service that:

- Builds the React frontend in `frontend/`
- Starts the Express API at the repo root
- Serves the built frontend from the same Node app

Set the database environment variables in Render before deploying.
