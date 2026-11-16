// Server-side access to the curated puzzle list. The JSON is parsed once per
// server instance instead of on every request.
import gameData from "../data/gameData.json";
import { withBoxArt } from "../utils/resolveBoxArt";

const byDate = new Map();
const byReleaseDate = new Map();

gameData.forEach((game, index) => {
  byDate.set(game.date, { game, gameNumber: index + 1 });
  if (!byReleaseDate.has(game.releaseDate)) {
    byReleaseDate.set(game.releaseDate, { game, gameNumber: index + 1 });
  }
});

const toResponse = (entry) => (entry ? withBoxArt({ ...entry.game, gameNumber: entry.gameNumber }) : null);

export const findByDate = (date) => toResponse(byDate.get(date));
export const findByReleaseDate = (releaseDate) => toResponse(byReleaseDate.get(releaseDate));

// Release dates of every puzzle that has already been played as a daily. Endless
// draws from this list, so it never spoils a future daily.
export function playableReleaseDates(today) {
  return gameData.filter((game) => game.date <= today).map((game) => game.releaseDate);
}
