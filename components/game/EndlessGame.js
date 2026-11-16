import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { KEYS, readJSON, removeKey, writeJSON } from "../../lib/storage";
import { createEndlessTracker } from "../../lib/tracking";
import {
  ENDLESS_LIVES,
  isCorrectGuess,
  loseLife,
  revealAll,
  revealHint,
  zoomOut,
} from "../../lib/rules";
import {
  completeGame,
  initialEndlessStats,
  isRunOver,
  newRun,
  pickNext,
  recordRun,
  roundOf,
  runTotals,
  startNextGame,
  updateRound,
} from "../../lib/endless";
import useLocalState from "../../hooks/useLocalState";
import Loader from "../ui/Loader";
import RoundView from "./RoundView";
import HoldButton from "./HoldButton";
import { EndlessRoundModal, EndlessSummaryModal } from "./EndlessModals";
import styles from "../../styles/game.module.css";

const getJSON = (url) =>
  fetch(url).then((response) => {
    if (!response.ok) throw new Error(`${url} returned ${response.status}`);
    return response.json();
  });

// An endless run: random games back to back on one shared set of lives. The
// run is saved under ENDLESS_EASY_STATE so closing the tab doesn't lose it.
export default function EndlessGame() {
  const router = useRouter();
  const [dates, setDates] = useState(null);
  const [run, setRun] = useState(null);
  const [game, setGame] = useState(null);
  const [failed, setFailed] = useState(false);
  const [roundModal, setRoundModal] = useState(null);
  const [stats, setStats] = useLocalState(KEYS.endlessStats(), initialEndlessStats);
  const tracker = useRef(null);
  const runRef = useRef(null);
  const finishing = useRef(false);
  runRef.current = run;
  if (!tracker.current && typeof window !== "undefined") tracker.current = createEndlessTracker();

  // Load the list of games and the saved run (or start a new one).
  useEffect(() => {
    let cancelled = false;
    getJSON("/api/getGameList")
      .then((list) => {
        if (cancelled) return;
        setDates(list);
        const saved = readJSON(KEYS.endlessState(), null);
        const resumed = saved && saved.currentGameReleaseDate ? saved : null;
        const initial = resumed || newRun(pickNext(list, []));
        setRun(initial);
        if (resumed && resumed.gameCompleted && resumed.lives > 0) {
          const last = resumed.gameResults[resumed.gameResults.length - 1];
          if (last) setRoundModal({ result: last, previousLives: resumed.lives, previousScore: resumed.totalScore - last.score });
        }
      })
      .catch((error) => {
        console.error("Could not load endless mode:", error);
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Fetch the current game whenever the run moves on to a new one.
  const currentDate = run?.currentGameReleaseDate;
  useEffect(() => {
    if (!currentDate) return undefined;
    let cancelled = false;
    getJSON(`/api/getGameInfo?releaseDate=${currentDate}`)
      .then((data) => !cancelled && setGame(data))
      .catch((error) => {
        console.error("Could not load the game:", error);
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [currentDate]);

  // Save the run after every change.
  useEffect(() => {
    if (run) writeJSON(KEYS.endlessState(), run);
  }, [run]);

  const finishGame = (won) => {
    const current = runRef.current;
    if (!current || !game || current.gameCompleted || finishing.current) return;
    finishing.current = true;

    const completed = completeGame(current, game, { won });
    const totals = runTotals(completed);
    const progress = { gamesPlayed: totals.played, gamesGuessed: totals.guessed };

    if (isRunOver(completed)) {
      setRun({
        ...completed,
        isNewHighScore: completed.totalScore > stats.highScore,
        isNewStreakRecord: completed.longestStreak > stats.longestStreak,
      });
      setStats((previous) => recordRun(previous, completed));
      tracker.current?.finalise(progress, {
        finalScore: completed.totalScore,
        longestStreak: completed.longestStreak,
      });
    } else {
      setRun(completed);
      tracker.current?.progress(progress);
      const result = completed.gameResults[completed.gameResults.length - 1];
      setTimeout(
        () => setRoundModal({ result, previousLives: current.lives, previousScore: current.totalScore }),
        300
      );
    }
  };

  // Out of lives mid-game: let the last heart blink, then end the run.
  const outOfLives = run && !run.gameCompleted && run.lives <= 0;
  useEffect(() => {
    if (!outOfLives || !game) return undefined;
    const timer = setTimeout(() => finishGame(false), 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [outOfLives, game]);

  if (failed) {
    return (
      <p role="alert" className={styles.failed}>
        Your princess is in another castle!
        <br />
        <br />
        Endless mode couldn&apos;t load. Please refresh and try again.
      </p>
    );
  }
  if (!run || !game || game.releaseDate !== run.currentGameReleaseDate) return <Loader />;

  const round = roundOf(run, game);
  const over = run.gameCompleted;
  const act = (change) => setRun((current) => updateRound(current, game, change));

  const onGuess = (guess) => {
    if (over) return;
    if (isCorrectGuess(guess, game.title)) finishGame(true);
    else act((current) => loseLife(current, guess));
  };

  const skip = () => {
    if (over) return;
    act((current) => loseLife(current));
    setTimeout(() => finishGame(false), 500);
  };

  const next = () => {
    setRoundModal(null);
    finishing.current = false;
    setRun((current) => startNextGame(current, pickNext(dates, current.usedReleaseDates)));
  };

  const playAgain = () => {
    removeKey(KEYS.endlessState());
    tracker.current?.reset();
    finishing.current = false;
    setRoundModal(null);
    setGame(null);
    setRun(newRun(pickNext(dates, [])));
  };

  const backToMenu = () => {
    removeKey(KEYS.endlessState());
    router.push("/");
  };

  const points = round.hints.points;
  const stat = (label, value) => ({ label, value });

  return (
    <>
      <RoundView
        key={game.releaseDate}
        title="ENDLESS.SYS"
        subtitle={`GAME ${run.currentGameNumber} // RUN IN PROGRESS`}
        path={`ENDLESS\\GAME_${run.currentGameNumber}`}
        statusTitle="ENDLESS_STATUS.SYS"
        game={game}
        round={round}
        over={over}
        lives={{ total: ENDLESS_LIVES, remaining: run.lives }}
        stats={[
          stat("GAME", run.currentGameNumber),
          stat("LIVES", `${run.lives}/${ENDLESS_LIVES}`),
          stat("STREAK", run.currentStreak),
          stat("ZOOM"),
          stat("POINTS", points),
          stat("TOTAL", run.totalScore + (over ? 0 : points)),
        ]}
        logNote={`> ${run.lives} LIVES LEFT, SHARED ACROSS THE WHOLE RUN.`}
        onGuess={onGuess}
        onRevealHint={(key) => act((current) => revealHint(current, key))}
        onZoomOut={() => act(zoomOut)}
        onRevealAll={() => act(revealAll)}
        statusFooter={
          <div className={styles.statusAction}>
            <HoldButton onComplete={skip} disabled={over}>
              {run.lives === 1 ? "[GIVE_UP.exe]" : "[SKIP_GAME.exe]"}
              <span className={styles.holdHint}>HOLD</span>
            </HoldButton>
          </div>
        }
      />

      {roundModal && !isRunOver(run) && (
        <EndlessRoundModal
          game={game}
          totalScore={run.totalScore}
          lives={run.lives}
          onContinue={next}
          {...roundModal}
        />
      )}
      {isRunOver(run) && over && (
        <EndlessSummaryModal run={run} stats={stats} onPlayAgain={playAgain} onMenu={backToMenu} />
      )}
    </>
  );
}
