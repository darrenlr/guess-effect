import { HINTS } from "../../lib/rules";
import styles from "../../styles/game.module.css";

const TITLES = {
  publisher: "PUBLISHER",
  developer: "DEVELOPER",
  genre: "GENRE",
  platforms: "PLATFORMS",
  modes: "MODES",
  engine: "ENGINE",
  metacritic: "METACRITIC",
  plot: "PLOT",
};

const hasData = (value) => (Array.isArray(value) ? value.length > 0 : Boolean(value));

// Metacritic's own colour bands, kept so the score reads at a glance.
function MetacriticBadge({ score }) {
  const value = parseInt(score, 10);
  const band = value < 50 ? styles.metaLow : value < 75 ? styles.metaMid : styles.metaHigh;
  return <span className={`${styles.meta} ${band}`}>{score}</span>;
}

function HintValue({ hint, data }) {
  if (hint === "metacritic") return <MetacriticBadge score={data} />;
  return <span className={styles.lineValue}>{Array.isArray(data) ? data.join(", ") : data}</span>;
}

// The clues, with no window around them: a row of buttons you pay points to
// open, then each opened clue (and the free ones) listed underneath.
export default function HintsPanel({ hints, data, onReveal, disabled }) {
  const paid = HINTS.filter(({ key, cost }) => cost > 0 && hasData(data[key]));
  const shown = HINTS.filter(({ key, cost }) => hasData(data[key]) && (cost === 0 || hints[key]));

  return (
    <section className={styles.hints} aria-labelledby="hints-heading">
      <div className={styles.hintsHead}>
        <h2 id="hints-heading" className={styles.hintsTitle}>
          &gt; HINTS
        </h2>
        <span className={styles.hintsNote}>COSTS POINTS</span>
      </div>

      {paid.length > 0 && (
        <div className={styles.hintBtns}>
          {paid.map(({ key, cost }) => {
            const open = Boolean(hints[key]);
            return (
              <button
                key={key}
                type="button"
                className={`${styles.hintBtn} ${open ? styles.hintBtnOn : ""}`}
                onClick={() => onReveal(key)}
                disabled={disabled || open}
                aria-pressed={open}
              >
                <span>{TITLES[key]}</span>
                <span className={styles.hintCost}>-{cost}</span>
              </button>
            );
          })}
        </div>
      )}

      {shown.map(({ key }) => (
        <p key={key} className={styles.line}>
          <span className={styles.lineKey}>&gt; {TITLES[key]}: </span>
          <HintValue hint={key} data={data[key]} />
        </p>
      ))}
    </section>
  );
}
