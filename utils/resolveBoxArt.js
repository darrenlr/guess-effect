import fs from 'fs';
import path from 'path';

// Fills in a curated game's boxArtUrl from the local search index when the
// gameData entry omits it, and adds its IGDB id (igdbId) so the game can look
// up its clue data in games-meta.json. Future gameData entries can leave out
// boxArtUrl and have it derived from the matching games-index.json
// coverImageId, e.g.
// images.igdb.com/igdb/image/upload/t_cover_big/{coverImageId}.webp
//
// The index is read once and cached per server instance.

// Keep this in sync with normalizeName in scripts/lib/searchIndex.js — it is
// how curated titles are matched to index entries.
function normalizeName(name) {
  return String(name || '')
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

// IGDB cover id (e.g. "co1otr") from a stored box art URL.
function coverIdFromUrl(url) {
  const match = String(url || '').match(/\/upload\/[^/]+\/([^/.]+)\./);
  return match ? match[1] : null;
}

let lookups = null;

function load() {
  if (lookups) return lookups;
  const byName = new Map(); // normalized name -> { id, cover }
  const byCover = new Map(); // cover id -> id
  try {
    const filePath = path.join(process.cwd(), 'public', 'games-index.json');
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const games = data.games || [];
    for (const game of games) {
      if (game.coverImageId && game.id != null && !byCover.has(game.coverImageId)) {
        byCover.set(game.coverImageId, game.id);
      }
    }
    // Primary names first, so a game's own title always beats another game's
    // alternative name.
    for (const game of games) {
      const key = normalizeName(game.name);
      if (key && !byName.has(key)) byName.set(key, { id: game.id, cover: game.coverImageId });
    }
    for (const game of games) {
      for (const name of game.alternativeNames || []) {
        const key = normalizeName(name);
        if (key && !byName.has(key)) byName.set(key, { id: game.id, cover: game.coverImageId });
      }
    }
  } catch (error) {
    console.error('resolveBoxArt: could not load games-index.json', error);
  }
  lookups = { byName, byCover };
  return lookups;
}

// Return the game with boxArtUrl and igdbId filled in from the index when they
// are missing. Values already on the entry are left alone.
export function withBoxArt(game) {
  if (!game) return game;
  const { byName, byCover } = load();
  const named = byName.get(normalizeName(game.title));

  let next = game;
  if (!game.boxArtUrl && named && named.cover) {
    next = {
      ...next,
      boxArtUrl: `images.igdb.com/igdb/image/upload/t_cover_big/${named.cover}.webp`,
    };
  }
  if (game.igdbId == null) {
    // The cover id is the most reliable link to a specific game; fall back to
    // the title.
    const id = byCover.get(coverIdFromUrl(next.boxArtUrl)) ?? (named ? named.id : null);
    if (id != null) next = { ...next, igdbId: id };
  }
  return next;
}

export function withBoxArtAll(games) {
  return Array.isArray(games) ? games.map(withBoxArt) : games;
}
