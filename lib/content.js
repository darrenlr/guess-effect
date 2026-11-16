// Questions and answers shown on the pages and reused as FAQPage structured
// data. Keep these in step with the rules in lib/rules.js.
export const DAILY_FAQ = [
  [
    "How often does the daily puzzle change?",
    "A new video game is chosen every 24 hours at midnight UTC. Every player sees the same game on the same day.",
  ],
  [
    "Do I need an account to play?",
    "No. Guess Effect is free and requires no signup. Your stats are saved in your browser.",
  ],
  [
    "Can I play past daily puzzles?",
    "Yes. Open the archive from the calendar icon, or from the Daily window on the home page, and play any previous day's puzzle.",
  ],
  [
    "How does scoring work?",
    "You start each puzzle with 100 points. Zooming out on the box art and decrypting hints costs points. Guess correctly to bank what's left, plus 25 bonus points for every life you have remaining. Four wrong guesses end the puzzle.",
  ],
  [
    "How does the box art work?",
    "The cover starts zoomed right in on one small detail. Each time you zoom out you see a little more of it, and it costs 5 points. The full cover only appears once the game is over.",
  ],
];

export const ENDLESS_FAQ = [
  [
    "What is endless mode?",
    "Endless mode lets you play unlimited rounds of the video game guessing game. Each round uses a random game from our database, and you continue until your lives run out.",
  ],
  [
    "How many lives do I get in endless mode?",
    "You start with 10 lives. Each wrong guess or skipped game costs one life. When you run out of lives the session ends and your final score is recorded.",
  ],
  [
    "How is my score calculated?",
    "Each round starts with a point pool. Zooming out and revealing hints reduces the pool, and a correct guess banks whatever points remain. Your total endless score is the sum across every round in the session.",
  ],
  [
    "Is progress saved between sessions?",
    "Yes. Your current session persists if you close the tab and come back later, and your personal best score and longest streak are saved in your browser.",
  ],
  [
    "How is endless mode different from daily mode?",
    "Daily mode gives every player the same single puzzle per 24 hours. Endless mode lets you play an unlimited number of random puzzles back-to-back in one session.",
  ],
];

export const HOME_FAQ = [
  [
    "What is Guess Effect?",
    "Guess Effect is a free video game guessing game. Each puzzle gives you a release date and a box-art crop that starts zoomed right in. Trade points for clues and name the game before you run out of lives.",
  ],
  DAILY_FAQ[0],
  DAILY_FAQ[2],
  ENDLESS_FAQ[0],
];
