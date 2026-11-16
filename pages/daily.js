import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Faq from "../components/Faq";
import SeoHead, { breadcrumbs, faqSchema, webApp } from "../components/SeoHead";
import Loader from "../components/ui/Loader";
import DailyGame from "../components/game/DailyGame";
import { todayUtc } from "../lib/dates";
import { DAILY_FAQ } from "../lib/content";
import gameStyles from "../styles/game.module.css";
import styles from "../styles/page.module.css";

const schema = {
  "@context": "https://schema.org",
  "@graph": [
    webApp(
      "Guess Effect — Daily Mode",
      "/daily",
      "Today's daily video game guessing puzzle. Guess the hidden title from its release date, a zoomed-in piece of its box art and clues. New puzzle every 24 hours."
    ),
    breadcrumbs(["Home", "/"], ["Daily", "/daily"]),
    faqSchema(DAILY_FAQ),
  ],
};

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

// /daily is today's puzzle; /daily?date=YYYY-MM-DD is an archive game.
export default function Daily() {
  const router = useRouter();
  const [game, setGame] = useState(null);
  const [status, setStatus] = useState("loading");

  const requested = typeof router.query.date === "string" ? router.query.date : null;
  const date = requested && DATE_PATTERN.test(requested) ? requested : null;

  useEffect(() => {
    if (!router.isReady) return undefined;
    const controller = new AbortController();
    setStatus("loading");
    fetch(`/api/getGameInfo?date=${date || todayUtc()}`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`No game for that date (${response.status})`);
        return response.json();
      })
      .then((data) => {
        setGame(data);
        setStatus("ready");
      })
      .catch((error) => {
        if (error.name === "AbortError") return;
        console.error(error);
        setStatus("missing");
      });
    return () => controller.abort();
  }, [router.isReady, date]);

  return (
    <>
      <SeoHead
        title="Daily Video Game Guessing Game — Play Today's Puzzle | Guess Effect"
        description="Play today's daily video game guessing puzzle. Name the game from its release date, a zoomed-in piece of its box art and clues. New game every 24 hours. Free to play, no signup."
        path="/daily"
        shareTitle="Today's Daily Video Game Guessing Game"
        shareDescription="New puzzle every day. Guess the game from its box art and hints."
        schema={schema}
      />
      <Navbar />

      <main>
        <h1 className="sr-only">Daily Video Game Guessing Game</h1>
        {status === "loading" && <Loader />}
        {status === "missing" && (
          <p role="alert" className={gameStyles.failed}>
            Your princess is in another castle!
            <br />
            <br />
            No game found for the selected date.
          </p>
        )}
        {status === "ready" && game && <DailyGame key={game.date} game={game} isArchive={Boolean(date)} />}
        <div className={styles.page}>
          <Faq items={DAILY_FAQ} />
        </div>
      </main>

      <Footer />
    </>
  );
}
