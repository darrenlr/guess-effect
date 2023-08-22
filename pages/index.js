import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import ScoreSystem from "../components/ScoreSystem";

const Home = () => {
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
         <Navbar />
         <ScoreSystem game={game} />
      </>
   );
};

export default Home;