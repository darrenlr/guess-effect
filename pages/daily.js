import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Navbar from "../components/Navbar";
import GameSystem from "../components/GameSystem";
import MessageModal from "../components/MessageModal";
import useLocalStorage from "../hooks/useLocalStorage";
import useHudColor from "../hooks/useHudColor";
import Script from "next/script";
import Footer from "../components/Footer";

const initialGameHistory = {
  wins: 0,
  games: 0,
  currentStreak: 0,
  longestStreak: 0,
  scores: [],
};

const Daily = () => {
  useHudColor();
  const router = useRouter();
  const [gameHistory, setGameHistory] = useLocalStorage("GAME_HISTORY", initialGameHistory);
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Get date from URL query param, default to today
  const selectedDate = router.query.date || new Date().toISOString().split("T")[0];
  const isArchiveGame = !!router.query.date;

  useEffect(() => {
    // Don't fetch until router is ready
    if (!router.isReady) return;

    const fetchGameInfo = async (date) => {
      setLoading(true);
      try {
        const res = await fetch(`/api/getGameInfo?date=${date}`);
        if (!res.ok) {
          throw new Error(`Failed to fetch game for date: ${date}`);
        }
        const data = await res.json();
        setGame(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchGameInfo(selectedDate);
  }, [selectedDate, router.isReady]);

  return (
    <>
      <Navbar gameHistory={gameHistory} />


      {/* SEO: Hidden keyword section */}
      <section className="sr-only">
        <h1>Daily Video Game Guessing Game</h1>
        <p>
          Welcome to Guess Effect – the daily video game guessing game where you
          guess the title from its release date, hints, and clues. Trade points
          for hints, challenge friends, and see if you can keep your streak alive.
        </p>
      </section>

      {/* SEO: Structured Data for Bing/Google */}
      <Script type="application/ld+json" id="game-schema" strategy="afterInteractive">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Game",
          "name": "Guess Effect – Daily Video Game Guessing Game",
          "description":
            "Play Guess Effect, the daily video game guessing game where you guess the title from its release date and clues.",
          "url": "https://guesseffect.wtf"
        })}
      </Script>

      {loading ? (
        <div className="loading-container">
          <p className="loader"></p>
        </div>
      ) : game ? (
        <GameSystem
          game={game}
          gameHistory={gameHistory}
          setGameHistory={setGameHistory}
          isArchive={isArchiveGame}
        />
      ) : (
        <div className="loading-container">
          <div className="error-container">
            <p className="error-message">Your princess is in another castle!
              <br></br>
              <br></br>
              No game found for the selected date.
            </p>
          </div>
        </div>
      )}


      <Footer />

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
        .loading-container {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 50vh;
          }

.loader {
  width: fit-content;
  font-size: 17px;
   font-family: var(--font-family);
  line-height: 1.4;
  font-weight: bold;
  padding: 30px 2px 50px;
  position: relative;
  overflow: hidden;
  animation: l10-0 2s infinite cubic-bezier(1,175,.5,175);
   border: 2px solid #fff;
   border-radius: 5px;
   background-color: #000;
}
.loader::before {
  content:"Loading...";
  display:inline-block;
  animation: l10-2 2s infinite;
}
.loader::after {
  content:"";
  position: absolute;
  width: 34px;
  height: 28px;
  top: 110%;
  left: calc(50% - 16px);
  background:
    linear-gradient(90deg,#0000 12px,#f92033 0 22px,#0000 0 26px,#fdc98d 0 32px,#0000) bottom 26px left 50%,
    linear-gradient(90deg,#0000 10px,#f92033 0 28px,#fdc98d 0 32px,#0000 0) bottom 24px  left 50%,
    linear-gradient(90deg,#0000 10px,#643700 0 16px,#fdc98d 0 20px,#000 0 22px,#fdc98d 0 24px,#000 0 26px,#f92033 0 32px,#0000 0) bottom 22px left 50%,
    linear-gradient(90deg,#0000 8px,#643700 0 10px,#fdc98d 0 12px,#643700 0 14px,#fdc98d 0 20px,#000 0 22px,#fdc98d 0 28px,#f92033 0 32px,#0000 0) bottom 20px left 50%,
    linear-gradient(90deg,#0000 8px,#643700 0 10px,#fdc98d 0 12px,#643700 0 16px,#fdc98d 0 22px,#000 0 24px,#fdc98d 0 30px,#f92033 0 32px,#0000 0) bottom 18px left 50%,
    linear-gradient(90deg,#0000 8px,#643700 0 12px,#fdc98d 0 20px,#000 0 28px,#f92033 0 30px,#0000 0) bottom 16px left 50%,
    linear-gradient(90deg,#0000 12px,#fdc98d 0 26px,#f92033 0 30px,#0000 0) bottom 14px left 50%,
    linear-gradient(90deg,#fdc98d 6px,#f92033 0 14px,#222a87 0 16px,#f92033 0 22px,#222a87 0 24px,#f92033 0 28px,#0000 0 32px,#643700 0) bottom 12px left 50%,
    linear-gradient(90deg,#fdc98d 6px,#f92033 0 16px,#222a87 0 18px,#f92033 0 24px,#f92033 0 26px,#0000 0 30px,#643700 0) bottom 10px left 50%,
    linear-gradient(90deg,#0000 10px,#f92033 0 16px,#222a87 0 24px,#feee49 0 26px,#222a87 0 30px, #643700 0) bottom 8px left 50%,
    linear-gradient(90deg,#0000 12px,#222a87 0 18px,#feee49 0 20px,#222a87 0 30px,#643700 0) bottom 6px left 50%,
    linear-gradient(90deg,#0000 8px,#643700 0 12px,#222a87 0 30px,#643700 0) bottom 4px left 50%,
    linear-gradient(90deg,#0000 6px,#643700 0 14px,#222a87 0 26px,#0000 0) bottom 2px left 50%,
    linear-gradient(90deg,#0000 6px,#643700 0 10px,#0000 0 ) bottom 0px left 50%;
  background-size: 34px 2px;
  background-repeat: no-repeat;
  animation: inherit;
  animation-name: l10-1;
}
@keyframes l10-0{
  0%,30%   { background-position: 0 0px }
  50%,100% { background-position: 0 -0.1px }
}
@keyframes l10-1{
  50%,100% { top:109.5% };
}
@keyframes l10-2{
  0%,30%   { transform:translateY(0); }
  80%,100% { transform:translateY(-260%); }
}

  .error-container {
    position: relative;
    padding: 16px; 
    background-color: #000;
    color: #fff; 
    font-family: "Press Start 2P", cursive;
    text-align: center; 
    border: 2px dashed #fff; 
    border-radius: 8px; 
    width: max-content; 
    box-sizing: border-box; 

     @media (max-width: 768px) {
    width: 90%; 
  }

  }

  .error-message {
    font-size: 14px;
    color: #fff;
    line-height: 1.6;
    word-wrap: break-word;
  }

        `}</style>
    </>
  );

};

export default Daily;
