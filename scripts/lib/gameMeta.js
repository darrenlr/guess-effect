/**
 * scripts/lib/gameMeta.js
 * -----------------------
 * Builds public/games-meta.json: each searchable game's studio, publisher,
 * genres and platforms from IGDB. The game uses it after a wrong guess to show
 * how close the guess was (same studio? same genre? ...).
 *
 * It's a separate file from games-index.json so search stays small; the game
 * only downloads it once someone has made a guess.
 *
 * Format (compact; one shared list of names):
 *   {
 *     "generatedAt": "...",
 *     "names": ["Valve", "Electronic Arts", "Puzzle", "PC (Microsoft Windows)", ...],
 *     "games": { "<igdb id>": [[developers], [publishers], [genres], [platforms]] }
 *   }
 * where each inner list holds indexes into `names`.
 */

const path = require('path');
const fs = require('fs');
const { ROOT, authenticate, queryIgdb, readJson, writeAtomic } = require('./searchIndex');

const META_PATH = path.join(ROOT, 'public', 'games-meta.json');

const META_FIELDS =
  'fields id, genres.name, platforms.name, involved_companies.developer, ' +
  'involved_companies.publisher, involved_companies.company.name;';

// IGDB caps a response at 500 rows and allows 4 requests a second.
const BATCH_SIZE = 500;
const REQUEST_DELAY_MS = 300;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function readMeta() {
  if (!fs.existsSync(META_PATH)) return { generatedAt: null, names: [], games: {} };
  const meta = readJson(META_PATH);
  return { generatedAt: meta.generatedAt || null, names: meta.names || [], games: meta.games || {} };
}

/** Add IGDB rows to `meta` in place. */
function addRows(meta, rows) {
  const lookup = new Map(meta.names.map((name, index) => [name, index]));
  const indexOf = (name) => {
    if (!lookup.has(name)) {
      lookup.set(name, meta.names.length);
      meta.names.push(name);
    }
    return lookup.get(name);
  };
  const names = (list) => (list || []).map((item) => item && item.name).filter(Boolean).map(indexOf);

  for (const row of rows) {
    const companies = row.involved_companies || [];
    const named = (flag) =>
      companies
        .filter((company) => company[flag] && company.company && company.company.name)
        .map((company) => indexOf(company.company.name));
    meta.games[row.id] = [named('developer'), named('publisher'), names(row.genres), names(row.platforms)];
  }
}

/**
 * Make sure `meta` has an entry for every id (fetching only the missing ones).
 * Returns how many were fetched.
 */
async function ensureMeta(ids, { log = console.log } = {}) {
  const meta = readMeta();
  const missing = [...new Set(ids)].filter((id) => id != null && !(id in meta.games));
  if (!missing.length) return { fetched: 0, total: Object.keys(meta.games).length };

  const auth = await authenticate();
  for (let start = 0; start < missing.length; start += BATCH_SIZE) {
    const batch = missing.slice(start, start + BATCH_SIZE);
    const rows = await queryIgdb(`${META_FIELDS} where id = (${batch.join(',')}); limit ${BATCH_SIZE};`, auth);
    addRows(meta, rows);
    // Games IGDB returns nothing for still get an empty entry, so they aren't
    // re-fetched on every run.
    for (const id of batch) if (!(id in meta.games)) meta.games[id] = [[], [], [], []];
    log(`  fetched ${Math.min(start + BATCH_SIZE, missing.length)} / ${missing.length}`);
    if (start + BATCH_SIZE < missing.length) await sleep(REQUEST_DELAY_MS);
  }

  meta.generatedAt = new Date().toISOString();
  // Stable output: games in id order.
  const sorted = {};
  Object.keys(meta.games)
    .sort((a, b) => Number(a) - Number(b))
    .forEach((id) => {
      sorted[id] = meta.games[id];
    });
  writeAtomic(META_PATH, { generatedAt: meta.generatedAt, names: meta.names, games: sorted });
  return { fetched: missing.length, total: Object.keys(sorted).length };
}

module.exports = { META_PATH, readMeta, ensureMeta };
