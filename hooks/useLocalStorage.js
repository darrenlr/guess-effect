import { useState, useEffect } from "react";

function useLocalStorage(key, initialValue, gameReleaseDate) {
	const todaysDate = new Date().toISOString().split("T")[0];
  
	const [storedValue, setStoredValue] = useState(() => {
	  if (typeof window === "undefined") {
		return initialValue;
	  }
  
	  try {
		const item = window.localStorage.getItem(key);
		const parsedItem = item ? JSON.parse(item) : initialValue;

		if (gameReleaseDate) {
			// If no date is stored or the stored date doesn't match today's date, reset the game state
			if (!parsedItem?.date || parsedItem.date !== todaysDate) {
		  		return {
				...initialValue,
				releaseDate: gameReleaseDate,
				date: todaysDate, 
		  		};
			}
		}
  
		return parsedItem;
	  } catch (error) {
		console.error("Error while getting item from localStorage:", error);
		return {
		  ...initialValue,
		  releaseDate: gameReleaseDate,
		  date: todaysDate,
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

export default useLocalStorage;
