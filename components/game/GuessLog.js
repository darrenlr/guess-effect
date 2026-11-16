import { CLUE_COLUMNS } from "../../lib/clues";
import Panel from "../ui/Panel";
import styles from "../../styles/game.module.css";

const STATUS_CLASS = { same: styles.tileSame, close: styles.tileClose, no: styles.tileNo, unknown: "" };
const STATUS_WORD = { same: "same", close: "close", no: "no match", unknown: "unknown" };

// A tick, a half circle, a cross or an arrow, so a clue reads without the
// colour.
function ClueIcon({ kind }) {
  const common = { width: 16, height: 16, viewBox: "0 0 24 24", "aria-hidden": "true" };
  const stroke = { fill: "none", stroke: "currentColor", strokeWidth: 3.2, strokeLinecap: "square" };
  switch (kind) {
    case "same":
      return (
        <svg {...common} {...stroke}>
          <path d="M5 12.5l4.5 4.5L19 7.5" />
        </svg>
      );
    case "close":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="2.6" />
          <path d="M12 4a8 8 0 0 1 0 16z" fill="currentColor" />
        </svg>
      );
    case "no":
      return (
        <svg {...common} {...stroke}>
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      );
    case "up":
      return (
        <svg {...common} {...stroke}>
          <path d="M12 19V5M6 11l6-6 6 6" />
        </svg>
      );
    case "down":
      return (
        <svg {...common} {...stroke}>
          <path d="M12 5v14M6 13l6 6 6-6" />
        </svg>
      );
    default:
      return null;
  }
}

function Tile({ tile }) {
  const icon = tile.dir || (tile.status === "unknown" ? null : tile.status);
  const label = `${tile.label} ${tile.value}: ${STATUS_WORD[tile.status]}${tile.note ? `, ${tile.note}` : ""}`;
  return (
    <div
      role="img"
      aria-label={label}
      title={tile.full || tile.value}
      className={`${styles.tile} ${STATUS_CLASS[tile.status]}`}
    >
      <span className={styles.tileIcon}>{icon && <ClueIcon kind={icon} />}</span>
      <span className={styles.tileValue}>{tile.value}</span>
    </div>
  );
}

// Every wrong guess with how close it was, plus empty slots for the guesses
// still to come.
export default function GuessLog({ rows, slots = 0, note }) {
  return (
    <Panel title="GUESS_LOG.SYS" className={styles.log}>
      <div className={styles.logLegend}>
        <span className={`${styles.chip} ${styles.chipSame}`}>SAME</span>
        <span className={`${styles.chip} ${styles.chipClose}`}>CLOSE</span>
        <span className={`${styles.chip} ${styles.chipNo}`}>NO</span>
      </div>

      {rows.some((row) => row.tiles) && (
        <div className={styles.logCols} aria-hidden="true">
          {CLUE_COLUMNS.map((column) => (
            <span key={column}>{column}</span>
          ))}
        </div>
      )}

      <ol className={styles.logList}>
        {rows.map((row, index) => (
          <li key={`${row.name}-${index}`} className={styles.logCard}>
            <p className={styles.logName}>{row.name}</p>
            {row.tiles && (
              <div className={styles.tiles}>
                {row.tiles.map((tile) => (
                  <Tile key={tile.key} tile={tile} />
                ))}
              </div>
            )}
          </li>
        ))}
        {Array.from({ length: slots }, (_, index) => (
          <li key={`slot-${index}`} className={styles.slot} aria-hidden="true">
            &gt; GUESS_{rows.length + index + 1} ...
          </li>
        ))}
      </ol>

      {note && <p className={styles.logNote}>{note}</p>}
    </Panel>
  );
}
