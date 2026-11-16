import { HINTS } from "../../lib/rules";
import Panel from "../ui/Panel";
import styles from "../../styles/game.module.css";

// Metacritic's own colour bands, kept so the score reads at a glance.
function MetacriticBadge({ score }) {
  if (!score) return <span className={styles.hintValue}>-</span>;
  const value = parseInt(score, 10);
  const band = value < 50 ? styles.metaLow : value < 75 ? styles.metaMid : styles.metaHigh;
  return <span className={`${styles.meta} ${band}`}>{score}</span>;
}

function HintValue({ hint, data }) {
  if (hint === "metacritic") return <MetacriticBadge score={data} />;
  if (hint === "plot") return <p className={styles.plot}>{data || "-"}</p>;
  if (Array.isArray(data)) {
    return data.length ? (
      <ul className={styles.hintList}>
        {data.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    ) : (
      <span className={styles.hintValue}>-</span>
    );
  }
  return <span className={styles.hintValue}>{data || "-"}</span>;
}

// The clue list. Free clues are open from the start; the rest cost points to
// decrypt.
export default function HintsPanel({ hints, data, onReveal, disabled }) {
  return (
    <Panel title="HINTS.SYS" aside={`${hints.points} PTS`} className={styles.hints}>
      <dl className={styles.hintRows}>
        {HINTS.map(({ key, label, cost }) => {
          const revealed = hints[key] || data[key] === null || data[key] === undefined;
          return (
            <div key={key} className={`${styles.hintRow} ${key === "plot" ? styles.hintRowWide : ""}`}>
              <dt className={styles.hintKey}>&gt; {label}:</dt>
              <dd className={styles.hintBody}>
                {revealed ? (
                  <span className={styles.reveal}>
                    <HintValue hint={key} data={data[key]} />
                  </span>
                ) : (
                  <button
                    type="button"
                    className={styles.decrypt}
                    onClick={() => onReveal(key)}
                    disabled={disabled}
                  >
                    [DECRYPT] (-{cost})
                  </button>
                )}
              </dd>
            </div>
          );
        })}
      </dl>
    </Panel>
  );
}
