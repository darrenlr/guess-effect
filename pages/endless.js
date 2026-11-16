import { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SeoHead, { breadcrumbs, faqSchema, webApp } from "../components/SeoHead";
import EndlessGame from "../components/game/EndlessGame";
import { EndlessStatsModal } from "../components/game/EndlessModals";
import { ENDLESS_FAQ } from "../lib/content";
import { initialEndlessStats } from "../lib/endless";
import { KEYS, readJSON } from "../lib/storage";

const schema = {
  "@context": "https://schema.org",
  "@graph": [
    webApp(
      "Guess Effect — Endless Mode",
      "/endless",
      "Unlimited rounds of the video game guessing game. Guess as many games as you can before your lives run out. Chase high scores and longest streaks."
    ),
    breadcrumbs(["Home", "/"], ["Endless", "/endless"]),
    faqSchema(ENDLESS_FAQ),
  ],
};

export default function Endless() {
  const [showStats, setShowStats] = useState(false);

  return (
    <>
      <SeoHead
        title="Endless Video Game Guessing Game — Unlimited Rounds | Guess Effect"
        description="Unlimited video game guessing with no daily limit. Zoom out on the box art, reveal clues, guess the title and survive as long as you can. Chase your high score and longest streak."
        path="/endless"
        shareTitle="Endless Mode — Unlimited Video Game Guessing"
        shareDescription="No daily limit. Guess as many video games as you can. How far can you go?"
        schema={schema}
      />
      <Navbar showCalendar={false} help="endless" faq={ENDLESS_FAQ} onStatsClick={() => setShowStats(true)} />

      <main>
        <h1 className="sr-only">Endless Video Game Guessing Game</h1>
        <EndlessGame />
      </main>

      <Footer />

      {showStats && (
        <EndlessStatsModal
          stats={readJSON(KEYS.endlessStats(), initialEndlessStats)}
          onClose={() => setShowStats(false)}
        />
      )}
    </>
  );
}
