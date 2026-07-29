import fs from 'fs';
import path from 'path';

// Fills in a curated game's boxArtUrl from the local search index when the
// gameData entry omits it. Future gameData entries can leave out boxArtUrl and
// have it derived from the matching games-index.json coverImageId, e.g.
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

let coverByName = null;

function coverMap() {
  if (coverByName) return coverByName;
  const map = new Map();
  try {
    const filePath = path.join(process.cwd(), 'public', 'games-index.json');
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    for (const game of data.games || []) {
      if (!game.coverImageId) continue;
      for (const name of [game.name, ...(game.alternativeNames || [])]) {
        const key = normalizeName(name);
        if (key && !map.has(key)) map.set(key, game.coverImageId);
      }
    }
  } catch (error) {
    console.error('resolveBoxArt: could not load games-index.json', error);
  }
  coverByName = map;
  return map;
}

// Return the game with boxArtUrl filled from the index when it is missing.
// Entries that already have a boxArtUrl are returned unchanged.
export function withBoxArt(game) {
  if (!game || game.boxArtUrl) return game;
  const coverImageId = coverMap().get(normalizeName(game.title));
  if (!coverImageId) return game; // validate-search-index.js guards against this
  return {
    ...game,
    boxArtUrl: `images.igdb.com/igdb/image/upload/t_cover_big/${coverImageId}.webp`,
  };
}

export function withBoxArtAll(games) {
  return Array.isArray(games) ? games.map(withBoxArt) : games;
}
