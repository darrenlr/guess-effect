import { useEffect, useRef, useState } from "react";
import { todayUtc } from "../../lib/dates";
import { KEYS, readJSON, writeJSON } from "../../lib/storage";
import { addResult, findResult, initialHistory, summarise } from "../../lib/history";
import { trackDailyResult } from "../../lib/tracking";
import {
  DAILY_LIVES,
  LIFE_BONUS,
  createRound,
  dailyScore,
  finishRound,
  isCorrectGuess,
  livesLeft,
  loseLife,
  readRound,
  revealAll,
  revealHint,
  zoomOut,
} from "../../lib/rules";
import useLocalState from "../../hooks/useLocalState";
import RoundView from "./RoundView";
import DailyResultModal from "./DailyResultModal";

// Today's puzzle, or any past one from the archive. State lives under the same
// localStorage keys as before: CURRENT_GAME_STATE for today, ARCHIVED_GAME_STATE
// for an archive game, and GAME_HISTORY for results.
export default function DailyGame({ game, isArchive }) {
  const dateKey = isArchive ? game.date : todayUtc();
  const storageKey = isArchive ? KEYS.archive : KEYS.daily;

  const [history, setHistory] = useLocalState(KEYS.history, initialHistory);
  const result = findResult(history, dateKey, game.releaseDate);
  const finished = Boolean(result);
  const won = finished && result.score > 0;

  const [round, setRound] = useState(() => {
    const saved = readJSON(storageKey, null);
    const sameGame = saved && saved.date === dateKey && saved.releaseDate === game.releaseDate;
    return sameGame ? readRound(saved, game, DAILY_LIVES) : createRound(game, DAILY_LIVES);
  });
  const [showResult, setShowResult] = useState(finished);
  const [statsVersion, setStatsVersion] = useState(0);
  const latest = useRef(round);
  latest.current = round;

  useEffect(() => {
    writeJSON(storageKey, { ...round, date: dateKey, hasPlayed: finished });
  }, [round, storageKey, dateKey, finished]);

  const finish = (current, didWin) => {
    const score = dailyScore(current, didWin);
    // A guess that was right on the first try still counts as one guess.
    const guesses = didWin ? Math.max(1, DAILY_LIVES - livesLeft(current)) : DAILY_LIVES;
    setRound(finishRound(current, { won: didWin }));
    setHistory((previous) =>
      addResult(previous, { date: dateKey, releaseDate: game.releaseDate, score, won: didWin })
    );
    setShowResult(true);
    trackDailyResult({ date: dateKey, isArchive, score, guesses, won: didWin }).then(() =>
      setStatsVersion((version) => version + 1)
    );
    if (typeof window.twq === "function") window.twq("event", "tw-ou7tq-ou7tq", { value: score });
  };

  // Out of lives: give the heart a moment to blink, then end the game.
  const remaining = livesLeft(round);
  useEffect(() => {
    if (finished || remaining > 0) return undefined;
    const timer = setTimeout(() => finish(latest.current, false), 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining, finished]);

  const onGuess = (guess) => {
    if (finished) return;
    if (isCorrectGuess(guess, game.title)) finish(round, true);
    else setRound((current) => loseLife(current, guess));
  };

  // Finished games always show everything.
  const shown = finished ? finishRound(round, { won }) : round;
  const lives = livesLeft(round);
  const bonus = won || !finished ? lives * LIFE_BONUS : 0;
  const stats = finished
    ? [{ label: "FINAL_SCORE", value: result.score }]
    : [
        { label: "BONUS", value: bonus },
        { label: "SCORE", value: round.hints.points },
      ];

  return (
    <>
      <RoundView
        path={`${isArchive ? "ARCHIVE" : "DAILY"}\\#${game.gameNumber}`}
        statusTitle="DAILY_STATUS.SYS"
        archivedOn={isArchive ? game.date : null}
        game={game}
        round={shown}
        over={finished}
        lives={{ total: DAILY_LIVES, remaining: lives }}
        stats={stats}
        onGuess={onGuess}
        onRevealHint={(key) => setRound((current) => revealHint(current, key))}
        onZoomOut={() => setRound(zoomOut)}
        onRevealAll={() => setRound(revealAll)}
        onAbort={() => finish({ ...round, life: { ...round.life, remainingGuessCount: 0 } }, false)}
      />
      {showResult && finished && (
        <DailyResultModal
          game={game}
          won={won}
          score={result.score}
          remainingGuesses={lives}
          isArchive={isArchive}
          history={history}
          summary={summarise(history)}
          statsVersion={statsVersion}
          onClose={() => setShowResult(false)}
        />
      )}
    </>
  );
}
