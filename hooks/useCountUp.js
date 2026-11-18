import { useEffect, useState } from "react";

// Counts from `from` to `to` over `duration` ms, easing out.
export default function useCountUp(to, { from = 0, duration = 1000, enabled = true } = {}) {
  const [value, setValue] = useState(enabled ? from : to);

  useEffect(() => {
    if (!enabled) {
      setValue(to);
      return undefined;
    }
    let frame;
    const started = performance.now();
    const tick = (now) => {
      const t = Math.min((now - started) / duration, 1);
      setValue(Math.round(from + (to - from) * (1 - Math.pow(1 - t, 3))));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [to, from, duration, enabled]);

  return value;
}
