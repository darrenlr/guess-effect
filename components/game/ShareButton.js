import { useState } from "react";
import { DAILY_LIVES } from "../../lib/rules";
import { formatLongDate } from "../../lib/dates";
import Button from "../ui/Button";

// Shares the result with the phone's share sheet when there is one, otherwise
// copies it to the clipboard.
export default function ShareButton({ score, remainingGuesses, releaseDate }) {
  const [copied, setCopied] = useState(false);

  const text = [
    "🎮 guesseffect.wtf",
    formatLongDate(releaseDate),
    "❤️".repeat(remainingGuesses) + "🖤".repeat(DAILY_LIVES - remainingGuesses),
    `🏆 ${score}`,
  ].join("\n");

  const share = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ text });
        return;
      }
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      if (error?.name !== "AbortError") window.alert("Couldn't share. Try copying it by hand.");
    }
  };

  return (
    <Button block onClick={share} aria-live="polite">
      {copied ? "[COPIED!]" : "[SHARE]"}
    </Button>
  );
}
