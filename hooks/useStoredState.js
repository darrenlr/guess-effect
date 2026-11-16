import { useEffect, useState } from "react";
import { readJSON, writeJSON } from "../lib/storage";

// useState that persists to localStorage. It renders the initial value first
// and loads the saved one after mount, so server-rendered pages never mismatch
// on hydration. `ready` flips to true once the saved value has been read.
export default function useStoredState(key, initial) {
  const [value, setValue] = useState(initial);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const saved = readJSON(key, null);
    setValue(saved && typeof saved === "object" && !Array.isArray(saved) ? { ...initial, ...saved } : initial);
    setReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    if (ready) writeJSON(key, value);
  }, [key, value, ready]);

  return [value, setValue, ready];
}
