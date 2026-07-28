/**
 * build-search-index.js
 * ----------------------
 * Builds a static, local search index of games from IGDB so that live search
 * can be replaced by a client-side Fuse.js lookup (no per-keystroke API calls).
 *
 * What it does:
 *   1. Authenticates to IGDB via Twitch OAuth (client_credentials).
 *   2. Pulls main games only (game_type = 0), ranked by total_rating_count
 *      (rating *count* is a better popularity proxy than score), top ~5000.
 *   3. Reconciles against data/gameData.json so every curated game is always
 *      present in the index, even if it falls outside the top 5000.
 *   4. Writes the result to public/games-index.json.
 *
 * Output location — why public/ (not data/):
 *   The index is consumed on the client (Fuse.js search). Files under public/
 *   are served verbatim as static assets at /games-index.json, cached at
 *   Vercel's edge, with zero serverless invocations.
 *
 * Usage:
 *   IGDB_CLIENT_ID=... IGDB_CLIENT_SECRET=... node scripts/build-search-index.js
 *
 * Credentials are read from the environment (or a local .env.local / .env file,
 * which is gitignored). Safely re-runnable: the output is written atomically.
 *
 * To add a single missing game without a full rebuild, use
 * scripts/add-to-search-index.js instead.
 */

const path = require('path');
const {
  ROOT,
  GAME_DATA_PATH,
  INDEX_PATH,
  GAME_FIELDS,
  authenticate,
  queryIgdb,
  normalizeName,
  coverIdFromBoxArtUrl,
  releaseDateToUnix,
  toIndexEntry,
  sortEntries,
  readJson,
  writeAtomic,
} = require('./lib/searchIndex');

// How many of the most-rated games to pull from IGDB.
const TOP_N = 5000;
// IGDB caps a single response at 500 rows.
const PAGE_SIZE = 500;
// IGDB rate limit is 4 req/s; stay comfortably under it.
const REQUEST_DELAY_MS = 300;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Pull the top TOP_N main games ranked by total_rating_count (desc).
 * game_type = 0 ("main game") excludes expansions, DLC, bundles, episodes, etc.
 */
async function fetchTopGames(auth) {
  const filter = 'where game_type = 0 & total_rating_count != null;';

  const games = [];
  for (let offset = 0; offset < TOP_N; offset += PAGE_SIZE) {
    const limit = Math.min(PAGE_SIZE, TOP_N - offset);
    const query = `${GAME_FIELDS} ${filter} sort total_rating_count desc; limit ${limit}; offset ${offset};`;
    const page = await queryIgdb(query, auth);
    games.push(...page);
    console.log(
      `  fetched ${page.length} games (offset ${offset}, running total ${games.length})`
    );
    // IGDB stops returning rows once we exhaust the result set.
    if (page.length < limit) break;
    await sleep(REQUEST_DELAY_MS);
  }
  return games;
}

/**
 * Ensure every curated game (data/gameData.json) is present in the index.
 * Curated games found among the top games are flagged curated=true; curated
 * games missing entirely are synthesized from the curated record itself
 * (guaranteeing presence without a fragile IGDB lookup).
 */
function reconcileWithCurated(entries) {
  const curated = readJson(GAME_DATA_PATH);

  // Index existing entries by every name they can be matched on.
  const byName = new Map();
  for (const entry of entries) {
    for (const name of [entry.name, ...entry.alternativeNames]) {
      const key = normalizeName(name);
      if (key && !byName.has(key)) byName.set(key, entry);
    }
  }

  let flagged = 0;
  let added = 0;
  for (const game of curated) {
    if (!game.title) continue;
    const key = normalizeName(game.title);
    const existing = byName.get(key);
    if (existing) {
      if (!existing.curated) {
        existing.curated = true;
        flagged += 1;
      }
      continue;
    }
    // Not in the top games — synthesize an entry from curated data so it is
    // always searchable. coverImageId comes from the curated boxArtUrl when
    // present (null otherwise; validate-search-index.js catches missing covers).
    const entry = {
      id: null,
      name: game.title,
      alternativeNames: [],
      totalRatingCount: null,
      firstReleaseDate: releaseDateToUnix(game.releaseDate),
      coverImageId: coverIdFromBoxArtUrl(game.boxArtUrl),
      curated: true,
    };
    entries.push(entry);
    byName.set(key, entry);
    added += 1;
  }

  console.log(
    `Reconciled ${curated.length} curated games: ${flagged} matched & flagged, ${added} synthesized.`
  );
  return entries;
}

async function main() {
  console.log('Authenticating with IGDB...');
  const auth = await authenticate();

  console.log(`Fetching top ${TOP_N} games by total_rating_count...`);
  const rawGames = await fetchTopGames(auth);
  console.log(`Fetched ${rawGames.length} games from IGDB.`);

  // Guard against a silent empty result: a valid-but-empty IGDB response (e.g. a
  // wrong/retired filter field) must not quietly produce a curated-only index.
  if (rawGames.length === 0) {
    throw new Error(
      'IGDB returned 0 games. The query was accepted but matched nothing — likely a ' +
        'wrong filter field (IGDB retired `category` in favour of `game_type`) or ' +
        'credentials without access. Aborting instead of writing a curated-only index.'
    );
  }

  // Dedupe on IGDB id (defensive; sort + pagination can rarely repeat a row).
  const seen = new Set();
  const entries = [];
  for (const game of rawGames) {
    if (!game || !game.name) continue;
    if (game.id != null) {
      if (seen.has(game.id)) continue;
      seen.add(game.id);
    }
    entries.push(toIndexEntry(game));
  }

  reconcileWithCurated(entries);
  sortEntries(entries);

  const output = {
    generatedAt: new Date().toISOString(),
    source: 'igdb',
    count: entries.length,
    games: entries,
  };

  writeAtomic(INDEX_PATH, output);
  console.log(`Wrote ${entries.length} entries to ${path.relative(ROOT, INDEX_PATH)}.`);
}

main().catch((err) => {
  console.error('Failed to build search index:', err);
  process.exit(1);
});
