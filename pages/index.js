import React, { useState } from "react";
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

  return (
    <>
      <Navbar showCalendar={false} showStats={false} />
      <div className="mode-selection-container">
        <p className="subtitle">Choose Your Mode</p>
        
        <div className="mode-boxes">
          {/* Daily Mode Box */}
          <div className="mode-box">
            <h2 className="box-title">📅 Daily</h2>
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

          {/* Endless Mode Box */}
          <div className="mode-box">
            <h2 className="box-title">♾️ Endless</h2>
            <div className="mode-options">
              <Link href="/endless">
                <button className="option-button easy-option">
                  <span className="difficulty-badge easy">Easy</span>
                  <span className="option-title">Endless Mode</span>
                  <span className="option-description">Test your skills!</span>
                </button>
              </Link>
              
              <button className="option-button medium-option" disabled>
                <span className="difficulty-badge medium">Medium</span>
                <span className="option-title">Coming Soon</span>
                <span className="option-description">More challenge awaits</span>
              </button>
              
              <button className="option-button hard-option" disabled>
                <span className="difficulty-badge hard">Hard</span>
                <span className="option-title">Coming Soon</span>
                <span className="option-description">Ultimate challenge</span>
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
          font-family: var(--font-family);
          font-size: 1.4rem;
          color: #fff;
          margin-bottom: 2.5rem;
          opacity: 0.9;
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
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 15px;
          padding: 2rem;
          min-width: 300px;
          max-width: 450px;
          flex: 1;
        }

        .box-title {
          font-family: var(--font-family);
          font-size: 2rem;
          color: #fff;
          margin: 0 0 1.5rem 0;
          text-align: center;
        }

        .mode-options {
          display: flex;
          flex-direction: column;
          gap: 1rem;
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
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-family: var(--font-family);
          color: #fff;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
          position: relative;
          min-height: 90px;
          width: 100%;
        }

        .option-button:hover:not(:disabled) {
          transform: translateY(-3px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
        }

        .option-button:disabled {
          opacity: 0.4;
          cursor: not-allowed;
          background: linear-gradient(135deg, #555 0%, #333 100%);
        }

        .daily-option {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        }

        .archive-option {
          background: linear-gradient(135deg, #6a82fb 0%, #fc5c7d 100%);
        }

        .easy-option {
          background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
        }

        .medium-option {
          background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
        }

        .hard-option {
          background: linear-gradient(135deg, #ff6a00 0%, #ee0979 100%);
        }

        .difficulty-badge {
          position: absolute;
          top: 0.5rem;
          left: 0.5rem;
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.7rem;
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .difficulty-badge.easy {
          background: rgba(76, 175, 80, 0.9);
        }

        .difficulty-badge.medium {
          background: rgba(255, 152, 0, 0.9);
        }

        .difficulty-badge.hard {
          background: rgba(244, 67, 54, 0.9);
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
