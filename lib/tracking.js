import { getFirestoreClient } from "./firebase";

// The release branch writes to separate collections so testing never pollutes
// real stats.
const SUFFIX = (process.env.NEXT_PUBLIC_BRANCH || "main") === "release" ? "-release" : "";
const DAILY_STATS = `playerStats${SUFFIX}`;
const ENDLESS_STATS = `endlessStats${SUFFIX}`;

const EMPTY_STATS = {
  count: 0,
  averageScore: 0,
  averageGuesses: 0,
  totalWinners: 0,
  highScore: 0,
  archiveCount: 0,
};

// Daily result for a date. Archive plays only bump the archive counters so
// they can't skew the live day's averages. Failures are ignored: tracking must
// never get in the way of playing.
export async function trackDailyResult({ date, isArchive, score, guesses, won }) {
  try {
    const { db, fs } = await getFirestoreClient();
    const ref = fs.doc(db, DAILY_STATS, date);
    const snap = await fs.getDoc(ref);
    const winner = won ? 1 : 0;

    if (isArchive) {
      if (snap.exists()) {
        const data = snap.data();
        await fs.updateDoc(ref, {
          count: data.count + 1,
          archiveCount: (data.archiveCount || 0) + 1,
          totalWinners: data.totalWinners + winner,
          lastUpdated: fs.serverTimestamp(),
        });
      } else {
        await fs.setDoc(ref, {
          count: 1,
          archiveCount: 1,
          totalWinners: winner,
          lastUpdated: fs.serverTimestamp(),
        });
      }
    } else if (snap.exists()) {
      const data = snap.data();
      await fs.updateDoc(ref, {
        count: data.count + 1,
        totalScore: data.totalScore + score,
        totalGuesses: data.totalGuesses + guesses,
        totalWinners: data.totalWinners + winner,
        highScore: Math.max(score, data.highScore),
      });
    } else {
      await fs.setDoc(ref, {
        count: 1,
        totalScore: score,
        totalGuesses: guesses,
        totalWinners: winner,
        highScore: score,
      });
    }
  } catch (error) {
    console.warn("Daily tracking failed (offline or not configured):", error.message);
  }
}

export async function fetchDailyStats(date) {
  try {
    const { db, fs } = await getFirestoreClient();
    const snap = await fs.getDoc(fs.doc(db, DAILY_STATS, date));
    if (!snap.exists()) return EMPTY_STATS;
    const { count, totalScore, totalGuesses, totalWinners, highScore, archiveCount } = snap.data();
    return {
      count,
      averageScore: count > 0 ? Math.round(totalScore / count) : 0,
      averageGuesses: count > 0 ? Math.round(totalGuesses / count) : 0,
      totalWinners,
      highScore,
      archiveCount: archiveCount || 0,
    };
  } catch (error) {
    console.warn("Failed to fetch player stats:", error.message);
    return EMPTY_STATS;
  }
}

// One Firestore document per endless session: created when the first game
// finishes, updated as the run goes on, and finalised when lives run out.
export function createEndlessTracker() {
  let ref = null;

  const write = async (progress, extra = {}) => {
    try {
      const { db, fs } = await getFirestoreClient();
      const { gamesPlayed, gamesGuessed } = progress;
      const data = { gamesPlayed, gamesGuessed, gamesSkipped: gamesPlayed - gamesGuessed, ...extra };
      if (ref) {
        await fs.updateDoc(ref, data);
      } else {
        ref = await fs.addDoc(fs.collection(db, ENDLESS_STATS), {
          date: new Date().toISOString().split("T")[0],
          ...data,
        });
      }
    } catch (error) {
      console.warn("Endless tracking failed:", error.message);
    }
  };

  return {
    progress: (progress) => write(progress),
    async finalise(progress, { finalScore, longestStreak }) {
      const { gamesPlayed, gamesGuessed } = progress;
      const { fs } = await getFirestoreClient().catch(() => ({}));
      await write(progress, {
        finalScore,
        longestStreak,
        successRate: gamesPlayed > 0 ? Math.round((gamesGuessed / gamesPlayed) * 100) : 0,
        lastUpdated: fs ? fs.serverTimestamp() : null,
      });
      ref = null;
    },
    reset() {
      ref = null;
    },
  };
}
