CREATE OR REPLACE VIEW game_catalog_view AS
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
  ) AS websites_json
FROM games g
LEFT JOIN categories c ON c.category_id = g.category;
