import React, { useState, useEffect } from "react";
import Link from "next/link";
import Head from "next/head";
import Navbar from "../components/Navbar";
import ArchiveModal from "../components/ArchiveModal";
import EndlessAnnouncementModal from "../components/EndlessAnnouncementModal";
import useLocalStorage from "../hooks/useLocalStorage";
import useHudColor from "../hooks/useHudColor";
import styles from "../styles/Home.module.css";

const initialGameHistory = {
  wins: 0,
  games: 0,
  currentStreak: 0,
  longestStreak: 0,
  scores: [],
};

const homePageSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Guess Effect",
  "alternateName": "Guess Effect — Video Game Guessing Game",
  "url": "https://guesseffect.wtf",
  "applicationCategory": "GameApplication",
  "operatingSystem": "Any (browser-based)",
  "description": "Free daily video game guessing game with endless mode. Guess the title from release date and hints. No signup required.",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
  "publisher": { "@id": "https://guesseffect.wtf/#org" }
};

const Home = () => {
  useHudColor();
  const [showCalendar, setShowCalendar] = useState(false);
  const [gameHistory] = useLocalStorage("GAME_HISTORY", initialGameHistory);
  const [subtitleText, setSubtitleText] = useState("");

  useEffect(() => {
    const text = "> Choose Your Mode";
    let index = 0;
    setSubtitleText("");

    const intervalId = setInterval(() => {
      index++;
      setSubtitleText(text.slice(0, index));
      if (index === text.length) {
        clearInterval(intervalId);
      }
    }, 100);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <>
      <Head>
        <title>Guess Effect — Daily Video Game Guessing Game & Endless Mode</title>
        <meta
          name="description"
          content="Guess Effect is a free daily video game guessing game. Identify the title from its release date and hints, or play endless mode for unlimited rounds."
        />
        <link rel="canonical" href="https://guesseffect.wtf/" />
        <meta property="og:title" content="Guess Effect — Daily Video Game Guessing Game" />
        <meta
          property="og:description"
          content="Guess the video game from hints. New puzzle every day, plus endless mode for unlimited play."
        />
        <meta property="og:url" content="https://guesseffect.wtf/" />
        <meta name="twitter:title" content="Guess Effect — Daily Video Game Guessing Game" />
        <meta
          name="twitter:description"
          content="Guess the video game from hints. New puzzle every day, plus endless mode for unlimited play."
        />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(homePageSchema) }}
        />
      </Head>

      <Navbar showCalendar={false} showStats={false} showHelp={false} showSupport={true} showSettings={true} />

      {/* SEO content — invisible but crawlable. Keeps the terminal aesthetic
          while giving Google real text to rank. */}
      <section className="sr-only">
        <h1>Guess Effect — Daily Video Game Guessing Game</h1>
        <p>
          Guess Effect is a free online video game guessing game. Every day,
          a new hidden title is chosen from our database of classic and modern
          games. Reveal hints — release date, genre, platform, publisher,
          engine, Metacritic score, plot — and try to guess the title before
          running out of points.
        </p>
        <p>
          Prefer unlimited play? Endless mode lets you guess as many games as
          you can in a single session, with each round pulling a different
          random title. Chase high scores, longest streaks, and see how far
          you can go.
        </p>
      </section>

      <div className={styles.modeSelectionContainer}>
        <p className={styles.subtitle}>
          {subtitleText}<span className={styles.cursor}>_</span>
        </p>

        <div className={styles.modeBoxes}>
          <div className={styles.modeBox}>
            <div className={styles.terminalHeader}>C:\GAMES\DAILY&gt;_</div>
            <h2 className={styles.boxTitle}>&gt; [D] DAILY_MODE.EXE</h2>
            <div className={styles.modeOptions}>
              <Link href="/daily">
                <button className={`${styles.optionButton} ${styles.dailyOption}`}>
                  <span className={styles.optionTitle}>RUN DAILY.BAT</span>
                  <span className={styles.optionDescription}>Play today&apos;s game</span>
                </button>
              </Link>
              <button className={`${styles.optionButton} ${styles.archiveOption}`} onClick={() => setShowCalendar(true)}>
                <span className={styles.optionTitle}>DIR /ARCHIVE.BAT</span>
                <span className={styles.optionDescription}>Play previous games</span>
              </button>
            </div>
          </div>

          <div className={styles.modeBox}>
            <div className={styles.terminalHeader}>C:\GAMES\ENDLESS&gt;_</div>
            <h2 className={styles.boxTitle}>&gt; [∞] ENDLESS.EXE</h2>
            <div className={styles.modeOptions}>
              <Link href="/endless">
                <button className={`${styles.optionButton} ${styles.easyOption}`}>
                  <span className={styles.optionTitle}>EASY</span>
                  <span className={styles.optionDescription}>All hints available</span>
                </button>
              </Link>
              <button className={`${styles.optionButton} ${styles.mediumOption}`} disabled>
                <span className={styles.optionTitle}>MEDIUM</span>
                <span className={styles.optionDescription}>Coming Soon</span>
              </button>
              <button className={`${styles.optionButton} ${styles.hardOption}`} disabled>
                <span className={styles.optionTitle}>MEDIUM</span>
                <span className={styles.optionDescription}>Coming Soon</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {showCalendar && (
        <ArchiveModal closeModal={() => setShowCalendar(false)} gameHistory={gameHistory} />
      )}
      <EndlessAnnouncementModal />

      <style jsx>{`
        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          border: 0;
        }
      `}</style>
    </>
  );
};

export default Home;