import { useEffect } from "react";
import { ENDLESS_LIVES } from "../../lib/rules";
import { celebrate } from "../../lib/celebrate";
import { runTotals } from "../../lib/endless";
import useCountUp from "../../hooks/useCountUp";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import Hearts from "../ui/Hearts";
import styles from "../../styles/result.module.css";

const Cell = ({ label, value, flag }) => (
  <div>
    <dt>{label}</dt>
    <dd>
      {value}
      {flag && <span className={styles.flag}> {flag}</span>}
    </dd>
  </div>
);

// Shown after every game in a run (unless it was the last life).
export function EndlessRoundModal({ result, game, totalScore, previousScore, lives, previousLives, onContinue }) {
  const shownTotal = useCountUp(totalScore, { from: previousScore, duration: 1000 });

  useEffect(() => {
    celebrate(result.won);
  }, [result.won]);

  const lost = previousLives - lives;

  return (
    <Modal title="C:\GAMES\ENDLESS\ROUND_COMPLETE.EXE">
      <div className={styles.result}>
        <p className={result.won ? styles.win : styles.loss}>{result.won ? ">>> SOLVED <<<" : ">>> SKIPPED <<<"}</p>
        <h2 className={styles.answer}>{game.title}</h2>
        <p className={styles.scoreLabel}>{result.won ? `+${result.score} POINTS` : "NO POINTS"}</p>
        <p className={styles.score}>{shownTotal}</p>
        <p className={styles.scoreLabel}>TOTAL_SCORE</p>
      </div>
      <Hearts total={ENDLESS_LIVES} remaining={lives} />
      {lost > 0 && <p className={styles.lifeChange}>&gt; -{lost} LIFE</p>}
      <Button variant="solid" block onClick={onContinue} autoFocus>
        [CONTINUE.EXE]
      </Button>
    </Modal>
  );
}

// Shown when the run ends.
export function EndlessSummaryModal({ run, stats, onPlayAgain, onMenu }) {
  const { played, guessed, successRate } = runTotals(run);
  const won = run.gameResults.filter((result) => result.won);
  const skipped = run.gameResults.filter((result) => !result.won);

  useEffect(() => {
    celebrate(true);
  }, []);

  return (
    <Modal title="C:\GAMES\ENDLESS\RUN_COMPLETE.EXE">
      <div className={styles.result}>
        <p className={styles.scoreLabel}>&gt; FINAL_SCORE</p>
        <p className={styles.score}>{run.totalScore}</p>
        {run.isNewHighScore && <p className={styles.flag}>NEW HIGH SCORE!</p>}
      </div>

      <dl className={styles.stats}>
        <Cell label="GAMES_PLAYED" value={played} />
        <Cell label="GUESSED" value={guessed} />
        <Cell label="HIGH_SCORE" value={stats.highScore} />
        <Cell label="BEST_STREAK" value={run.longestStreak} flag={run.isNewStreakRecord ? "NEW RECORD!" : null} />
        <Cell label="SUCCESS_RATE" value={`${successRate}%`} />
      </dl>

      {won.length > 0 && (
        <details>
          <summary className={styles.flag}>&gt; GUESSED ({won.length})</summary>
          <ul className={styles.list}>
            {won.map((result, index) => (
              <li key={`${result.gameReleaseDate}-${index}`}>
                {result.gameTitle} <span className={styles.flag}>+{result.score}</span>
              </li>
            ))}
          </ul>
        </details>
      )}
      {skipped.length > 0 && (
        <details>
          <summary className={styles.flag}>&gt; SKIPPED ({skipped.length})</summary>
          <ul className={styles.list}>
            {skipped.map((result, index) => (
              <li key={`${result.gameReleaseDate}-${index}`}>{result.gameTitle}</li>
            ))}
          </ul>
        </details>
      )}

      <Button variant="solid" block onClick={onPlayAgain}>
        [PLAY_AGAIN.EXE]
      </Button>
      <Button block onClick={onMenu}>
        [MENU]
      </Button>
    </Modal>
  );
}

export function EndlessStatsModal({ stats, onClose }) {
  return (
    <Modal title="C:\GAMES\ENDLESS\STATS.SYS" onClose={onClose}>
      <div className={styles.result}>
        <p className={styles.scoreLabel}>&gt; HIGH_SCORE</p>
        <p className={styles.score}>{stats.highScore ?? 0}</p>
      </div>
      <dl className={styles.stats}>
        <Cell label="BEST_STREAK" value={stats.longestStreak ?? 0} />
        <Cell label="TOTAL_RUNS" value={stats.totalRuns ?? 0} />
      </dl>
      <Button block onClick={onClose}>
        [CLOSE.EXE]
      </Button>
    </Modal>
  );
}
