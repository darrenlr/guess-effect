import { findByDate } from "../../lib/gameData";
import { todayUtc } from "../../lib/dates";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const MAX_DATES = 24;

// GET /api/getShelf?dates=2026-11-10,2026-11-09
// Title and cover for games a player has already played, for the home page
// shelf. Days that haven't happened yet are never returned.
export default function handler(req, res) {
  const today = todayUtc();
  const dates = String(req.query.dates || "")
    .split(",")
    .filter((date) => DATE_PATTERN.test(date) && date <= today)
    .slice(0, MAX_DATES);

  const games = dates
    .map((date) => findByDate(date))
    .filter(Boolean)
    .map(({ date, title, boxArtUrl }) => ({ date, title, boxArtUrl }));

  res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
  return res.status(200).json(games);
}
