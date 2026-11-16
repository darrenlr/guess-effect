import { KEYS } from "../../lib/storage";
import { initialHistory, summarise } from "../../lib/history";
import useLocalState from "../../hooks/useLocalState";
import Modal from "../ui/Modal";
import styles from "../../styles/result.module.css";

export default function StatsModal({ onClose }) {
  const [history] = useLocalState(KEYS.history, initialHistory);
  const { highest, average } = summarise(history);
  const rows = [
    ["HIGH_SCORE.DAT", highest],
    ["GAMES_PLAYED.DAT", history.games],
    ["AVG_SCORE.DAT", average],
    ["WINS.DAT", history.wins],
    ["STREAK.DAT", history.currentStreak],
    ["MAX_STREAK.DAT", history.longestStreak],
  ];

  return (
    <Modal title="C:\GAMES\STATS.EXE" onClose={onClose}>
      <dl className={styles.files}>
        {rows.map(([name, value]) => (
          <div key={name}>
            <dt>{name}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
    </Modal>
  );
}
