/**
 * build-search-index.js
 * ----------------------
 * Builds a static, local search index of games from IGDB so that live search
 * can be replaced by a client-side Fuse.js lookup (no per-keystroke API calls).
 *
 * What it does:
 *   1. Authenticates to IGDB via Twitch OAuth (same client_credentials pattern
 *      as pages/api/gamesIgdb.js).
 *   2. Pulls main games only (category = 0), ranked by total_rating_count
 *      (rating *count* is a better popularity proxy than score), top ~5000.
 *   3. Reconciles against data/gameData.json so every curated game is always
 *      present in the index, even if it falls outside the top 5000.
 *   4. Writes the result to public/games-index.json.
 *
 * Output location — why public/ (not data/):
 *   The index is consumed on the client (Phase 2 Fuse.js search). Files under
 *   public/ are served verbatim as static assets at /games-index.json, cached
 *   at Vercel's edge, with zero serverless invocations. Putting it in data/
 *   would force an API route (à la getAllGames.js) to read and re-serialize it
 *   on every request. Static-in-public is cheaper and simpler for this use.
 *
 * Usage:
 *   IGDB_CLIENT_ID=... IGDB_CLIENT_SECRET=... node scripts/build-search-index.js
 *
 * Credentials are read from the environment (or a local .env.local / .env file,
 * which is gitignored). The script is safely re-runnable: it overwrites the
 * output atomically and performs no partial writes.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const GAME_DATA_PATH = path.join(ROOT, 'data', 'gameData.json');
const OUTPUT_PATH = path.join(ROOT, 'public', 'games-index.json');

// How many of the most-rated games to pull from IGDB.
const TOP_N = 5000;
// IGDB caps a single response at 500 rows.
const PAGE_SIZE = 500;
// IGDB rate limit is 4 req/s; stay comfortably under it.
const REQUEST_DELAY_MS = 300;

const IGDB_GAMES_ENDPOINT = 'https://api.igdb.com/v4/games';
const TWITCH_TOKEN_ENDPOINT = 'https://id.twitch.tv/oauth2/token';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Minimal, dependency-free .env loader. Loads .env.local then .env (first
 * wins), without clobbering vars already present in the real environment.
 */
function loadDotEnv() {
  for (const file of ['.env.local', '.env']) {
    const envPath = path.join(ROOT, file);
    if (!fs.existsSync(envPath)) continue;
    const contents = fs.readFileSync(envPath, 'utf8');
    for (const rawLine of contents.split('\n')) {
      const line = rawLine.trim();
      if (!line || line.startsWith('#')) continue;
      const eq = line.indexOf('=');
      if (eq === -1) continue;
      const key = line.slice(0, eq).trim();
      if (process.env[key] !== undefined) continue;
      let value = line.slice(eq + 1).trim();
      // Strip surrounding quotes if present.
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      process.env[key] = value;
    }
  }
}

/** Fetch a Twitch app access token for IGDB (client_credentials grant). */
async function getAccessToken(clientId, clientSecret) {
  const response = await fetch(TWITCH_TOKEN_ENDPOINT, {
    method: 'POST',
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'client_credentials',
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Twitch OAuth failed (${response.status}): ${body}`);
  }

  const data = await response.json();
  if (!data.access_token) {
    throw new Error(`Twitch OAuth returned no access_token: ${JSON.stringify(data)}`);
  }
  return data.access_token;
}

/** POST an APIcalypse query to IGDB /games and return the parsed rows. */
async function queryIgdb(query, { clientId, token }) {
  const response = await fetch(IGDB_GAMES_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Client-ID': clientId,
      Accept: 'application/json',
    },
    body: query,
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`IGDB query failed (${response.status}): ${body}\nQuery: ${query}`);
  }

  return response.json();
}

/**
 * Pull the top TOP_N main games ranked by total_rating_count (desc).
 * category = 0 excludes expansions, DLC, bundles, episodes, etc.
 */
async function fetchTopGames(auth) {
  const fields =
    'fields id, name, alternative_names.name, total_rating_count, ' +
    'first_release_date, cover.image_id;';
  const filter = 'where category = 0 & total_rating_count != null;';

  const games = [];
  for (let offset = 0; offset < TOP_N; offset += PAGE_SIZE) {
    const limit = Math.min(PAGE_SIZE, TOP_N - offset);
    const query = `${fields} ${filter} sort total_rating_count desc; limit ${limit}; offset ${offset};`;
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

/** Normalize a title for fuzzy equality (curated <-> IGDB reconciliation). */
function normalizeName(name) {
  return String(name || '')
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/** Extract the IGDB cover image_id (e.g. "co1otr") from a curated boxArtUrl. */
function coverIdFromBoxArtUrl(boxArtUrl) {
  if (!boxArtUrl) return null;
  const match = String(boxArtUrl).match(/\/upload\/[^/]+\/([^/.]+)\./);
  return match ? match[1] : null;
}

/** Convert an ISO-ish release date ("2002-10-22") to a unix timestamp (secs). */
function releaseDateToUnix(releaseDate) {
  if (!releaseDate) return null;
  const ms = Date.parse(releaseDate);
  return Number.isNaN(ms) ? null : Math.floor(ms / 1000);
}

/** Shape a raw IGDB row into a lean, stable index entry. */
function toIndexEntry(game, { curated = false } = {}) {
  const alternativeNames = Array.isArray(game.alternative_names)
    ? game.alternative_names.map((a) => a && a.name).filter(Boolean)
    : [];
  return {
    id: game.id ?? null,
    name: game.name,
    alternativeNames,
    totalRatingCount: game.total_rating_count ?? null,
    firstReleaseDate: game.first_release_date ?? null,
    coverImageId: game.cover ? game.cover.image_id : null,
    curated,
  };
}

/**
 * Ensure every curated game (data/gameData.json) is present in the index.
 * Curated games found among the top games are flagged curated=true so we know
 * they are protected; curated games missing entirely are synthesized from the
 * curated record itself (guaranteeing presence without a fragile IGDB lookup).
 */
function reconcileWithCurated(entries) {
  const curated = JSON.parse(fs.readFileSync(GAME_DATA_PATH, 'utf8'));

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
    // always searchable.
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

/** Write JSON atomically (temp file + rename) so re-runs never leave a partial. */
function writeAtomic(filePath, data) {
  const tmp = `${filePath}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(data));
  fs.renameSync(tmp, filePath);
}

async function main() {
  loadDotEnv();

  const clientId = process.env.IGDB_CLIENT_ID;
  const clientSecret = process.env.IGDB_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    console.error(
      'Missing IGDB_CLIENT_ID / IGDB_CLIENT_SECRET. Set them in the environment ' +
        'or in a .env.local file at the project root.'
    );
    process.exit(1);
  }

  console.log('Authenticating with IGDB...');
  const token = await getAccessToken(clientId, clientSecret);
  const auth = { clientId, token };

  console.log(`Fetching top ${TOP_N} games by total_rating_count...`);
  const rawGames = await fetchTopGames(auth);
  console.log(`Fetched ${rawGames.length} games from IGDB.`);

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

  // Stable ordering: most-rated first, curated-only synthesized entries last.
  entries.sort((a, b) => (b.totalRatingCount || 0) - (a.totalRatingCount || 0));

  const output = {
    generatedAt: new Date().toISOString(),
    source: 'igdb',
    count: entries.length,
    games: entries,
  };

  writeAtomic(OUTPUT_PATH, output);
  console.log(`Wrote ${entries.length} entries to ${path.relative(ROOT, OUTPUT_PATH)}.`);
}

main().catch((err) => {
  console.error('Failed to build search index:', err);
  process.exit(1);
});
