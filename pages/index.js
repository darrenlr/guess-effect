import React, { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "../components/Navbar";
import ArchiveModal from "../components/ArchiveModal";
import useLocalStorage from "../hooks/useLocalStorage";

const initialGameHistory = {
  wins: 0,
  games: 0,
  currentStreak: 0,
  longestStreak: 0,
  scores: [],
};

const Home = () => {
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
      <Navbar showCalendar={false} showStats={false} showHelp={false} showSupport={false} />
      
      <div className="mode-selection-container">
        <p className="subtitle">
          {subtitleText}<span className="cursor">_</span>
        </p>
        
        <div className="mode-boxes">
          <div className="mode-box">
            <div className="terminal-header">C:\GAMES\DAILY&gt;_</div>
            <h2 className="box-title">&gt; [D] DAILY_MODE.EXE</h2>
            <div className="mode-options">
              <Link href="/daily">
                <button className="option-button daily-option">
                  <span className="option-title">RUN DAILY.BAT</span>
                  <span className="option-description">Play today&apos;s game</span>
                </button>
              </Link>
              <button className="option-button archive-option" onClick={() => setShowCalendar(true)}>
                <span className="option-title">DIR /ARCHIVE</span>
                <span className="option-description">Play previous games</span>
              </button>
            </div>
          </div>

          <div className="mode-box">
            <div className="terminal-header">C:\GAMES\ENDLESS&gt;_</div>
            <h2 className="box-title">&gt; [∞] ENDLESS.EXE</h2>
            <div className="mode-options">
              <Link href="/endless">
                <button className="option-button easy-option">
                  <span className="option-title">EASY.COM</span>
                  <span className="option-description">All hints available</span>
                </button>
              </Link>
              <button className="option-button medium-option" disabled>
                <span className="option-title">Medium</span>
                <span className="option-description">Coming Soon</span>
              </button>
              <button className="option-button hard-option" disabled>
                <span className="option-title">Hard</span>
                <span className="option-description">Coming Soon</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {showCalendar && (
        <ArchiveModal closeModal={() => setShowCalendar(false)} gameHistory={gameHistory} />
      )}

      <style jsx>{`
        .mode-selection-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          padding: 2rem 20px 20px;
          text-align: center;
        }

        .subtitle {
          font-family: 'Share Tech Mono', monospace;
          font-size: 1.5rem;
          color: #ffffff;
          margin-bottom: 2.5rem;
          opacity: 1;
          letter-spacing: 1px;
          background-color: #000;
          padding: 0.5rem 1rem;
          border: 3px double #00ff41;
          border-radius: 0;
          display: inline-block;
        }

        .cursor {
          animation: blink 1s infinite;
        }

        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }

        .mode-boxes {
          display: flex;
          gap: 2rem;
          flex-wrap: wrap;
          justify-content: center;
          max-width: 1000px;
        }

        .mode-box {
          background: #000;
          border: 3px double #00ff41;
          padding: 1.5rem;
          min-width: 380px;
          max-width: 500px;
          flex: 1;
          position: relative;
          border-radius: 0;
        }

        .terminal-header {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 30px;
          background: #00ff41;
          display: flex;
          align-items: center;
          padding: 0 10px;
          font-family: 'Share Tech Mono', monospace;
          font-size: 12px;
          color: #000;
          font-weight: bold;
        }

        .box-title {
          font-family: 'Share Tech Mono', monospace;
          font-size: 1.5rem;
          font-weight: 700;
          color: #00ff41;
          margin: 40px 0 1.5rem 0;
          text-align: left;
          letter-spacing: 1px;
          text-transform: uppercase;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .mode-options {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .mode-options a {
          width: 100%;
          text-decoration: none;
          color: inherit;
        }

        .mode-options a:link,
        .mode-options a:visited,
        .mode-options a:hover,
        .mode-options a:active {
          text-decoration: none;
          color: inherit;
        }

        .mode-options a * {
          text-decoration: none !important;
        }

        .option-button {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
          background: transparent;
          border: 2px solid #00ff41;
          border-radius: 0;
          cursor: pointer;
          transition: all 0.2s;
          font-family: 'Share Tech Mono', monospace;
          color: #fff;
          position: relative;
          min-height: 90px;
          width: 100%;
          overflow: hidden;
        }

        .option-button:before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 4px;
          height: 100%;
          background: #00ff41;
          transition: all 0.2s;
          opacity: 0.5;
        }

        .option-button:hover:not(:disabled) {
          background: rgba(0, 255, 65, 0.15);
          border-color: #00ff41;
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 255, 65, 0.3);
        }

        .option-button:hover:not(:disabled) .option-title::before {
          content: '> ';
        }

        .option-button:hover:not(:disabled) .option-title::after {
          content: '_';
          animation: blink 1s infinite;
        }

        .option-button:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .daily-option:before {
          background: #00ff41;
        }

        .daily-option:hover:not(:disabled) {
          border-color: #00ff41;
          background: rgba(0, 255, 65, 0.15);
        }

        .archive-option:before {
          background: #00ff41;
        }

        .archive-option:hover:not(:disabled) {
          border-color: #00ff41;
          background: rgba(0, 255, 65, 0.15);
        }

        .easy-option:before {
          background: #00ff41;
        }

        .medium-option:before {
          background: #fa709a;
        }

        .hard-option:before {
          background: #ff6a00;
        }

        .option-title {
          font-size: 1.3rem;
          font-weight: bold;
          margin-bottom: 0.25rem;
          color: #fff;
        }

        .option-description {
          font-size: 0.85rem;
          background: #00ff41;
          color: #000;
          padding: 4px 8px;
          display: inline-block;
          margin-top: 4px;
          text-decoration: none !important;
        }

        @media (max-width: 900px) {
          .mode-boxes {
            flex-direction: column;
            align-items: center;
          }

          .mode-box {
            width: 100%;
            max-width: 400px;
          }
        }

        @media (max-width: 768px) {
          .subtitle {
            font-size: 1.1rem;
          }

          .box-title {
            font-size: 1.6rem;
          }

          .option-button {
            padding: 1.25rem;
            min-height: 80px;
          }

          .option-title {
            font-size: 1.1rem;
          }

          .option-description {
            font-size: 0.75rem;
          }
        }
      `}</style>
    </>
  );
};

export default Home;
