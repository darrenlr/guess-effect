import { normaliseString } from "../utils/normaliseString";
import { stripBrackets } from "../utils/stringUtils";

// ---------------------------------------------------------------------------
// Scoring and round rules shared by daily, archive and endless. Everything in
// here is a pure function over a plain "round" object, so each mode only has
// to decide what happens when a round starts and when it ends.
//
// A round is saved to localStorage in this shape (unchanged from earlier
// versions apart from the new hints.zoom field):
//   { releaseDate, hints: { publisher, developer, genre, platforms, modes,
//     engine, metacritic, plot, zoom, points }, life: { guesses,
//     remainingGuessCount } }
// ---------------------------------------------------------------------------

export const START_POINTS = 100;
export const LIFE_BONUS = 25; // daily only: points per life left when you win
export const DAILY_LIVES = 4;
export const ENDLESS_LIVES = 10;

// The cover starts zoomed in on one detail and backs out one step at a time.
// The last step is still cropped: the full cover is only shown once the round
// is over. There are five levels, from 14x down to 3x (only about a third of
// the cover's width is ever on screen), and a full zoom-out costs 40 of the
// 100 starting points (4 steps of 10).
export const ZOOM_LEVELS = [14, 9, 6, 4.2, 3];
export const MAX_ZOOM = ZOOM_LEVELS.length - 1;
export const ZOOM_COST = 10;

// Display order. cost 0 = free clues that are always visible.
export const HINTS = [
  { key: "publisher", label: "publishers", cost: 10 },
  { key: "developer", label: "developers", cost: 10 },
  { key: "genre", label: "genres", cost: 5 },
  { key: "platforms", label: "platforms", cost: 5 },
  { key: "modes", label: "modes", cost: 0 },
  { key: "engine", label: "engine", cost: 0 },
  { key: "metacritic", label: "metacritic", cost: 0 },
  { key: "plot", label: "plot", cost: 40 },
];

const HINT_COST = Object.fromEntries(HINTS.map((hint) => [hint.key, hint.cost]));
const PAID_HINTS = HINTS.filter((hint) => hint.cost > 0).map((hint) => hint.key);

const allHintsOn = (hints) => {
  const next = { ...hints };
  HINTS.forEach((hint) => {
    next[hint.key] = true;
  });
  return next;
};

export function createRound(game, lives) {
  return {
    releaseDate: game.releaseDate,
    hints: {
      publisher: false,
      developer: false,
      genre: false,
      platforms: false,
      modes: true,
      engine: true,
      metacritic: true,
      plot: false,
      zoom: 0,
      points: START_POINTS,
    },
    life: { guesses: [], remainingGuessCount: lives },
  };
}

// Reads a saved round, tolerating states written by earlier versions (which
// had a pixelation level instead of zoom, and a derived hearts array).
export function readRound(saved, game, lives) {
  const fresh = createRound(game, lives);
  if (!saved || typeof saved !== "object") return fresh;
  return {
    ...saved,
    releaseDate: game.releaseDate,
    // A zoom saved when there were more levels is capped to the last one.
    hints: { ...fresh.hints, ...(saved.hints || {}), zoom: Math.min(saved.hints?.zoom ?? 0, MAX_ZOOM) },
    life: {
      guesses: saved.life?.guesses ?? [],
      remainingGuessCount: saved.life?.remainingGuessCount ?? lives,
    },
  };
}

export function isCorrectGuess(guess, title) {
  return normaliseString(stripBrackets(guess)) === normaliseString(stripBrackets(title));
}

const spend = (points, cost) => Math.max(0, points - cost);

export function revealHint(round, key) {
  if (round.hints[key] || !(key in HINT_COST)) return round;
  return {
    ...round,
    hints: { ...round.hints, [key]: true, points: spend(round.hints.points, HINT_COST[key]) },
  };
}

export function zoomOut(round) {
  const zoom = round.hints.zoom ?? 0;
  if (zoom >= MAX_ZOOM) return round;
  return {
    ...round,
    hints: { ...round.hints, zoom: zoom + 1, points: spend(round.hints.points, ZOOM_COST) },
  };
}

// Spends every remaining point to show all the clues. The cover stays cropped.
export function revealAll(round) {
  return { ...round, hints: { ...allHintsOn(round.hints), zoom: MAX_ZOOM, points: 0 } };
}

export function allHintsRevealed(round) {
  return PAID_HINTS.every((key) => round.hints[key]);
}

export function loseLife(round, guess) {
  const guesses = guess ? [...round.life.guesses, guess] : round.life.guesses;
  return {
    ...round,
    life: { guesses, remainingGuessCount: Math.max(0, round.life.remainingGuessCount - 1) },
  };
}

// Ends a round: every clue is shown, and a lost round scores nothing.
export function finishRound(round, { won }) {
  return {
    ...round,
    hints: { ...allHintsOn(round.hints), points: won ? round.hints.points : 0 },
  };
}

// Daily score: points left plus a bonus for each life you didn't use.
export function dailyScore(round, won) {
  return won ? round.hints.points + round.life.remainingGuessCount * LIFE_BONUS : 0;
}

export const livesLeft = (round) => round.life.remainingGuessCount;
export const zoomStep = (round) => round.hints.zoom ?? 0;
