import { useState } from "react";
import dynamic from "next/dynamic";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SeoHead, { faqSchema, webApp } from "../components/SeoHead";
import ModeWindow from "../components/home/ModeWindow";
import Shelf from "../components/home/Shelf";
import Panel from "../components/ui/Panel";
import Button from "../components/ui/Button";
import Stat from "../components/ui/Stat";
import CountdownTimer from "../components/ui/CountdownTimer";
import useStoredState from "../hooks/useStoredState";
import { KEYS } from "../lib/storage";
import { initialHistory, summarise } from "../lib/history";
import { initialEndlessStats } from "../lib/endless";
import { HOME_FAQ } from "../lib/content";
import styles from "../styles/page.module.css";

// The calendar depends on today's date, so it only exists in the browser and
// only loads once the archive is opened.
const ArchiveCalendar = dynamic(() => import("../components/ArchiveCalendar"), { ssr: false });

const description =
  "Guess Effect is a free daily video game guessing game. Name the game from its release date and a zoomed-in piece of its box art, or play endless mode for unlimited rounds.";

const schema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      ...webApp(
        "Guess Effect",
        "/",
        "Free daily video game guessing game with endless mode. Guess the title from its release date and box art. No signup required."
      ),
      alternateName: "Guess Effect — Video Game Guessing Game",
    },
    faqSchema(HOME_FAQ),
  ],
};

const Glyph = {
  endless: "∞",
  timeline: (
    <svg width="24" height="24" viewBox="0 0 28 28" fill="currentColor" aria-hidden="true">
      <rect x="3" y="14" width="5" height="11" />
      <rect x="11" y="9" width="5" height="16" />
      <rect x="19" y="3" width="5" height="22" />
    </svg>
  ),
  higherLower: (
    <svg width="24" height="24" viewBox="0 0 28 28" fill="currentColor" aria-hidden="true">
      <rect x="11" y="1" width="6" height="4" />
      <rect x="7" y="5" width="14" height="4" />
      <rect x="3" y="9" width="22" height="4" />
      <rect x="3" y="15" width="22" height="4" />
      <rect x="7" y="19" width="14" height="4" />
      <rect x="11" y="23" width="6" height="4" />
    </svg>
  ),
  connections: (
    <svg width="24" height="24" viewBox="0 0 28 28" fill="currentColor" aria-hidden="true">
      {[0, 10, 20].map((y) =>
        [0, 10, 20].map((x) => (
          <rect key={`${x}-${y}`} x={x} y={y} width="8" height="8" fillOpacity={y === 0 ? 1 : 0.4} />
        ))
      )}
    </svg>
  ),
};

const comingSoon = (command) => (
  <Button option unavailable title={command} desc="Coming soon" />
);

export default function Home() {
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [history, , historyReady] = useStoredState(KEYS.history, initialHistory);
  const [endless, , endlessReady] = useStoredState(KEYS.endlessStats(), initialEndlessStats);
  const show = (ready, value) => (ready ? value : "-");

  return (
    <>
      <SeoHead
        title="Guess Effect — Daily Video Game Guessing Game & Endless Mode"
        description={description}
        path="/"
        shareTitle="Guess Effect — Daily Video Game Guessing Game"
        shareDescription="Guess the video game from its box art and hints. New puzzle every day, plus endless mode for unlimited play."
        schema={schema}
      />
      <Navbar showCalendar={false} showStats={false} faq={HOME_FAQ} />

      <main className={styles.page}>
        <section className={styles.intro}>
          <h1 className={styles.title}>
            Guess the video game<span className={styles.cursor}>_</span>
          </h1>
          <p className={styles.lead}>
            A free daily video game guessing game. You get the release date and a tiny, zoomed-in piece of the
            box art. Zoom out and decrypt clues to find the game, but every one costs points.
          </p>
        </section>

        <Panel title="C:\GAMES\DAILY>_" aside="1_GAME_PER_DAY">
          <div className={styles.stack}>
            <span className={styles.prompt}>&gt; [D] DAILY_MODE.EXE</span>
            <p className={styles.windowText}>
              One mystery game a day, the same for everyone. Four lives, and bonus points for every one you keep.
            </p>
            <div className={styles.options}>
              <Button href="/daily" variant="solid" option title="RUN DAILY.BAT" desc="Play today's game" />
              <Button
                option
                title="DIR /ARCHIVE.BAT"
                desc="Play previous games"
                aria-expanded={archiveOpen}
                trailing={<span aria-hidden="true">{archiveOpen ? "[-]" : "[+]"}</span>}
                onClick={() => setArchiveOpen(!archiveOpen)}
              />
            </div>
            {archiveOpen && <ArchiveCalendar history={history} />}
            <p className={styles.next}>
              &gt; NEXT_GAME <strong><CountdownTimer /></strong>
            </p>
          </div>
        </Panel>

        <section className={styles.statRow} aria-label="Your stats">
          <Stat label="STREAK" value={show(historyReady, history.currentStreak)} />
          <Stat label="BEST" value={show(historyReady, summarise(history).highest)} />
          <Stat label="SOLVED" value={show(historyReady, history.wins)} />
        </section>

        <section className={styles.stack} aria-labelledby="more-modes">
          <h2 id="more-modes" className={styles.sectionTitle}>
            &gt; MORE_MODES
          </h2>
          <div className={styles.windows}>
            <ModeWindow path="ENDLESS" name="ENDLESS" blurb="Ten lives, one long run" icon={Glyph.endless}>
              <span className={styles.prompt}>&gt; [∞] ENDLESS.EXE</span>
              <p className={styles.windowText}>
                One game after another on a single set of ten lives. A wrong guess or a skip costs one. Chase your
                best score and longest streak.
              </p>
              <div className={styles.statRow}>
                <Stat label="BEST_SCORE" value={show(endlessReady, endless.highScore)} />
                <Stat label="BEST_STREAK" value={show(endlessReady, endless.longestStreak)} />
                <Stat label="RUNS" value={show(endlessReady, endless.totalRuns)} />
              </div>
              <div className={styles.options}>
                <Button href="/endless" variant="solid" option title="EASY" desc="All hints available" />
                <Button option unavailable title="MEDIUM" desc="Coming soon" />
                <Button option unavailable title="HARD" desc="Coming soon" />
              </div>
            </ModeWindow>

            <ModeWindow path="TIMELINE" name="TIMELINE" blurb="Drag covers into release order" icon={Glyph.timeline}>
              <span className={styles.prompt}>&gt; TIMELINE.EXE</span>
              <p className={styles.windowText}>
                Five covers, one drag. Put them in release order before the clock beats you.
              </p>
              <ul className={styles.tags}>
                <li>5 COVERS</li>
                <li>DRAG TO SORT</li>
                <li>TIMED</li>
              </ul>
              {comingSoon("RUN TIMELINE.BAT")}
            </ModeWindow>

            <ModeWindow
              path="HIGHERLOWER"
              name="HIGHER_LOWER"
              blurb="Earlier or later? Keep the streak"
              icon={Glyph.higherLower}
            >
              <span className={styles.prompt}>&gt; HIGHERLOWER.EXE</span>
              <p className={styles.windowText}>
                Two games, one question: released earlier or later, rated higher or lower? Keep the streak alive for
                as long as you can.
              </p>
              <ul className={styles.tags}>
                <li>ENDLESS</li>
                <li>3 STRIKES</li>
                <li>YEARS + RATINGS</li>
              </ul>
              {comingSoon("RUN HIGHERLOWER.BAT")}
            </ModeWindow>

            <ModeWindow
              path="CONNECTIONS"
              name="CONNECTIONS"
              blurb="Sort 16 covers into 4 families"
              icon={Glyph.connections}
            >
              <span className={styles.prompt}>&gt; CONNECTIONS.EXE</span>
              <p className={styles.windowText}>
                Sixteen covers, four hidden families. Group them by studio, series or genre.
              </p>
              <ul className={styles.tags}>
                <li>16 COVERS</li>
                <li>4 GROUPS</li>
                <li>4 MISTAKES</li>
              </ul>
              {comingSoon("RUN CONNECTIONS.BAT")}
            </ModeWindow>
          </div>
        </section>

        <Shelf history={history} ready={historyReady} />

      </main>

      <Footer />
    </>
  );
}
