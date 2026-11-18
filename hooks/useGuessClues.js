import { useEffect, useMemo, useState } from "react";
import { compareGuess, loadMeta } from "../lib/clues";
import { findIndexedGame, loadSearchIndex, thumbUrl } from "./useGameSearch";

const yearOf = (unixSeconds) => (unixSeconds ? new Date(unixSeconds * 1000).getUTCFullYear() : null);

// For each wrong guess, how close it was to the answer, plus its small cover.
// Nothing is downloaded until the first guess; until it arrives (or if the
// game has no clue data) the rows come back without tiles and the log just
// lists the names.
export default function useGuessClues(game, guesses) {
  const [meta, setMeta] = useState(null);
  const hasGuesses = guesses.length > 0;

  useEffect(() => {
    if (!hasGuesses) return undefined;
    let current = true;
    Promise.all([loadMeta(), loadSearchIndex()])
      .then(([loaded]) => current && setMeta(loaded))
      .catch((error) => console.warn("Guess clues unavailable:", error.message));
    return () => {
      current = false;
    };
  }, [hasGuesses]);

  return useMemo(() => {
    const answer = { id: game.igdbId ?? null, year: Number(String(game.releaseDate).slice(0, 4)) || null };
    return guesses.map((name) => {
      if (!meta) return { name, cover: null, tiles: null };
      const entry = findIndexedGame(name);
      const guess = { name, id: entry ? entry.id : null, year: entry ? yearOf(entry.firstReleaseDate) : null };
      return { name, cover: entry ? thumbUrl(entry.coverImageId) : null, tiles: compareGuess(meta, guess, answer) };
    });
  }, [meta, guesses, game.igdbId, game.releaseDate]);
}
