import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../utils/firebase';

const getCollectionName = () => {
  const branch = process.env.NEXT_PUBLIC_BRANCH || 'main'; 

  if (branch === 'release') {
    return "playerStats-release";
  }

  return "playerStats";
};

const usePlayerStats = (triggerUpdate) => {
  const [playerCount, setPlayerCount] = useState(0);
  const [globalAverageScore, setGlobalAverageScore] = useState(0);
  const [globalAverageGuesses, setGlobalAverageGuesses] = useState(0);
  const [globalWinners, setGlobalWinners] = useState(0);
  const [globalHighScore, setGlobalHighScore] = useState(0);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchPlayerStats = async () => {
    const collectionName = getCollectionName();

    const today = new Date().toISOString().split("T")[0];
    const docRef = doc(db, collectionName, today);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { count, totalScore, totalGuesses, totalWinners, highScore, lastUpdated } = docSnap.data();
      const averageScore = count > 0 ? totalScore / count : 0;
      const averageGuesses = count > 0 ? totalGuesses / count : 0;

      return { count, averageScore, averageGuesses, totalWinners, highScore, lastUpdated };
    }

    return { count: 0, averageScore: 0, averageGuesses: 0, totalWinners: 0, highScore: 0, lastUpdated: null };
  };

  useEffect(() => {
    fetchPlayerStats().then(({ count, averageScore, averageGuesses, totalWinners, highScore, lastUpdated }) => {
      setPlayerCount(count);
      setGlobalAverageScore(Math.round(averageScore));
      setGlobalAverageGuesses(Math.round(averageGuesses));
      setGlobalWinners(totalWinners);
      setGlobalHighScore(highScore);
      setLastUpdated(lastUpdated)
    });
  }, [triggerUpdate]);

  return {
    playerCount,
    globalAverageScore,
    globalAverageGuesses,
    globalWinners,
    globalHighScore,
    lastUpdated,
  };
};

export default usePlayerStats;
