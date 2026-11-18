import { useState } from "react";
import { KEYS, readJSON, writeJSON } from "../../lib/storage";
import Modal from "../ui/Modal";
import styles from "../../styles/result.module.css";

const PRESETS = [
  { name: "Matrix Green", value: "#00ff41" },
  { name: "Amber", value: "#ffb000" },
  { name: "Blue", value: "#00d4ff" },
  { name: "Purple", value: "#c77dff" },
  { name: "Red", value: "#ff4757" },
  { name: "Cyan", value: "#00fff9" },
];

// The HUD colour drives the whole theme. It's saved under USER_SETTINGS and
// applied to :root straight away; _document.js re-applies it before paint on
// the next visit.
export default function SettingsModal({ onClose }) {
  const [hud, setHud] = useState(() => {
    const saved = readJSON(KEYS.settings, null)?.hud_colour;
    return /^#[0-9a-f]{6}$/i.test(saved || "") ? saved : "#00ff41";
  });

  const apply = (color) => {
    setHud(color);
    document.documentElement.style.setProperty("--hud-color", color);
    writeJSON(KEYS.settings, { ...readJSON(KEYS.settings, {}), hud_colour: color });
  };

  return (
    <Modal title="C:\GAMES\SETTINGS.EXE" onClose={onClose}>
      <p className={styles.settingsTitle}>&gt; HUD_COLOUR</p>

      <label className={styles.current}>
        <span>CURRENT</span>
        <input type="color" value={hud} onChange={(event) => apply(event.target.value)} aria-label="Custom HUD colour" />
        <span className={styles.hex}>{hud.toUpperCase()}</span>
      </label>

      <div className={styles.presets} role="group" aria-label="HUD colour presets">
        {PRESETS.map((preset) => (
          <button
            key={preset.value}
            type="button"
            className={`${styles.preset} ${preset.value === hud.toLowerCase() ? styles.presetOn : ""}`}
            onClick={() => apply(preset.value)}
            aria-pressed={preset.value === hud.toLowerCase()}
          >
            <span className={styles.swatch} style={{ background: preset.value }} />
            {preset.name}
          </button>
        ))}
      </div>
      <p className={styles.saved}>Saved on this device.</p>
    </Modal>
  );
}
