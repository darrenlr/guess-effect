import { useMemo, useState } from "react";
import Link from "next/link";
import { ARCHIVE_START, formatLongDate } from "../lib/dates";
import styles from "../styles/calendar.module.css";

const pad = (n) => String(n).padStart(2, "0");
const WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const MONTHS = [
  "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
  "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER",
];

// Games can be played from the first puzzle up to yesterday (UTC).
function yesterday() {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - 1);
  return date.toISOString().split("T")[0];
}

const monthOf = (dateString) => ({ year: Number(dateString.slice(0, 4)), month: Number(dateString.slice(5, 7)) - 1 });

function dayClass(score) {
  if (score == null) return styles.open; // not played yet
  if (score === 0) return styles.lost;
  if (score < 75) return styles.low;
  if (score < 150) return styles.mid;
  return styles.high;
}

// A month grid of past puzzles. Each playable day links to /daily?date=...
// and shows the score you got, if you've played it.
export default function ArchiveCalendar({ history, onPick }) {
  const min = ARCHIVE_START;
  const max = yesterday();
  const [view, setView] = useState(() => monthOf(max));

  const scores = useMemo(() => new Map(history.scores.map((entry) => [entry.date, entry.score])), [history.scores]);

  const first = monthOf(min);
  const last = monthOf(max);
  const index = (v) => v.year * 12 + v.month;
  const canGoBack = index(view) > index(first);
  const canGoForward = index(view) < index(last);
  const shift = (delta) => {
    const n = index(view) + delta;
    setView({ year: Math.floor(n / 12), month: n % 12 });
  };

  const leading = new Date(Date.UTC(view.year, view.month, 1)).getUTCDay();
  const length = new Date(Date.UTC(view.year, view.month + 1, 0)).getUTCDate();

  return (
    <div className={styles.calendar}>
      <div className={styles.head}>
        <button type="button" className={styles.nav} onClick={() => shift(-1)} disabled={!canGoBack} aria-label="Previous month">
          &lt;
        </button>
        <span className={styles.month}>
          {MONTHS[view.month]} {view.year}
        </span>
        <button type="button" className={styles.nav} onClick={() => shift(1)} disabled={!canGoForward} aria-label="Next month">
          &gt;
        </button>
      </div>

      <div className={styles.weekdays} aria-hidden="true">
        {WEEKDAYS.map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>

      <div className={styles.grid}>
        {Array.from({ length: leading }, (_, i) => (
          <span key={`blank-${i}`} />
        ))}
        {Array.from({ length: length }, (_, i) => {
          const day = i + 1;
          const date = `${view.year}-${pad(view.month + 1)}-${pad(day)}`;
          if (date < min || date > max) {
            return (
              <span key={date} className={`${styles.day} ${styles.out}`} aria-hidden="true">
                {day}
              </span>
            );
          }
          const score = scores.has(date) ? scores.get(date) : null;
          return (
            <Link
              key={date}
              href={`/daily?date=${date}`}
              className={`${styles.day} ${dayClass(score)}`}
              onClick={onPick}
              aria-label={`${formatLongDate(date)}, ${score == null ? "not played" : `score ${score}`}`}
            >
              <span>{day}</span>
              {score != null && <span className={styles.score}>{score}</span>}
            </Link>
          );
        })}
      </div>

      <div className={styles.legend}>
        <span><i className={`${styles.key} ${styles.open}`} />NOT PLAYED</span>
        <span><i className={`${styles.key} ${styles.lost}`} />MISSED</span>
        <span><i className={`${styles.key} ${styles.low}`} />&lt;75</span>
        <span><i className={`${styles.key} ${styles.mid}`} />75+</span>
        <span><i className={`${styles.key} ${styles.high}`} />150+</span>
      </div>
    </div>
  );
}
