/**
 * validate-search-index.js
 * ------------------------
 * CI guard: every game in data/gameData.json must be present in the local
 * search index (public/games-index.json) AND must have a box art source.
 *
 * Why: search now runs against the static index, and curated entries may omit
 * boxArtUrl and instead derive it from the index's coverImageId. So for each
 * curated game we require:
 *   1. a matching index entry (by title, against name + alternativeNames), and
 *   2. a cover — either the curated entry's own boxArtUrl, or a coverImageId on
 *      the matched index entry.
 *
 * A curated game that fails either check would be missing from search or would
 * render broken box art. On failure this prints how to fix it and exits 1.
 */

const {
  GAME_DATA_PATH,
  INDEX_PATH,
  normalizeName,
  indexEntryByName,
  readJson,
} = require('./lib/searchIndex');

function main() {
  const curated = readJson(GAME_DATA_PATH);
  const index = readJson(INDEX_PATH);
  const byName = indexEntryByName(index.games);

  const missing = []; // not in the index at all
  const noCover = []; // in the index, but no derivable box art

  curated.forEach((game, i) => {
    if (!game.title) {
      missing.push(`(entry #${i + 1} has no title)`);
      return;
    }
    const entry = byName.get(normalizeName(game.title));
    if (!entry) {
      missing.push(game.title);
      return;
    }
    const hasCover = Boolean(game.boxArtUrl) || Boolean(entry.coverImageId);
    if (!hasCover) noCover.push(game.title);
  });

  if (missing.length === 0 && noCover.length === 0) {
    console.log(
      `✅ All ${curated.length} curated games are in the search index with box art.`
    );
    return;
  }

  if (missing.length) {
    console.error(`❌ ${missing.length} curated game(s) missing from the search index:`);
    for (const title of missing) console.error(`   - ${title}`);
    console.error(
      '\n   Add each one with:\n' +
        '     node scripts/add-to-search-index.js "<title>"\n' +
        '   (or --cover <coverImageId> to add it manually), then commit ' +
        'public/games-index.json.'
    );
  }

  if (noCover.length) {
    console.error(
      `\n❌ ${noCover.length} curated game(s) have no box art (no boxArtUrl and the ` +
        'matched index entry has no coverImageId):'
    );
    for (const title of noCover) console.error(`   - ${title}`);
    console.error(
      '\n   Either add a boxArtUrl to the gameData entry, or re-add it to the index ' +
        'with a cover:\n' +
        '     node scripts/add-to-search-index.js "<title>" --cover <coverImageId>'
    );
  }

  process.exit(1);
}

main();
