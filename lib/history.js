// Daily/archive history, saved under GAME_HISTORY.
export const initialHistory = {
  wins: 0,
  games: 0,
  currentStreak: 0,
  longestStreak: 0,
  scores: [],
};

// A score of 0 is a loss. Streaks are counted over the scores in the order
// they were recorded, exactly as earlier versions did.
export function calculateStreaks(scores) {
  let currentStreak = 0;
  let longestStreak = 0;
  for (const { score } of scores) {
    currentStreak = score > 0 ? currentStreak + 1 : 0;
    longestStreak = Math.max(longestStreak, currentStreak);
  }
  return { currentStreak, longestStreak };
}

export function addResult(history, { date, releaseDate, score, won }) {
  const scores = [...history.scores, { releaseDate, date, score }];
  return {
    ...history,
    wins: history.wins + (won ? 1 : 0),
    games: history.games + 1,
    scores,
    ...calculateStreaks(scores),
  };
}

export function findResult(history, date, releaseDate) {
  return history.scores.find((entry) => entry.date === date && entry.releaseDate === releaseDate);
}

export function summarise(history) {
  const scores = history.scores.map((entry) => entry.score);
  const highest = scores.length ? Math.max(...scores) : 0;
  const average = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  return { highest, average };
}
