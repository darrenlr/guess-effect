import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import styles from "../../styles/page.module.css";

const ArchiveModal = dynamic(() => import("../modals/ArchiveModal"), { ssr: false });

const SHOWN = 12;

// Your latest games as covers on a shelf: solved ones in colour, missed ones
// greyed out. Tap one to open it again. The covers come from your saved
// history, so nothing is shown until it has loaded in the browser.
export default function Shelf({ history, ready }) {
  const [covers, setCovers] = useState([]);
  const [showAll, setShowAll] = useState(false);

  // Latest games first, one per day.
  const latest = useMemo(() => {
    const byDate = new Map();
    history.scores.forEach((entry) => byDate.set(entry.date, entry.score));
    return [...byDate]
      .sort((a, b) => (a[0] < b[0] ? 1 : -1))
      .slice(0, SHOWN)
      .map(([date, score]) => ({ date, score }));
  }, [history.scores]);

  const key = latest.map((entry) => entry.date).join(",");

  useEffect(() => {
    if (!ready || !key) return undefined;
    let current = true;
    fetch(`/api/getShelf?dates=${key}`)
      .then((response) => (response.ok ? response.json() : []))
      .then((games) => current && setCovers(games))
      .catch(() => current && setCovers([]));
    return () => {
      current = false;
    };
  }, [ready, key]);

  const scoreOf = new Map(latest.map((entry) => [entry.date, entry.score]));
  const shelf = latest.map((entry) => covers.find((game) => game.date === entry.date)).filter(Boolean);

  return (
    <section className={styles.stack} aria-labelledby="shelf-title">
      <div className={styles.shelfHead}>
        <h2 id="shelf-title" className={styles.sectionTitle}>
          &gt; YOUR_SHELF
        </h2>
        <button type="button" className={styles.link} onClick={() => setShowAll(true)}>
          [SEE_ALL]
        </button>
      </div>

      {ready && latest.length === 0 && (
        <p className={styles.windowText}>Nothing here yet. Play a game and its cover goes on your shelf.</p>
      )}

      {shelf.length > 0 && (
        <ul className={styles.shelf}>
          {shelf.map((game) => {
            const score = scoreOf.get(game.date);
            const missed = score === 0;
            return (
              <li key={game.date} className={styles.shelfItem}>
                <Link href={`/daily?date=${game.date}`} aria-label={`${game.title}, ${missed ? "missed" : `score ${score}`}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    className={`${styles.shelfCover} ${missed ? styles.shelfMissed : ""}`}
                    src={`https://${game.boxArtUrl}`}
                    alt=""
                    width="84"
                    height="112"
                    loading="lazy"
                    decoding="async"
                  />
                  <span className={styles.shelfTitle}>{game.title}</span>
                  <span className={missed ? styles.shelfMiss : styles.shelfScore}>{missed ? "MISSED" : score}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      {showAll && <ArchiveModal onClose={() => setShowAll(false)} />}
    </section>
  );
}
