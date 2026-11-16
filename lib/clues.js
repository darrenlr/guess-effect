// How close a wrong guess was to the answer, on five things: year, studio,
// publisher, genre and platform. The data comes from public/games-meta.json
// (see scripts/lib/gameMeta.js), downloaded the first time someone guesses.
//
// Each clue is "same" (identical), "close" (some overlap, or within two years)
// or "no". For the year it also says which way the answer lies.

let metaPromise = null;

export function loadMeta() {
  if (!metaPromise) {
    metaPromise = fetch("/games-meta.json")
      .then((response) => {
        if (!response.ok) throw new Error(`games-meta.json returned ${response.status}`);
        return response.json();
      })
      .catch((error) => {
        metaPromise = null; // allow a retry on the next guess
        throw error;
      });
  }
  return metaPromise;
}

export const CLUE_COLUMNS = ["Year", "Studio", "Publisher", "Genre", "Platform"];

// Names for a game's studio, publisher, genres and platforms, or null if the
// game isn't in the meta file.
function attributesOf(meta, id) {
  const row = meta.games[id];
  if (!row) return null;
  return row.map((indexes) => indexes.map((index) => meta.names[index]));
}

function compareSets(guess, answer) {
  if (!guess.length || !answer.length) return "unknown";
  const shared = guess.filter((name) => answer.includes(name)).length;
  if (shared === 0) return "no";
  return shared === guess.length && shared === answer.length ? "same" : "close";
}

function describe(names, extra = false) {
  if (!names.length) return "-";
  return extra && names.length > 1 ? `${names[0]} +${names.length - 1}` : names[0];
}

// guess: { name, id, year }  answer: { id, year }
// Returns five tiles, or null when either game has no clue data.
export function compareGuess(meta, guess, answer) {
  const guessAttrs = guess.id != null ? attributesOf(meta, guess.id) : null;
  const answerAttrs = answer.id != null ? attributesOf(meta, answer.id) : null;
  if (!answerAttrs) return null;

  const tiles = [];

  // Year
  if (guess.year == null || answer.year == null) {
    tiles.push({ key: "year", label: "Year", value: "-", status: "unknown" });
  } else {
    const gap = answer.year - guess.year;
    tiles.push({
      key: "year",
      label: "Year",
      value: String(guess.year),
      status: gap === 0 ? "same" : Math.abs(gap) <= 2 ? "close" : "no",
      dir: gap > 0 ? "up" : gap < 0 ? "down" : null,
      note: gap > 0 ? "the answer is later" : gap < 0 ? "the answer is earlier" : "same year",
    });
  }

  // Studio, publisher, genre, platform
  const rest = [
    ["studio", "Studio", 0, false],
    ["publisher", "Publisher", 1, false],
    ["genre", "Genre", 2, false],
    ["platform", "Platform", 3, true],
  ];
  rest.forEach(([key, label, slot, extra]) => {
    if (!guessAttrs) {
      tiles.push({ key, label, value: "-", status: "unknown" });
      return;
    }
    tiles.push({
      key,
      label,
      value: describe(guessAttrs[slot], extra),
      full: guessAttrs[slot].join(", "),
      status: compareSets(guessAttrs[slot], answerAttrs[slot]),
    });
  });

  return tiles;
}
