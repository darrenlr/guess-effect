import { useEffect, useState } from "react";
import { fetchDailyStats } from "../../lib/tracking";
import { celebrate } from "../../lib/celebrate";
import useCountUp from "../../hooks/useCountUp";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import CountdownTimer from "../ui/CountdownTimer";
import ShareButton from "./ShareButton";
import styles from "../../styles/result.module.css";

// The results window for a finished daily or archive game.
export default function DailyResultModal({
  game,
  won,
  score,
  remainingGuesses,
  isArchive,
  history,
  summary, // { highest, average }
  statsVersion, // bumps once this player's result has been recorded
  onClose,
}) {
  const [global, setGlobal] = useState(null);
  const shownScore = useCountUp(score, { duration: 1400 });

  useEffect(() => {
    celebrate(won);
  }, [won]);

  useEffect(() => {
    if (isArchive) return undefined;
    let current = true;
    fetchDailyStats(game.date).then((stats) => current && setGlobal(stats));
    return () => {
      current = false;
    };
  }, [game.date, isArchive, statsVersion]);

  const winRate = global && global.count > 0 ? ((global.totalWinners / global.count) * 100).toFixed(1) : "0";

  return (
    <Modal title={`C:\\GAMES\\${isArchive ? "ARCHIVE" : "DAILY"}\\${game.date}\\RESULTS.EXE`} onClose={onClose}>
      <div className={styles.result}>
        <p className={won ? styles.win : styles.loss}>{won ? ">>> SUCCESS <<<" : ">>> FAILURE <<<"}</p>
        <h2 className={styles.answer}>{game.title}</h2>
        <p className={styles.scoreLabel}>SCORE</p>
        <p className={styles.score} aria-label={`Score ${score}`}>
          {shownScore}
        </p>
      </div>

      <dl className={styles.stats}>
        <div>
          <dt>GAMES_PLAYED</dt>
          <dd>{history.games}</dd>
        </div>
        <div>
          <dt>WINS</dt>
          <dd>{history.wins}</dd>
        </div>
        <div>
          <dt>STREAK</dt>
          <dd>{history.currentStreak}</dd>
        </div>
        <div>
          <dt>BEST_STREAK</dt>
          <dd>{history.longestStreak}</dd>
        </div>
        <div>
          <dt>HIGH_SCORE</dt>
          <dd>{summary.highest}</dd>
        </div>
        <div>
          <dt>AVG_SCORE</dt>
          <dd>{summary.average}</dd>
        </div>
      </dl>

      {!isArchive && global && (
        <div className={styles.global}>
          <p className={styles.globalTitle}>&gt; ALL_PLAYERS_TODAY:</p>
          <dl className={styles.stats}>
            <div>
              <dt>PLAYERS</dt>
              <dd>{global.count}</dd>
            </div>
            <div>
              <dt>AVG_SCORE</dt>
              <dd>{global.averageScore}</dd>
            </div>
            <div>
              <dt>AVG_GUESSES</dt>
              <dd>{global.averageGuesses}</dd>
            </div>
            <div>
              <dt>WIN_RATE</dt>
              <dd>{winRate}%</dd>
            </div>
          </dl>
        </div>
      )}

      {!isArchive && (
        <>
          <ShareButton score={score} remainingGuesses={remainingGuesses} releaseDate={game.releaseDate} />
          <p className={styles.countdown}>
            NEXT GAME IN: <CountdownTimer />
          </p>
        </>
      )}

      <Button href="/endless" variant="solid" block>
        [PLAY_ENDLESS.EXE]
      </Button>
      <Button block onClick={onClose}>
        [CLOSE]
      </Button>
    </Modal>
  );
}
