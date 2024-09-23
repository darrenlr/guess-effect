// hooks/usePlayerStats.js
import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../utils/firebase';

const usePlayerStats = (triggerUpdate) => {
  const [playerCount, setPlayerCount] = useState(0);
  const [globalAverageScore, setGlobalAverageScore] = useState(0);
  const [globalAverageGuesses, setGlobalAverageGuesses] = useState(0);

  const fetchPlayerStats = async () => {
    const today = new Date().toISOString().split("T")[0];
    const docRef = doc(db, "playerStats", today);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { count, totalScore, totalGuesses } = docSnap.data();
      const averageScore = count > 0 ? totalScore / count : 0;
      const averageGuesses = count > 0 ? totalGuesses / count : 0;

      return { count, averageScore, averageGuesses };
    }

    return { count: 0, averageScore: 0, averageGuesses: 0 };
  };

  useEffect(() => {
    fetchPlayerStats().then(({ count, averageScore, averageGuesses }) => {
      setPlayerCount(count);
      setGlobalAverageScore(Math.round(averageScore));
      setGlobalAverageGuesses(Math.round(averageGuesses));
    });
  }, [triggerUpdate]);

  return {
    playerCount,
    globalAverageScore,
    globalAverageGuesses,
  };
};

export default usePlayerStats;
