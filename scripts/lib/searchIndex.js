/**
 * scripts/lib/searchIndex.js
 * --------------------------
 * Shared helpers for the search-index tooling (build / add / validate). Keeping
 * these in one place means the IGDB auth flow, the curated<->index name
 * matching, and the entry shape stay identical across every script.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const GAME_DATA_PATH = path.join(ROOT, 'data', 'gameData.json');
const INDEX_PATH = path.join(ROOT, 'public', 'games-index.json');

const IGDB_GAMES_ENDPOINT = 'https://api.igdb.com/v4/games';
const TWITCH_TOKEN_ENDPOINT = 'https://id.twitch.tv/oauth2/token';

// Fields fetched for every game. game_type = 0 ("main game") is applied by the
// caller's `where` clause; IGDB retired the old `category` field in its favour.
const GAME_FIELDS =
  'fields id, name, alternative_names.name, total_rating_count, ' +
  'first_release_date, cover.image_id;';

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
 * Resolve IGDB credentials from the environment (or .env files) and return an
 * authenticated context `{ clientId, token }` for queryIgdb. Throws with a
 * clear message when credentials are missing.
 */
async function authenticate() {
  loadDotEnv();
  const clientId = process.env.IGDB_CLIENT_ID;
  const clientSecret = process.env.IGDB_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error(
      'Missing IGDB_CLIENT_ID / IGDB_CLIENT_SECRET. Set them in the environment ' +
        'or in a .env.local file at the project root.'
    );
  }
  const token = await getAccessToken(clientId, clientSecret);
  return { clientId, token };
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

/** Build the (protocol-less) box-art URL used by gameData from a cover id. */
function boxArtUrlFromCoverId(coverImageId) {
  return coverImageId
    ? `images.igdb.com/igdb/image/upload/t_cover_big/${coverImageId}.webp`
    : null;
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

/** Sort index entries: most-rated first, curated-only synthesized entries last. */
function sortEntries(entries) {
  return entries.sort(
    (a, b) => (b.totalRatingCount || 0) - (a.totalRatingCount || 0)
  );
}

/**
 * Map every searchable name (name + alternativeNames) to its index entry, so a
 * curated title can be matched to the entry that carries its cover. First write
 * wins, matching the reconciliation logic in build-search-index.js.
 */
function indexEntryByName(games) {
  const byName = new Map();
  for (const entry of games) {
    for (const name of [entry.name, ...(entry.alternativeNames || [])]) {
      const key = normalizeName(name);
      if (key && !byName.has(key)) byName.set(key, entry);
    }
  }
  return byName;
}

/** Read + parse a JSON file. */
function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

/** Write JSON atomically (temp file + rename) so re-runs never leave a partial. */
function writeAtomic(filePath, data) {
  const tmp = `${filePath}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(data));
  fs.renameSync(tmp, filePath);
}

module.exports = {
  ROOT,
  GAME_DATA_PATH,
  INDEX_PATH,
  IGDB_GAMES_ENDPOINT,
  GAME_FIELDS,
  loadDotEnv,
  getAccessToken,
  queryIgdb,
  authenticate,
  normalizeName,
  coverIdFromBoxArtUrl,
  boxArtUrlFromCoverId,
  releaseDateToUnix,
  toIndexEntry,
  sortEntries,
  indexEntryByName,
  readJson,
  writeAtomic,
};
