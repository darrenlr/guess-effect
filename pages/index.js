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
            <h2 className="box-title">[D] Daily</h2>
            <div className="mode-options">
              <Link href="/daily">
                <button className="option-button daily-option">
                  <span className="option-title">Daily Challenge</span>
                  <span className="option-description">Play today&apos;s game</span>
                </button>
              </Link>
              <button className="option-button archive-option" onClick={() => setShowCalendar(true)}>
                <span className="option-title">Archive</span>
                <span className="option-description">Play previous games</span>
              </button>
            </div>
          </div>

          <div className="mode-box">
            <h2 className="box-title">[∞] Endless</h2>
            <div className="mode-options">
              <Link href="/endless">
                <button className="option-button easy-option">
                  <span className="option-title">Easy</span>
                  <span className="option-description">Test your skills</span>
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
          border-radius: 4px;
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
          background: #050505;
          border: 1px solid #333;
          padding: 1rem;
          min-width: 300px;
          max-width: 450px;
          flex: 1;
          position: relative;
          box-shadow: -2px 0 0 #00f2fe, 2px 0 0 #ff0050;
          border-radius: 0;
        }

        .box-title {
            font-family: 'Share Tech Mono', monospace;
          font-size: 2rem;
          font-weight: 700;
          color: #fff;
          margin: 0 0 1.5rem 0;
          text-align: center;
          letter-spacing: 3px;
          text-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
          text-transform: uppercase;
        }

        .mode-options {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .mode-options a {
          width: 100%;
        }

        .option-button {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.2);
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
          background: #00f2fe;
          transition: all 0.2s;
          opacity: 0.5;
        }

        .option-button:hover:not(:disabled) {
          background: rgba(0, 242, 254, 0.1);
          border-color: #00f2fe;
          transform: translate(4px, -4px);
          box-shadow: -4px 4px 0 #ff0050;
        }

        .option-button:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .daily-option:before {
          background: #f5576c;
        }

        .daily-option:hover:not(:disabled) {
          border-color: #f5576c;
          background: rgba(245, 87, 108, 0.1);
        }

        .archive-option:before {
          background: #6a82fb;
        }

        .archive-option:hover:not(:disabled) {
          border-color: #6a82fb;
          background: rgba(106, 130, 251, 0.1);
        }

        .easy-option:before {
          background: #00f2fe;
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
        }

        .option-description {
          font-size: 0.85rem;
          opacity: 0.85;
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
