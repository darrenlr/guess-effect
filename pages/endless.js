import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import EndlessGameSystem from "../components/EndlessGameSystem";
import EndlessSummaryModal from "../components/EndlessSummaryModal";
import EndlessStatsModal from "../components/EndlessStatsModal";
import useEndlessMode from "../hooks/useEndlessMode";
import endlessStyles from "../styles/EndlessMode.module.css";

const Endless = () => {
    const router = useRouter();
    
    // Redirect to homepage - Endless mode temporarily disabled
    useEffect(() => {
        router.push('/');
    }, [router]);
    
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

            console.log(state);
            
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
        
        setState(newState);
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

    if (isLoading) {
        return (
            <>
                <Navbar 
                    showCalendar={false} 
                    showStats={true}
                    onStatsClick={() => setShowStatsModal(true)}
                    isEndlessMode={true}
                />
                <div className={endlessStyles.loadingOverlay}>
                    <div className={endlessStyles.marioLoader}></div>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Navbar 
                showCalendar={false} 
                showStats={true}
                onStatsClick={() => setShowStatsModal(true)}
                isEndlessMode={true}
            />

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
        </>
    );
};

export default Endless;
