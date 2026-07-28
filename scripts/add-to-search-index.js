/**
 * add-to-search-index.js
 * ----------------------
 * Adds a single game to public/games-index.json without a full rebuild. Use it
 * when validate-search-index.js reports a curated title that isn't in the
 * search index (typically a game outside IGDB's top ~5000).
 *
 * Usage:
 *   # Look the game up on IGDB (needs IGDB_CLIENT_ID / IGDB_CLIENT_SECRET):
 *   node scripts/add-to-search-index.js "Some Game Title"
 *
 *   # Add it manually, no IGDB call (when the lookup is wrong or unavailable).
 *   # The cover id is the co******* part of an IGDB box-art URL:
 *   node scripts/add-to-search-index.js "Some Game Title" --cover co1a2b [--year 2011] [--id 12345]
 *
 * It is idempotent: if the title is already in the index, it reports that and
 * exits 0. After adding, commit the updated public/games-index.json.
 */

const {
  INDEX_PATH,
  GAME_FIELDS,
  authenticate,
  queryIgdb,
  normalizeName,
  toIndexEntry,
  sortEntries,
  indexEntryByName,
  readJson,
  writeAtomic,
} = require('./lib/searchIndex');

function parseArgs(argv) {
  const args = { title: null, cover: null, year: null, id: null };
  const positional = [];
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--cover') args.cover = argv[++i];
    else if (arg === '--year') args.year = argv[++i];
    else if (arg === '--id') args.id = argv[++i];
    else positional.push(arg);
  }
  args.title = positional.join(' ').trim();
  return args;
}

function usage(message) {
  if (message) console.error(`Error: ${message}\n`);
  console.error(
    'Usage:\n' +
      '  node scripts/add-to-search-index.js "Game Title"\n' +
      '  node scripts/add-to-search-index.js "Game Title" --cover co1a2b [--year 2011] [--id 12345]'
  );
  process.exit(1);
}

/** Build an index entry from manual flags (no IGDB call). */
function manualEntry({ title, cover, year, id }) {
  let firstReleaseDate = null;
  if (year) {
    const parsed = Date.parse(`${year}-01-01T00:00:00Z`);
    firstReleaseDate = Number.isNaN(parsed) ? null : Math.floor(parsed / 1000);
  }
  return {
    id: id ? Number(id) : null,
    name: title,
    alternativeNames: [],
    totalRatingCount: null,
    firstReleaseDate,
    coverImageId: cover,
    curated: true,
  };
}

/** Look the game up on IGDB and return a shaped entry, or null if no good match. */
async function lookupOnIgdb(title) {
  const auth = await authenticate();
  const escaped = title.replace(/"/g, '\\"');
  const query = `${GAME_FIELDS} search "${escaped}"; where game_type = 0; limit 15;`;
  const results = await queryIgdb(query, auth);

  if (!results.length) return { entry: null, candidates: [] };

  const target = normalizeName(title);
  const scored = results.map((game) => toIndexEntry(game, { curated: true }));

  // Prefer an exact normalized-name (or alt-name) match; among those, the
  // most-rated. This avoids silently adding the wrong game.
  const exact = scored.filter((e) =>
    [e.name, ...e.alternativeNames].some((n) => normalizeName(n) === target)
  );
  const pool = exact.length ? exact : [];
  pool.sort((a, b) => (b.totalRatingCount || 0) - (a.totalRatingCount || 0));

  return { entry: pool[0] || null, candidates: scored.slice(0, 5) };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.title) usage('a game title is required');

  const index = readJson(INDEX_PATH);
  const byName = indexEntryByName(index.games);

  const existing = byName.get(normalizeName(args.title));
  if (existing) {
    console.log(
      `Already in the index: "${existing.name}" (coverImageId: ${existing.coverImageId || 'none'}).`
    );
    if (!existing.coverImageId) {
      console.log(
        'Warning: this entry has no coverImageId, so box art cannot be derived. ' +
          'Re-add it with --cover to fix.'
      );
    }
    return;
  }

  let entry;
  if (args.cover) {
    entry = manualEntry(args);
  } else {
    console.log(`Looking up "${args.title}" on IGDB...`);
    const { entry: found, candidates } = await lookupOnIgdb(args.title);
    if (!found) {
      console.error(`\nNo exact IGDB match for "${args.title}".`);
      if (candidates.length) {
        console.error('Closest candidates:');
        for (const c of candidates) {
          console.error(`  - ${c.name} (coverImageId: ${c.coverImageId || 'none'})`);
        }
      }
      console.error(
        '\nRe-run with the exact title, or add it manually:\n' +
          `  node scripts/add-to-search-index.js "${args.title}" --cover <coverImageId>`
      );
      process.exit(1);
    }
    entry = found;
  }

  if (!entry.coverImageId) {
    console.error(
      `Refusing to add "${entry.name}" with no coverImageId — box art could not be ` +
        'derived for it. Provide one with --cover.'
    );
    process.exit(1);
  }

  index.games.push(entry);
  sortEntries(index.games);
  index.count = index.games.length;

  writeAtomic(INDEX_PATH, index);
  const year = entry.firstReleaseDate
    ? new Date(entry.firstReleaseDate * 1000).getUTCFullYear()
    : 'unknown';
  console.log(
    `Added "${entry.name}" (id: ${entry.id ?? 'none'}, year: ${year}, ` +
      `coverImageId: ${entry.coverImageId}). Index now has ${index.count} games.`
  );
  console.log('Remember to commit public/games-index.json.');
}

main().catch((err) => {
  console.error('Failed to add to search index:', err);
  process.exit(1);
});
