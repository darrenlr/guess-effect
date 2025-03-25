import { useState, useEffect } from "react";

function useArchiveLocalStorage(key, initialValue, gameDate, gameReleaseDate) {
  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      const parsedItem = item ? JSON.parse(item) : initialValue;

      if (!parsedItem?.date || parsedItem.date !== gameDate) {
        return {
          ...initialValue,
          releaseDate: gameReleaseDate,
          date: gameDate,
        };
      }

      return parsedItem; 
    } catch (error) {
      console.error("Error while getting item from localStorage:", error);
      return {
        ...initialValue,
        releaseDate: gameReleaseDate || "", 
        date: gameDate || "", 
      };
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.error("Error while setting item to localStorage:", error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}

export default useArchiveLocalStorage;