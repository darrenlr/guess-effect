import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { collection, addDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../utils/firebase';
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import EndlessGameSystem from "../components/EndlessGameSystem";
import EndlessSummaryModal from "../components/EndlessSummaryModal";
import EndlessStatsModal from "../components/EndlessStatsModal";
import useEndlessMode from "../hooks/useEndlessMode";
import useHudColor from "../hooks/useHudColor";
import endlessStyles from "../styles/EndlessMode.module.css";

const getEndlessCollectionName = () => {
    const branch = process.env.NEXT_PUBLIC_BRANCH || 'main';
    return branch === 'release' ? 'endlessStats-release' : 'endlessStats';
};

const endlessPageSchema = {
    "@context": "https://schema.org",
    "@graph": [
        {
            "@type": "WebApplication",
            "name": "Guess Effect — Endless Mode",
            "url": "https://guesseffect.wtf/endless",
            "applicationCategory": "GameApplication",
            "operatingSystem": "Any (browser-based)",
            "description": "Unlimited rounds of the video game guessing game. Guess as many games as you can before your lives run out. Chase high scores and longest streaks.",
            "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
            "publisher": { "@id": "https://guesseffect.wtf/#org" }
        },
        {
            "@type": "BreadcrumbList",
            "itemListElement": [
                { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://guesseffect.wtf/" },
                { "@type": "ListItem", "position": 2, "name": "Endless", "item": "https://guesseffect.wtf/endless" }
            ]
        },
        {
            "@type": "FAQPage",
            "mainEntity": [
                {
                    "@type": "Question",
                    "name": "What is endless mode?",
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "Endless mode lets you play unlimited rounds of the video game guessing game. Each round uses a random game from our database, and you continue until your lives run out."
                    }
                },
                {
                    "@type": "Question",
                    "name": "How many lives do I get in endless mode?",
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "You start with 10 lives. Each wrong guess or skipped game costs one life. When you run out of lives the session ends and your final score is recorded."
                    }
                },
                {
                    "@type": "Question",
                    "name": "How is my score calculated?",
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "Each round starts with a point pool. Revealing hints reduces the pool, and a correct guess banks whatever points remain. Your total endless score is the sum across every round in the session."
                    }
                },
                {
                    "@type": "Question",
                    "name": "Is progress saved between sessions?",
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "Yes. Your current session persists if you close the tab and come back later, and your personal best score and longest streak are saved in your browser."
                    }
                },
                {
                    "@type": "Question",
                    "name": "How is endless mode different from daily mode?",
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "Daily mode gives every player the same single puzzle per 24 hours. Endless mode lets you play an unlimited number of random puzzles back-to-back in one session."
                    }
                }
            ]
        }
    ]
};

const Endless = () => {
    const router = useRouter();
    useHudColor();
    const endlessSessionDocRef = React.useRef(null);

    const mode = 'easy'; // For now, only easy mode
    const { state, setState, stats, updateStats, clearState } = useEndlessMode(mode);

    const [allGames, setAllGames] = useState([]);
    const [currentGame, setCurrentGame] = useState(null);
    const [gameResults, setGameResults] = useState([]);
    const [lives, setLives] = useState(10);
    const [totalScore, setTotalScore] = useState(0);
    const [currentStreak, setCurrentStreak] = useState(0);
    const [longestStreak, setLongestStreak] = useState(0);
    const [currentGameNumber, setCurrentGameNumber] = useState(1);
    const [showSummary, setShowSummary] = useState(false);
    const [showStatsModal, setShowStatsModal] = useState(false);
    const [isGameCompleted, setIsGameCompleted] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isNewHighScore, setIsNewHighScore] = useState(false);
    const [isNewStreakRecord, setIsNewStreakRecord] = useState(false);
    const [isGameModalVisible, setIsGameModalVisible] = useState(false);

    // Load all games from JSON
    useEffect(() => {
        const loadGames = async () => {
            try {
                const res = await fetch('/api/getAllGames');
                if (res.ok) {
                    const games = await res.json();
                    setAllGames(games);
                } else {
                    console.error('Failed to load games');
                }
            } catch (error) {
                console.error('Error loading games:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadGames();
    }, []);

    // Initialize or restore game state
    useEffect(() => {
        if (allGames.length === 0) return;

        if (state) {
            // Restore previous state
            setGameResults(state.gameResults);
            setLives(state.lives);
            setTotalScore(state.totalScore);
            setCurrentStreak(state.currentStreak);
            setLongestStreak(state.longestStreak);
            setCurrentGameNumber(state.currentGameNumber);
            // Find the game by release date instead of storing the whole object
            const game = allGames.find(g => g.releaseDate === state.currentGameReleaseDate);
            if (game) {
                setCurrentGame(game);
            }
            setIsGameCompleted(state.gameCompleted || false);

            // If run was completed (no lives left), show summary modal
            if (state.lives === 0) {
                setShowSummary(true);
                // Restore record flags if they were saved
                setIsNewHighScore(state.isNewHighScore || false);
                setIsNewStreakRecord(state.isNewStreakRecord || false);
            }
        } else {
            // Start new game
            startNewRun();
        }
    }, [allGames, state]);

    const getRandomGame = (excludeReleaseDates = []) => {
        const availableGames = allGames.filter(
            game => !excludeReleaseDates.includes(game.releaseDate)
        );

        if (availableGames.length === 0) {
            // If all games used, reset and allow repeats
            return allGames[Math.floor(Math.random() * allGames.length)];
        }

        return availableGames[Math.floor(Math.random() * availableGames.length)];
    };

    const startNewRun = () => {
        const firstGame = getRandomGame();
        const newState = {
            gameResults: [],
            lives: 10,
            totalScore: 0,
            currentStreak: 0,
            longestStreak: 0,
            currentGameNumber: 1,
            currentGameReleaseDate: firstGame.releaseDate,
            usedReleaseDates: [firstGame.releaseDate],
        };

        setGameResults([]);
        setLives(10);
        setTotalScore(0);
        setCurrentStreak(0);
        setLongestStreak(0);
        setCurrentGameNumber(1);
        setCurrentGame(firstGame);
        setShowSummary(false);
        setIsNewHighScore(false);
        setIsNewStreakRecord(false);
        setIsGameCompleted(false);
        endlessSessionDocRef.current = null;

        setState(newState);
    };

    const trackGameResult = async (gamesPlayed, gamesGuessed) => {
        try {
            const gamesSkipped = gamesPlayed - gamesGuessed;
            if (!endlessSessionDocRef.current) {
                const today = new Date().toISOString().split('T')[0];
                const docRef = await addDoc(collection(db, getEndlessCollectionName()), {
                    date: today,
                    gamesPlayed,
                    gamesGuessed,
                    gamesSkipped,
                });
                endlessSessionDocRef.current = docRef;
            } else {
                await updateDoc(endlessSessionDocRef.current, {
                    gamesPlayed,
                    gamesGuessed,
                    gamesSkipped,
                });
            }
        } catch (error) {
            console.warn('Endless game tracking failed:', error.message);
        }
    };

    const finalizeEndlessSession = async (finalScore, gamesPlayed, gamesGuessed, longestStreak) => {
        try {
            const successRate = gamesPlayed > 0 ? Math.round((gamesGuessed / gamesPlayed) * 100) : 0;
            if (!endlessSessionDocRef.current) {
                const today = new Date().toISOString().split('T')[0];
                await addDoc(collection(db, getEndlessCollectionName()), {
                    date: today,
                    gamesPlayed,
                    gamesGuessed,
                    gamesSkipped: gamesPlayed - gamesGuessed,
                    finalScore,
                    longestStreak,
                    successRate,
                    lastUpdated: serverTimestamp(),
                });
            } else {
                await updateDoc(endlessSessionDocRef.current, {
                    finalScore,
                    longestStreak,
                    successRate,
                    lastUpdated: serverTimestamp(),
                });
            }
            endlessSessionDocRef.current = null;
        } catch (error) {
            console.warn('Endless session finalize failed:', error.message);
        }
    };

    const handleGameComplete = (result) => {
        const newLives = result.won ? lives : lives - 1;
        const newTotalScore = totalScore + result.score;
        const newStreak = result.won ? currentStreak + 1 : 0;
        const newLongestStreak = Math.max(longestStreak, newStreak);

        // Don't include gameState in the result stored in gameResults array
        const { gameState: _, ...resultWithoutGameState } = result;
        const newResults = [...gameResults, resultWithoutGameState];

        setGameResults(newResults);
        setLives(newLives);
        setTotalScore(newTotalScore);
        setCurrentStreak(newStreak);
        setLongestStreak(newLongestStreak);
        setIsGameCompleted(true);

        // Check if run is over
        if (newLives === 0) {
            // Check for new records BEFORE updating stats
            const newHighScore = newTotalScore > stats.highScore;
            const newStreakRecord = newLongestStreak > stats.longestStreak;

            // Store the record flags in state FIRST
            setIsNewHighScore(newHighScore);
            setIsNewStreakRecord(newStreakRecord);

            // Finalize session in Firebase
            const gamesGuessedCount = newResults.filter(r => r.won).length;
            finalizeEndlessSession(newTotalScore, newResults.length, gamesGuessedCount, newLongestStreak);

            updateStats(newTotalScore, newLongestStreak);
            setShowSummary(true);
            // Save the completed run state so it persists on refresh
            const completedState = {
                gameResults: newResults,
                lives: 0,
                totalScore: newTotalScore,
                currentStreak: newStreak,
                longestStreak: newLongestStreak,
                currentGameNumber: currentGameNumber,
                currentGameReleaseDate: currentGame.releaseDate,
                usedReleaseDates: newResults.map(r => r.gameReleaseDate),
                gameCompleted: true,
                currentGameState: result.gameState,
                isNewHighScore: newHighScore,
                isNewStreakRecord: newStreakRecord,
            };
            setState(completedState);
        } else {
            // Track this game result in Firebase
            const gamesGuessedCount = newResults.filter(r => r.won).length;
            trackGameResult(newResults.length, gamesGuessedCount);

            // Save updated state with current game still active (completed)
            const updatedState = {
                gameResults: newResults,
                lives: newLives,
                totalScore: newTotalScore,
                currentStreak: newStreak,
                longestStreak: newLongestStreak,
                currentGameNumber: currentGameNumber,
                currentGameReleaseDate: currentGame.releaseDate,
                usedReleaseDates: newResults.map(r => r.gameReleaseDate),
                gameCompleted: true,
                currentGameState: result.gameState, // Store the hint states at top level
            };
            setState(updatedState);
        }
    };

    const handleNextGame = () => {
        // Check if run is over (no lives left)
        if (lives === 0) {
            // Summary modal should already be showing
            return;
        }

        const usedReleaseDates = gameResults.map(r => r.gameReleaseDate);
        const nextGame = getRandomGame(usedReleaseDates);

        // Check if all games have been played (incredibly unlikely but possible)
        if (!nextGame) {
            updateStats(totalScore, longestStreak);
            setShowSummary(true);
            // Don't clear state yet - wait for user action
            return;
        }

        const nextGameNumber = currentGameNumber + 1;

        setIsGameCompleted(false);
        setCurrentGame(nextGame);
        setCurrentGameNumber(nextGameNumber);

        // Update state - don't include currentGameState so it starts fresh
        const newState = {
            gameResults,
            lives,
            totalScore,
            currentStreak,
            longestStreak,
            currentGameNumber: nextGameNumber,
            currentGameReleaseDate: nextGame.releaseDate,
            usedReleaseDates: [...usedReleaseDates, nextGame.releaseDate],
            gameCompleted: false,
            // Explicitly set to null to clear previous game state
            currentGameState: null,
        };

        setState(newState);
    };

    const handleGiveUp = () => {
        if (confirm('Are you sure you want to give up this run? Your progress will be lost.')) {
            updateStats(totalScore, longestStreak);
            setShowSummary(true);
            // Don't clear state yet - wait for user action
        }
    };

    const handlePlayAgain = () => {
        clearState(); // Clear the old run's state
        setShowSummary(false);
        startNewRun();
    };

    const handleBackToMenu = () => {
        clearState(); // Clear state when leaving endless mode
        router.push('/');
    };

    const handleGameStateChange = (newGameState) => {
        // Update lives from remainingGuessCount if it changed
        if (newGameState.life && newGameState.life.remainingGuessCount !== lives) {
            setLives(newGameState.life.remainingGuessCount);
        }

        // Update localStorage with current game state (for ongoing games)
        if (state) {
            const updatedState = {
                ...state,
                currentGameState: newGameState,
                lives: newGameState.life?.remainingGuessCount || lives,
            };
            setState(updatedState);
        }
    };

    // Head contents — same for loading and loaded states
    const pageHead = (
        <Head>
            <title>Endless Video Game Guessing Game — Unlimited Rounds | Guess Effect</title>
            <meta
                name="description"
                content="Play unlimited rounds of the video game guessing game. No daily limit — keep guessing games from their release date and hints until your lives run out. Chase high scores and longest streaks."
            />
            <link rel="canonical" href="https://guesseffect.wtf/endless" />
            <meta property="og:title" content="Endless Mode — Unlimited Video Game Guessing" />
            <meta
                property="og:description"
                content="No daily limit. Guess as many video games as you can. How far can you go?"
            />
            <meta property="og:url" content="https://guesseffect.wtf/endless" />
            <meta name="twitter:title" content="Endless Mode — Unlimited Video Game Guessing" />
            <meta
                name="twitter:description"
                content="No daily limit. Guess as many video games as you can. How far can you go?"
            />

            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(endlessPageSchema) }}
            />
        </Head>
    );

    // SEO content — hidden visually to preserve the terminal aesthetic,
    // but present in the HTML so Google can index what this page is about.
    const seoContent = (
        <section className="sr-only">
            <h1>Endless Video Game Guessing Game</h1>
            <p>
                Endless mode is the unlimited version of Guess Effect. There is no
                daily limit — keep guessing video games from their release date,
                publisher, genre, platform, developer, engine, Metacritic score
                and plot until your lives run out. Every correct guess adds to
                your running score and streak. Every wrong guess costs a life.
                How far can you go?
            </p>

            <h2>How to play endless mode</h2>
            <ol>
                <li>A hidden video game is chosen at random from the database.</li>
                <li>You start with 10 lives. Reveal hints to narrow it down — release date, genre, platform, publisher and more.</li>
                <li>Each hint you reveal costs points from that round&apos;s score pool.</li>
                <li>Guess correctly to bank the remaining points and advance to the next game.</li>
                <li>Guess wrong or skip and you lose a life. Out of lives ends the session.</li>
                <li>Your high score and longest streak are saved locally — try to beat them.</li>
            </ol>

            <h2>Endless mode versus daily mode</h2>
            <p>
                Daily mode gives every player the same single puzzle per 24 hours
                and is shared by the whole community. Endless mode lets you play
                an unlimited number of random puzzles back-to-back in one session.
                Pick endless for unlimited play; pick daily for the shared
                community challenge.
            </p>

            <h2>Tips for chasing a high score</h2>
            <ul>
                <li>Guess early when you&apos;re confident — you keep more points.</li>
                <li>Release date plus platform is often enough to narrow things down.</li>
                <li>Protect your streak: if you don&apos;t know it, a skip costs the same as a wrong guess, so take a shot.</li>
            </ul>
        </section>
    );

    if (isLoading) {
        return (
            <>
                {pageHead}
                <Navbar
                    showCalendar={false}
                    showStats={true}
                    onStatsClick={() => setShowStatsModal(true)}
                    isEndlessMode={true}
                />
                {seoContent}
                <div className={endlessStyles.loadingOverlay}>
                    <div className={endlessStyles.marioLoader}></div>
                </div>
                <Footer />
                <style jsx>{`
                    .sr-only {
                        position: absolute;
                        width: 1px;
                        height: 1px;
                        padding: 0;
                        margin: -1px;
                        overflow: hidden;
                        clip: rect(0, 0, 0, 0);
                        border: 0;
                    }
                `}</style>
            </>
        );
    }

    return (
        <>
            {pageHead}
            <Navbar
                showCalendar={false}
                showStats={true}
                onStatsClick={() => setShowStatsModal(true)}
                isEndlessMode={true}
            />

            {seoContent}

            {currentGame && !showSummary && (
                <EndlessGameSystem
                    game={currentGame}
                    onNextGame={handleNextGame}
                    onGameComplete={handleGameComplete}
                    onGiveUp={handleGiveUp}
                    currentGameNumber={currentGameNumber}
                    totalScore={totalScore}
                    lives={lives}
                    currentStreak={currentStreak}
                    gamesPlayed={gameResults.length}
                    isCompleted={isGameCompleted}
                    savedGameState={state?.currentGameState}
                    onGameStateChange={handleGameStateChange}
                    onModalStateChange={setIsGameModalVisible}
                />
            )}

            <EndlessSummaryModal
                show={showSummary}
                finalScore={totalScore}
                gamesPlayed={gameResults.length}
                gamesGuessed={gameResults.filter(r => r.won).length}
                longestStreak={longestStreak}
                gameResults={gameResults}
                onPlayAgain={handlePlayAgain}
                onBackToMenu={handleBackToMenu}
                highScore={stats.highScore}
                personalBestStreak={stats.longestStreak}
                isNewHighScore={isNewHighScore}
                isNewStreakRecord={isNewStreakRecord}
            />

            {showStatsModal && (
                <EndlessStatsModal
                    closeModal={() => setShowStatsModal(false)}
                    stats={stats}
                />
            )}

            {!showSummary && !isGameModalVisible && <Footer />}

            <style jsx>{`
                .sr-only {
                    position: absolute;
                    width: 1px;
                    height: 1px;
                    padding: 0;
                    margin: -1px;
                    overflow: hidden;
                    clip: rect(0, 0, 0, 0);
                    border: 0;
                }
            `}</style>
        </>
    );
};

export default Endless;