import Fuse from "fuse.js";

// The search index (~1MB) is fetched and indexed once per page load and shared
// by every guess box. Nothing is downloaded until a guess box asks for it.
const MAX_RESULTS = 20;

let fuse = null;
let loading = null;
let duplicateNames = new Set();
let byName = new Map(); // lower-case title -> index entry (the most popular one)

const nameKey = (name) => String(name || "").toLowerCase().replace(/\s+/g, " ").trim();

const releaseYear = (unixSeconds) =>
  unixSeconds ? new Date(unixSeconds * 1000).getUTCFullYear() : null;

// Only titles that appear more than once get a year appended ("God of War
// (2005)"). The submitted value is always the bare title.
function labelFor(game) {
  if (!duplicateNames.has(nameKey(game.name))) return game.name;
  const year = releaseYear(game.firstReleaseDate);
  return year ? `${game.name} (${year})` : game.name;
}

export function loadSearchIndex() {
  if (fuse) return Promise.resolve(fuse);
  if (!loading) {
    loading = fetch("/games-index.json")
      .then((response) => response.json())
      .then(({ games }) => {
        const counts = new Map();
        games.forEach((game) => {
          const key = nameKey(game.name);
          counts.set(key, (counts.get(key) || 0) + 1);
        });
        duplicateNames = new Set([...counts].filter(([, n]) => n > 1).map(([key]) => key));
        // The index is sorted most-popular first, so the first entry with a
        // given name is the one a player most likely meant.
        byName = new Map();
        games.forEach((game) => {
          const key = nameKey(game.name);
          if (!byName.has(key)) byName.set(key, game);
        });
        fuse = new Fuse(games, {
          keys: [
            { name: "name", weight: 0.7 },
            { name: "alternativeNames", weight: 0.3 },
          ],
          threshold: 0.3,
          ignoreLocation: true,
          minMatchCharLength: 2,
        });
        return fuse;
      })
      .catch((error) => {
        loading = null; // let a later attempt retry
        throw error;
      });
  }
  return loading;
}

export async function searchGames(query) {
  const index = await loadSearchIndex();
  return index
    .search(query, { limit: MAX_RESULTS })
    .map(({ item }) => ({ value: item.name, label: labelFor(item) }));
}

// The index entry (id, release date...) for a title a player guessed. Only
// valid once loadSearchIndex() has resolved.
export function findIndexedGame(name) {
  return byName.get(nameKey(name)) || null;
}
