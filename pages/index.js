import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import ScoreSystem from "../components/ScoreSystem";
import useLocalStorage from "../hooks/useLocalStorage";

const initialGameHistory = {
	wins: 0,
	games: 0,
	scores: [],
  };

const Home = () => {
   const [gameHistory, setGameHistory] = useLocalStorage("GAME_HISTORY", initialGameHistory);
   const [game, setGame] = useState(null);

   useEffect(() => {
      const today = new Date().toISOString().split("T")[0];

      const fetchGameInfo = async (date) => {
         try {
            const res = await fetch(`/api/getGameInfo?date=${date}`);
            const data = await res.json();
            setGame(data);
         } catch (error) {
            console.error(error);
         }
      };

      fetchGameInfo(today);
   }, []);

   return (
      <>
         <Navbar gameHistory={gameHistory} />
         <ScoreSystem game={game} gameHistory={gameHistory} setGameHistory={setGameHistory} />
      </>
   );
};

export default Home;