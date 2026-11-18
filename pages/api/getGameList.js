import { playableReleaseDates } from "../../lib/gameData";
import { todayUtc } from "../../lib/dates";

// The release dates endless mode can draw from. A few KB instead of shipping
// every puzzle (hints and plots included) to the browser up front.
export default function handler(req, res) {
  res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
  return res.status(200).json(playableReleaseDates(todayUtc()));
}
