import React, { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "../components/Navbar";
import ArchiveModal from "../components/ArchiveModal";
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
      <Navbar showCalendar={false} showStats={false} showHelp={false} showSupport={true} showSettings={true} />
      
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
                <span className={styles.optionTitle}>DIR /ARCHIVE</span>
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
                <span className={styles.optionTitle}>EASY.COM</span>
                <span className={styles.optionDescription}>Coming Soon</span>
              </button>
                </Link>
              <button className={`${styles.optionButton} ${styles.mediumOption}`} disabled>
                <span className={styles.optionTitle}>Medium</span>
                <span className={styles.optionDescription}>Coming Soon</span>
              </button>
              <button className={`${styles.optionButton} ${styles.hardOption}`} disabled>
                <span className={styles.optionTitle}>Hard</span>
                <span className={styles.optionDescription}>Coming Soon</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {showCalendar && (
        <ArchiveModal closeModal={() => setShowCalendar(false)} gameHistory={gameHistory} />
      )}
    </>
  );
};

export default Home;
