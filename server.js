require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const db = require("./db");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

function buildImageUrl(rawValue) {
  if (!rawValue) return null;
  if (typeof rawValue !== "string") return rawValue;
  if (rawValue.startsWith("//")) return `https:${rawValue}`;
  if (rawValue.startsWith("http://") || rawValue.startsWith("https://")) {
    return rawValue;
  }
  if (rawValue.startsWith("t_")) {
    return `https://images.igdb.com/igdb/image/upload/${rawValue}.jpg`;
  }
  return rawValue;
}

function safeJsonParse(value, fallback) {
  if (!value) return fallback;
  if (Array.isArray(value) || typeof value === "object") return value;
  try {
    return JSON.parse(value);
  } catch (error) {
    return fallback;
  }
}

function splitList(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function mapWebsites(value) {
  if (!value) return [];
  const parsed = safeJsonParse(value, null);

  if (Array.isArray(parsed)) {
    return parsed
      .map((item) => {
        if (typeof item === "string") {
          return { url: item, category: null };
        }
        if (item?.url) {
          return { url: item.url, category: item.category || null };
        }
        return null;
      })
      .filter(Boolean);
  }

  return splitList(value).map((url) => ({ url, category: null }));
}

function mapSimilarGames(value) {
  const parsed = safeJsonParse(value, null);
  if (Array.isArray(parsed)) return parsed;
  return [];
}

function normalizeGameRow(row) {
  return {
    id: row.game_id,
    name: row.name,
    category: row.category_name || row.category || null,
    summary: row.summary || "",
    cover: buildImageUrl(
      row.cover ||
        row.cover_url ||
        row.cover_image ||
        row.image_url ||
        row.url ||
        null,
    ),
    genres: safeJsonParse(row.genres_json, splitList(row.genres)),
    platforms: safeJsonParse(row.platforms_json, splitList(row.platforms)),
    screenshots: safeJsonParse(
      row.screenshots_json,
      splitList(row.screenshots).map(buildImageUrl),
    ).map(buildImageUrl),
    websites: mapWebsites(row.websites_json || row.websites),
    similarGames: mapSimilarGames(row.similar_games_json).map((game) => ({
      id: game.id ?? game.game_id,
      name: game.name,
      cover: buildImageUrl(game.cover || game.cover_url || null),
      platforms: Array.isArray(game.platforms)
        ? game.platforms
        : splitList(game.platforms),
    })),
  };
}

async function getListRows({ search, start, limit }) {
  const listQuery = `
    SELECT
      g.game_id,
      g.name,
      c.description AS category_name,
      g.summary,
      (
        SELECT gc.url
        FROM game_covers gc
        WHERE gc.game_id = g.game_id
        LIMIT 1
      ) AS cover,
      (
        SELECT JSON_ARRAYAGG(p.name)
        FROM game_platform gp
        JOIN platforms p ON p.platform_id = gp.platform_id
        WHERE gp.game_id = g.game_id
      ) AS platforms_json
    FROM games g
    LEFT JOIN categories c ON c.category_id = g.category
    ${search ? "WHERE g.name LIKE CONCAT('%', ?, '%')" : ""}
    ORDER BY g.name
    LIMIT ?, ?
  `;

  const parameters = search ? [search, start, limit] : [start, limit];
  const [rows] = await db.query(listQuery, parameters);
  return rows;
}

async function getDetailRow(gameId) {
  const detailQuery = `
    SELECT
      g.game_id,
      g.name,
      c.description AS category_name,
      g.summary,
      (
        SELECT gc.url
        FROM game_covers gc
        WHERE gc.game_id = g.game_id
        LIMIT 1
      ) AS cover,
      (
        SELECT JSON_ARRAYAGG(ge.name)
        FROM game_genre gg
        JOIN genres ge ON ge.genre_id = gg.genre_id
        WHERE gg.game_id = g.game_id
      ) AS genres_json,
      (
        SELECT JSON_ARRAYAGG(p.name)
        FROM game_platform gp
        JOIN platforms p ON p.platform_id = gp.platform_id
        WHERE gp.game_id = g.game_id
      ) AS platforms_json,
      (
        SELECT JSON_ARRAYAGG(s.url)
        FROM screenshots s
        WHERE s.game_id = g.game_id
      ) AS screenshots_json,
      (
        SELECT JSON_ARRAYAGG(
          JSON_OBJECT(
            'url', w.url,
            'category', CASE
              WHEN w.trusted = 1 THEN 'Trusted'
              ELSE null
            END
          )
        )
        FROM websites w
        WHERE w.game_id = g.game_id
      ) AS websites_json,
      (
        SELECT JSON_ARRAYAGG(
          JSON_OBJECT(
            'id', sg.game_id,
            'name', sg.name,
            'cover', (
              SELECT sgc.url
              FROM game_covers sgc
              WHERE sgc.game_id = sg.game_id
              LIMIT 1
            ),
            'platforms', (
              SELECT JSON_ARRAYAGG(sp.name)
              FROM game_platform sgp
              JOIN platforms sp ON sp.platform_id = sgp.platform_id
              WHERE sgp.game_id = sg.game_id
            )
          )
        )
        FROM game_similar rel
        JOIN games sg ON sg.game_id = rel.similar_game_id
        WHERE rel.game_id = g.game_id
      ) AS similar_games_json
    FROM games g
    LEFT JOIN categories c ON c.category_id = g.category
    WHERE g.game_id = ?
    LIMIT 1
  `;

  const [rows] = await db.query(detailQuery, [gameId]);
  return rows[0] || null;
}

app.get("/api/health", async (req, res) => {
  try {
    await db.query("SELECT 1");
    res.json({ ok: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, error: "Database unavailable" });
  }
});

app.get("/api/games", async (req, res) => {
  const { start = 0, end = 20, search = "" } = req.query;
  const parsedStart = Number.parseInt(start, 10) || 0;
  const parsedEnd = Number.parseInt(end, 10) || 20;
  const limit = Math.min(Math.max(parsedEnd - parsedStart, 1), 200);

  try {
    const rows = await getListRows({
      search: search.trim(),
      start: parsedStart,
      limit,
    });

    res.json({
      start: parsedStart,
      limit,
      num_records: rows.length,
      records: rows.map(normalizeGameRow),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "DB Error" });
  }
});

app.get("/api/games/:id", async (req, res) => {
  try {
    const row = await getDetailRow(req.params.id);

    if (!row) {
      return res.status(404).json({ error: "Game not found" });
    }

    return res.json(normalizeGameRow(row));
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "DB Error" });
  }
});

app.post("/api/games", async (req, res) => {
  const { game_id, name, category, summary } = req.body;

  try {
    await db.execute(
      `
        INSERT INTO games (game_id, name, category, summary)
        VALUES (?, ?, ?, ?)
      `,
      [game_id, name, category, summary],
    );

    res.status(201).json({ message: "Game added", id: game_id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Database error" });
  }
});

app.put("/api/games/:id", async (req, res) => {
  const { name, category, summary } = req.body;

  try {
    const [result] = await db.execute(
      `
        UPDATE games
        SET name = ?, category = ?, summary = ?
        WHERE game_id = ?
      `,
      [name, category, summary, req.params.id],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Game not found" });
    }

    return res.json({ message: "Game updated" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Database error" });
  }
});

app.delete("/api/games/:id", async (req, res) => {
  try {
    const [result] = await db.execute("DELETE FROM games WHERE game_id = ?", [
      req.params.id,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Game not found" });
    }

    return res.json({ message: "Game deleted" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Database error" });
  }
});

const frontendDistPath = path.join(__dirname, "frontend", "dist");
app.use(express.static(frontendDistPath));

app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api")) {
    return next();
  }

  return res.sendFile(path.join(frontendDistPath, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Active on http://localhost:${PORT}`);
});
