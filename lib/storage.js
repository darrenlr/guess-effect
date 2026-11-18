// Every localStorage key the game uses, in one place. These names are part of
// the save format: players' progress lives under them, so don't rename them.
export const KEYS = {
  history: "GAME_HISTORY",
  daily: "CURRENT_GAME_STATE",
  archive: "ARCHIVED_GAME_STATE",
  settings: "USER_SETTINGS",
  endlessState: (mode = "easy") => `ENDLESS_${mode.toUpperCase()}_STATE`,
  endlessStats: (mode = "easy") => `ENDLESS_${mode.toUpperCase()}_STATS`,
};

export function readJSON(key, fallback) {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw == null ? fallback : JSON.parse(raw);
  } catch (error) {
    console.warn(`Could not read "${key}" from localStorage`, error);
    return fallback;
  }
}

export function writeJSON(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`Could not write "${key}" to localStorage`, error);
  }
}

export function removeKey(key) {
  try {
    window.localStorage.removeItem(key);
  } catch (error) {
    console.warn(`Could not remove "${key}" from localStorage`, error);
  }
}
