import React from "react";
import Link from "next/link";
import Navbar from "../components/Navbar";

const Home = () => {
  return (
    <>
      <Navbar showCalendar={false} showStats={false} />
      <div className="mode-selection-container">
        <p className="subtitle">Choose Your Mode</p>
        
        <div className="mode-buttons">
          <Link href="/daily">
            <button className="mode-button daily-button">
              <span className="mode-icon">📅</span>
              <span className="mode-title">Daily</span>
              <span className="mode-description">Play today&apos;s challenge</span>
            </button>
          </Link>
          
          <button className="mode-button endless-button" disabled>
            <span className="mode-icon">♾️</span>
            <span className="mode-title">Endless</span>
            <span className="mode-description">Coming Soon</span>
          </button>
        </div>
      </div>

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
          font-size: 1.2rem;
          color: #fff;
          margin-bottom: 3rem;
          opacity: 0.9;
        }

        .mode-buttons {
          display: flex;
          gap: 2rem;
          flex-wrap: wrap;
          justify-content: center;
          max-width: 600px;
        }

        .mode-button {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 250px;
          height: 250px;
          padding: 2rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: 3px solid #fff;
          border-radius: 15px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-family: var(--font-family);
          color: #fff;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
        }

        .mode-button:hover:not(:disabled) {
          transform: translateY(-5px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
        }

        .mode-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          background: linear-gradient(135deg, #555 0%, #333 100%);
        }

        .daily-button {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        }

        .endless-button {
          background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
        }

        .mode-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
        }

        .mode-title {
          font-size: 1.8rem;
          font-weight: bold;
          margin-bottom: 0.5rem;
        }

        .mode-description {
          font-size: 0.9rem;
          opacity: 0.9;
        }

        @media (max-width: 768px) {
          .subtitle {
            font-size: 1rem;
          }

          .mode-buttons {
            gap: 1.5rem;
          }

          .mode-button {
            width: 200px;
            height: 200px;
            padding: 1.5rem;
          }

          .mode-icon {
            font-size: 3rem;
          }

          .mode-title {
            font-size: 1.5rem;
          }

          .mode-description {
            font-size: 0.8rem;
          }
        }
      `}</style>
    </>
  );
};

export default Home;
