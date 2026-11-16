# Guess Effect

A daily video game guessing game ([guesseffect.wtf](https://guesseffect.wtf)): name the game from its release date,
a zoomed-in piece of its box art, and clues you can buy with points. Modes: **Daily** (plus an archive of past days)
and **Endless**. Built with Next.js (pages router) and React.

## Run it

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # production build
npm run lint
```

`.env.local` needs the Firebase keys (`NEXT_PUBLIC_FIREBASE_*`) and `NEXT_PUBLIC_BRANCH`. When `NEXT_PUBLIC_BRANCH` is
`release`, results are written to the `playerStats-release` / `endlessStats-release` collections so testing never
touches real stats.

## How it's laid out

| Path | What lives there |
| --- | --- |
| `pages/` | `index` (mode select), `daily` (today and `?date=` archive games), `endless`, and the API routes |
| `lib/rules.js` | Scoring and round rules as pure functions: clue costs, zoom levels, lives, daily score |
| `lib/history.js`, `lib/endless.js` | Daily history/streaks and endless run logic |
| `lib/storage.js` | Every localStorage key in one place |
| `lib/tracking.js`, `lib/firebase.js` | Firestore stats. Firebase loads on demand, not with the page |
| `lib/gameData.js` | Server-side puzzle lookup (parsed once per server instance) |
| `components/game/` | `RoundView` (the playing screen every mode shares), `DailyGame`, `EndlessGame`, cover zoom, guess box, clues |
| `components/ui/` | Panel, Button, Modal, Hearts and other building blocks |
| `components/modals/` | Settings, support, help, stats and archive windows |
| `styles/globals.css` | Theme tokens. The HUD colour (`--hud-color`) drives everything else |

Daily, archive and endless all render the same `RoundView`; each mode only decides what happens when a round starts
and ends.

## Saved data (don't break these)

Players' progress lives in localStorage under these keys, and results in Firestore. Changing a name or a shape
silently wipes people's streaks and runs, so treat them as a public format:

- `GAME_HISTORY`: `{ wins, games, currentStreak, longestStreak, scores: [{ releaseDate, date, score }] }`
- `CURRENT_GAME_STATE` / `ARCHIVED_GAME_STATE`: the round in progress for today / for an archive game
- `ENDLESS_<MODE>_STATE` / `ENDLESS_<MODE>_STATS`: the endless run and its best score, streak and run count
- `USER_SETTINGS`: `{ hud_colour }`
- Firestore: `playerStats` (one document per date) and `endlessStats`, plus their `-release` twins

The round shape is documented at the top of `lib/rules.js`. Older saves are read tolerantly (`readRound`).

## Puzzles and search

Puzzles live in `data/gameData.json`; box art is filled in from `public/games-index.json` (see
`utils/resolveBoxArt.js`). The scripts in `scripts/` and the workflows in `.github/workflows/` validate both files.

## Clue grid data

Every wrong guess is compared with the answer on year, studio, publisher, genre and platform (`lib/clues.js`, shown
by `components/game/GuessLog.js`). The comparison data lives in `public/games-meta.json`, keyed by IGDB id, which is
also why every entry in `games-index.json` needs an `id`. The browser loads it only after a first wrong guess.

- `node scripts/build-game-meta.js` fetches any missing games from IGDB and updates the file. It only fetches games
  it doesn't have yet. It needs `IGDB_CLIENT_ID` and `IGDB_CLIENT_SECRET` in `.env.local`.
- `node scripts/add-to-search-index.js` (adding a game) does this for the new game as well.
- `node scripts/validate-search-index.js` runs in CI and fails if a puzzle in `gameData.json` has no clue data.
