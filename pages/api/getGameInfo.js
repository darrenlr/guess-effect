import { findByDate, findByReleaseDate } from "../../lib/gameData";
import { todayUtc } from "../../lib/dates";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

// GET /api/getGameInfo?date=YYYY-MM-DD   -> the daily puzzle for that day
// GET /api/getGameInfo?releaseDate=...   -> one puzzle by release date (endless)
// With no query it returns today's puzzle. Future days are never served.
export default function handler(req, res) {
  const { date, releaseDate } = req.query;
  const today = todayUtc();

  let game = null;
  if (releaseDate) {
    if (!DATE_PATTERN.test(releaseDate)) return res.status(400).json({ error: "Invalid releaseDate" });
    game = findByReleaseDate(releaseDate);
  } else {
    const day = date || today;
    if (!DATE_PATTERN.test(day)) return res.status(400).json({ error: "Invalid date" });
    if (day > today) return res.status(404).json({ error: "Game not found" });
    game = findByDate(day);
  }

  if (!game) return res.status(404).json({ error: "Game not found" });

  // Puzzles never change once published, so the CDN can hold on to them.
  res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
  return res.status(200).json(game);
}
