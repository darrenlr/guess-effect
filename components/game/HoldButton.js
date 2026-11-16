import { useState } from "react";
import styles from "../../styles/game.module.css";

// Press and hold to confirm. Works with mouse, touch and keyboard (hold Space
// or Enter). The fill is a CSS transition, so no timers tick while you hold.
export default function HoldButton({ onComplete, duration = 700, disabled = false, children }) {
  const [holding, setHolding] = useState(false);

  const start = () => {
    if (!disabled) setHolding(true);
  };
  const stop = () => setHolding(false);

  return (
    <button
      type="button"
      className={styles.hold}
      disabled={disabled}
      onPointerDown={start}
      onPointerUp={stop}
      onPointerLeave={stop}
      onPointerCancel={stop}
      onContextMenu={(event) => event.preventDefault()}
      onKeyDown={(event) => {
        if ((event.key === " " || event.key === "Enter") && !event.repeat) start();
      }}
      onKeyUp={stop}
      onBlur={stop}
    >
      <span
        className={styles.holdFill}
        data-holding={holding}
        style={{ transitionDuration: holding ? `${duration}ms` : "0ms" }}
        onTransitionEnd={() => {
          if (holding) {
            setHolding(false);
            onComplete();
          }
        }}
        aria-hidden="true"
      />
      <span className={styles.holdLabel}>{children}</span>
    </button>
  );
}
