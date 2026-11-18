import { useEffect, useState } from "react";

// Time until the next daily puzzle, which rolls over at midnight UTC.
function timeUntilMidnightUtc() {
  const now = new Date();
  const next = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1);
  const seconds = Math.max(0, Math.floor((next - now.getTime()) / 1000));
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(Math.floor(seconds / 3600))}:${pad(Math.floor((seconds / 60) % 60))}:${pad(seconds % 60)}`;
}

export default function CountdownTimer() {
  // Empty on the server so the first client render matches it.
  const [time, setTime] = useState("");

  useEffect(() => {
    setTime(timeUntilMidnightUtc());
    const timer = setInterval(() => setTime(timeUntilMidnightUtc()), 1000);
    return () => clearInterval(timer);
  }, []);

  return <span suppressHydrationWarning>{time || "--:--:--"}</span>;
}
