import { ENDLESS_LIVES, createRound, finishRound, readRound } from "./rules";

// ---------------------------------------------------------------------------
// Endless run logic. A run is saved under ENDLESS_<MODE>_STATE in this shape
// (unchanged from earlier versions):
//   { gameResults, lives, totalScore, currentStreak, longestStreak,
//     currentGameNumber, currentGameReleaseDate, usedReleaseDates,
//     gameCompleted, currentGameState, isNewHighScore, isNewStreakRecord }
// `lives` is the one source of truth for lives; the round mirrors it.
// ---------------------------------------------------------------------------

export function newRun(firstReleaseDate) {
  return {
    gameResults: [],
    lives: ENDLESS_LIVES,
    totalScore: 0,
    currentStreak: 0,
    longestStreak: 0,
    currentGameNumber: 1,
    currentGameReleaseDate: firstReleaseDate,
    usedReleaseDates: [firstReleaseDate],
    gameCompleted: false,
    currentGameState: null,
  };
}

// A random game that hasn't come up yet this run. If every game has been
// played, repeats are allowed.
export function pickNext(allReleaseDates, used) {
  const fresh = allReleaseDates.filter((date) => !used.includes(date));
  const pool = fresh.length ? fresh : allReleaseDates;
  return pool[Math.floor(Math.random() * pool.length)];
}

export const isRunOver = (run) => run.lives <= 0;

// The round currently being played, with lives taken from the run.
export function roundOf(run, game) {
  const round = run.currentGameState ? readRound(run.currentGameState, game, run.lives) : createRound(game, run.lives);
  return { ...round, life: { ...round.life, remainingGuessCount: run.lives } };
}

// Applies a round change (a hint, a wrong guess...) to the run.
export function updateRound(run, game, change) {
  const next = change(roundOf(run, game));
  return { ...run, lives: next.life.remainingGuessCount, currentGameState: next };
}

// Ends the current game. A win banks the points left in the round; anything
// else scores nothing and breaks the streak.
export function completeGame(run, game, { won }) {
  const round = roundOf(run, game);
  const score = won ? round.hints.points : 0;
  const streak = won ? run.currentStreak + 1 : 0;
  return {
    ...run,
    gameResults: [
      ...run.gameResults,
      { gameTitle: game.title, gameReleaseDate: game.releaseDate, score, won, guessed: won, skipped: !won },
    ],
    totalScore: run.totalScore + score,
    currentStreak: streak,
    longestStreak: Math.max(run.longestStreak, streak),
    gameCompleted: true,
    currentGameState: finishRound(round, { won }),
  };
}

export function startNextGame(run, nextReleaseDate) {
  return {
    ...run,
    currentGameNumber: run.currentGameNumber + 1,
    currentGameReleaseDate: nextReleaseDate,
    usedReleaseDates: [...run.usedReleaseDates, nextReleaseDate],
    gameCompleted: false,
    currentGameState: null,
  };
}

export const initialEndlessStats = { highScore: 0, longestStreak: 0, totalRuns: 0 };

export function recordRun(stats, run) {
  return {
    highScore: Math.max(stats.highScore, run.totalScore),
    longestStreak: Math.max(stats.longestStreak, run.longestStreak),
    totalRuns: stats.totalRuns + 1,
  };
}

export function runTotals(run) {
  const played = run.gameResults.length;
  const guessed = run.gameResults.filter((result) => result.won).length;
  return { played, guessed, successRate: played ? Math.round((guessed / played) * 100) : 0 };
}
