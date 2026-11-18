import { useEffect, useState } from "react";
import { readJSON, writeJSON } from "../lib/storage";

// Like useState, but backed by localStorage and read synchronously on the first
// render. Only for components that are mounted on the client after data has
// loaded (the game screens); anything server-rendered should use
// useStoredState so it can't mismatch on hydration.
export default function useLocalState(key, initial) {
  const [value, setValue] = useState(() => {
    const saved = readJSON(key, null);
    return saved && typeof saved === "object" && !Array.isArray(saved) ? { ...initial, ...saved } : initial;
  });

  useEffect(() => {
    writeJSON(key, value);
  }, [key, value]);

  return [value, setValue];
}
