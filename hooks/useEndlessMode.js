import { useState, useEffect } from 'react';

const useEndlessMode = (mode = 'easy') => {
  const storageKey = `ENDLESS_${mode.toUpperCase()}_STATE`;
  const statsKey = `ENDLESS_${mode.toUpperCase()}_STATS`;

  const getInitialState = () => {
    if (typeof window === 'undefined') return null;
    
    try {
      const stored = window.localStorage.getItem(storageKey);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Error reading endless state:', error);
      return null;
    }
  };

  const getInitialStats = () => {
    if (typeof window === 'undefined') {
      return {
        highScore: 0,
        longestStreak: 0,
        totalRuns: 0,
      };
    }
    
    try {
      const stored = window.localStorage.getItem(statsKey);
      return stored ? JSON.parse(stored) : {
        highScore: 0,
        longestStreak: 0,
        totalRuns: 0,
      };
    } catch (error) {
      console.error('Error reading endless stats:', error);
      return {
        highScore: 0,
        longestStreak: 0,
        totalRuns: 0,
      };
    }
  };

  const [state, setState] = useState(getInitialState);
  const [stats, setStats] = useState(getInitialStats);

  useEffect(() => {
    if (state && typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(state));
      } catch (error) {
        console.error('Error saving endless state:', error);
      }
    }
  }, [state, storageKey]);

  useEffect(() => {
    if (stats && typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(statsKey, JSON.stringify(stats));
      } catch (error) {
        console.error('Error saving endless stats:', error);
      }
    }
  }, [stats, statsKey]);

  const clearState = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(storageKey);
    }
    setState(null);
  };

  const updateStats = (finalScore, finalStreak) => {
    setStats(prev => ({
      highScore: Math.max(prev.highScore, finalScore),
      longestStreak: Math.max(prev.longestStreak, finalStreak),
      totalRuns: prev.totalRuns + 1,
    }));
  };

  return {
    state,
    setState,
    stats,
    updateStats,
    clearState,
  };
};

export default useEndlessMode;
