import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../utils/firebase';

const usePlayerStats = (triggerUpdate) => {
  const [playerCount, setPlayerCount] = useState(0);
  const [globalAverageScore, setGlobalAverageScore] = useState(0);
  const [globalAverageGuesses, setGlobalAverageGuesses] = useState(0);
  const [globalWinners, setGlobalWinners] = useState(0);
  const [globalHighScore, setGlobalHighScore] = useState(0);

  const fetchPlayerStats = async () => {
    const today = new Date().toISOString().split("T")[0];
    const docRef = doc(db, "playerStats", today);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { count, totalScore, totalGuesses, totalWinners, highScore } = docSnap.data();
      const averageScore = count > 0 ? totalScore / count : 0;
      const averageGuesses = count > 0 ? totalGuesses / count : 0;

      return { count, averageScore, averageGuesses, totalWinners, highScore };
    }

    return { count: 0, averageScore: 0, averageGuesses: 0, totalWinners: 0, highScore: 0 };
  };

  useEffect(() => {
    fetchPlayerStats().then(({ count, averageScore, averageGuesses, totalWinners, highScore }) => {
      setPlayerCount(count);
      setGlobalAverageScore(Math.round(averageScore));
      setGlobalAverageGuesses(Math.round(averageGuesses));
      setGlobalWinners(totalWinners);
      setGlobalHighScore(highScore);
    });
  }, [triggerUpdate]);

  return {
    playerCount,
    globalAverageScore,
    globalAverageGuesses,
    globalWinners,
    globalHighScore,
  };
};

export default usePlayerStats;
