import { useState, useEffect } from "react";

function useLocalStorage(key, initialValue) {
	const [storedValue, setStoredValue] = useState(() => {
		if (typeof window === "undefined") {
			return initialValue;
		}

		try {
			const item = window.localStorage.getItem(key);
			if (item === "undefined") {
				return initialValue;
			}
			const parsedItem = item ? JSON.parse(item) : initialValue;

			return parsedItem;
		} catch (error) {
			console.error("Error while getting item from localStorage:", error);
			return initialValue;
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
