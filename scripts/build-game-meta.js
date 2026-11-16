/**
 * build-game-meta.js
 * ------------------
 * Fetches studio, publisher, genre and platform data from IGDB for every game in
 * public/games-index.json and writes public/games-meta.json (see
 * scripts/lib/gameMeta.js for the format). The game uses it to show how close a
 * wrong guess was.
 *
 * It only fetches games that aren't in the file yet, so re-running it after
 * adding games to the index is quick.
 *
 * Usage (needs IGDB_CLIENT_ID / IGDB_CLIENT_SECRET, e.g. in .env.local):
 *   node scripts/build-game-meta.js
 *
 * add-to-search-index.js calls the same code for the game it adds, so you only
 * need this for the initial build or to catch up. Commit public/games-meta.json.
 */

const { INDEX_PATH, readJson } = require('./lib/searchIndex');
const { ensureMeta } = require('./lib/gameMeta');

async function main() {
  const index = readJson(INDEX_PATH);
  const ids = index.games.map((game) => game.id).filter((id) => id != null);
  console.log(`Checking ${ids.length} games from the search index...`);
  const { fetched, total } = await ensureMeta(ids);
  console.log(
    fetched
      ? `Done. Fetched ${fetched} games; games-meta.json now covers ${total}.`
      : `Already up to date (${total} games).`
  );
  if (fetched) console.log('Remember to commit public/games-meta.json.');
}

main().catch((error) => {
  console.error('Failed to build game meta:', error.message);
  process.exit(1);
});
