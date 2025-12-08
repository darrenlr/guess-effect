import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import ReleaseDate from "./ReleaseDate";
import SearchBar from "./SearchBar";
import GameCard from "./GameCard";
import EndlessGameOverModal from "./EndlessGameOverModal";
import EndlessSummaryModal from "./EndlessSummaryModal";
import EndlessGameCompletionModal from "./EndlessGameCompletionModal";
import HoldButton from "./HoldButton";
import { stripBrackets } from '../utils/stringUtils';
import { normaliseString } from '../utils/normaliseString';
import styles from "../styles/ScoreSystem.module.css";
import endlessStyles from "../styles/EndlessMode.module.css";

const initialGameState = {
    releaseDate: "",
    hints: {
        publisher: false,
        developer: false,
        genre: false,
        platforms: false,
        modes: true,
        engine: true,
        metacritic: true,
        plot: false,
        boxArt: 20,
        points: 100,
    },
    life: {
        guesses: [],
        remainingGuessCount: 10,
        hearts: Array(10).fill("/images/heart.png"),
    },
};

const EndlessGameSystem = ({ 
    game, 
    onNextGame, 
    onGameComplete,
    onGiveUp,
    currentGameNumber,
    totalScore,
    lives,
    currentStreak,
    gamesPlayed,
    isCompleted = false,
    savedGameState = null,
    onGameStateChange = null
}) => {
    const [isMounted, setIsMounted] = useState(false);
    const [gameState, setGameState] = useState({
        ...initialGameState,
        life: {
            ...initialGameState.life,
            remainingGuessCount: lives,
            hearts: Array.from({ length: 10 }, (_, i) => 
                i < lives ? "/images/heart.png" : "/images/heart-black.png"
            ),
        }
    });

    const [isWrongGuess, setIsWrongGuess] = useState(false);
    const [isGameOverModalVisible, setIsGameOverModalVisible] = useState(false);
    const [isGuessCountUpdated, setIsGuessCountUpdated] = useState(false);
    const [gameCompleted, setGameCompleted] = useState(false);
    const [showContinueButton, setShowContinueButton] = useState(false);
    const [gameResult, setGameResult] = useState(null);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [isLoadingGame, setIsLoadingGame] = useState(true);

    const [animatedScore, setAnimatedScore] = useState(gameState.hints.points);
    
    const previousGameRef = useRef(null);
    const hasRestoredRef = useRef(false);

    // Reset game state when new game loads
    useEffect(() => {
        if (game) {
            // Check if this is actually a new game (release date changed)
            const isNewGame = previousGameRef.current !== game.releaseDate;
            
            if (isNewGame) {
                // Set loading state when new game starts
                setIsLoadingGame(true);
                
                // Only restore completed game state on FIRST load AND if parent says game was completed
                const isRestoringCompletedGame = !hasRestoredRef.current && isCompleted && savedGameState !== null;
                
                if (isRestoringCompletedGame) {
                    hasRestoredRef.current = true;
                }
                
                previousGameRef.current = game.releaseDate;
                
                // Reset completion state for new games
                setGameCompleted(isRestoringCompletedGame);
                setShowContinueButton(isRestoringCompletedGame);
                if (!isRestoringCompletedGame) {
                    setGameResult(null);
                }
                
                // Use saved game state if available, otherwise create fresh state
                if (savedGameState) {
                    // Restore the saved state (either in-progress or completed)
                    setGameState(savedGameState);
                } else {
                    // No saved state, create fresh
                    const freshState = {
                        releaseDate: game.releaseDate,
                        hints: {
                            publisher: false,
                            developer: false,
                            genre: false,
                            platforms: false,
                            modes: true,
                            engine: true,
                            metacritic: true,
                            plot: false,
                            boxArt: 20,
                            points: 100,
                        },
                        life: {
                            guesses: [],
                            remainingGuessCount: lives,
                            hearts: Array.from({ length: 10 }, (_, i) => 
                                i < lives ? "/images/heart.png" : "/images/heart-black.png"
                            ),
                        }
                    };
                    setGameState(freshState);
                    // Immediately save fresh state to localStorage
                    if (onGameStateChange) {
                        onGameStateChange(freshState);
                    }
                }
                
                // Set gameResult for restoring completed games
                if (isRestoringCompletedGame) {
                    setGameResult({
                        gameTitle: game.title,
                        gameReleaseDate: game.releaseDate,
                        score: 0,
                        won: false,
                        guessed: false,
                        skipped: true,
                    });
                }
                
                setIsGameOverModalVisible(false);
                setIsTransitioning(false);
                
                // Preload box art image
                if (game.boxArtUrl) {
                    const img = document.createElement('img');
                    img.onload = () => {
                        setIsLoadingGame(false);
                    };
                    img.onerror = () => {
                        // Even if image fails, show the game
                        setIsLoadingGame(false);
                    };
                    img.src = `https://${game.boxArtUrl}`;
                }
            }
        }
    }, [game, lives, savedGameState, isCompleted]);

    // Animate score
    useEffect(() => {
        const targetScore = gameState.hints.points;
        const duration = 200;
        const stepTime = 50;
        const scoreDifference = targetScore - animatedScore;
        const steps = duration / stepTime;
        const stepSize = scoreDifference / steps;

        const intervalId = setInterval(() => {
            setAnimatedScore((prevScore) => {
                const nextScore = prevScore + stepSize;
                if ((stepSize > 0 && nextScore >= targetScore) || (stepSize < 0 && nextScore <= targetScore)) {
                    clearInterval(intervalId);
                    return targetScore;
                }
                return nextScore;
            });
        }, stepTime);

        return () => clearInterval(intervalId);
    }, [gameState.hints.points]);

    // Update hearts display based on parent's lives prop
    useEffect(() => {
        const updatedHearts = Array.from({ length: 10 }, (_, index) =>
            index < lives
                ? "/images/heart.png"
                : "/images/heart-black.png"
        );
        setGameState((prevState) => ({
            ...prevState,
            life: {
                ...prevState.life,
                remainingGuessCount: lives,
                hearts: updatedHearts,
            },
        }));
    }, [lives]);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Update localStorage whenever gameState changes
    useEffect(() => {
        if (isMounted && game && !gameCompleted && onGameStateChange) {
            onGameStateChange(gameState);
        }
    }, [gameState, isMounted, gameCompleted]);

    const handleGameComplete = (lostLife) => {
        if (gameCompleted) return;
        
        const score = lostLife ? 0 : gameState.hints.points;
        const finalScore = score;
        const won = !lostLife;

        const result = {
            gameTitle: game.title,
            gameReleaseDate: game.releaseDate,
            score: finalScore,
            won: won,
            guessed: won,
            skipped: lostLife,
        };

        setGameResult(result);
        setGameCompleted(true);

        // Reveal all hints
        const completedGameState = {
            ...gameState,
            hints: {
                publisher: true,
                developer: true,
                genre: true,
                platforms: true,
                modes: true,
                engine: true,
                metacritic: true,
                plot: true,
                boxArt: 0,
                points: score,
            },
        };
        
        setGameState(completedGameState);

        // Pass the completed game state to parent first
        onGameComplete({ ...result, gameState: completedGameState });
        
        // Show modal after animation completes, but only if user has lives remaining
        // Don't show completion modal immediately - wait for parent to update lives state
        if (!lostLife || lives > 1) {
            setTimeout(() => {
                setShowContinueButton(true);
            }, 800);
        }
        // If lostLife and lives === 1, parent will show summary modal instead
    };

    const handleSkip = () => {
        // Don't allow skipping if already completed
        if (gameCompleted) return;
        
        // Trigger animations (heart blink and card shake)
        setIsWrongGuess(true);
        setTimeout(() => {
            setIsWrongGuess(false);
            handleGameComplete(true);
        }, 500);
    };

    const onRevealHint = (points) => {
        setGameState((prevState) => ({
            ...prevState,
            hints: {
                ...prevState.hints,
                points: prevState.hints.points - points,
            },
        }));
    };

    const handleGuess = (guess) => {
        if (gameCompleted) return;

        const cleanedGuess = normaliseString(stripBrackets(guess));
        const cleanedGameTitle = normaliseString(stripBrackets(game.title));

        if (cleanedGuess === cleanedGameTitle) {
            handleGameComplete(false);
        } else {
            setGameState((prevState) => {
                let updatedGuesses = [...prevState.life.guesses, guess];
                let updatedRemainingGuessCount = prevState.life.remainingGuessCount - 1;

                return {
                    ...prevState,
                    life: {
                        ...prevState.life,
                        guesses: updatedGuesses,
                        remainingGuessCount: updatedRemainingGuessCount,
                    },
                };
            });

            setIsWrongGuess(true);
            setTimeout(() => {
                setIsGuessCountUpdated(true);
                setIsWrongGuess(false);
            }, 500);
        }
    };

    const handleContinue = () => {
        setIsGameOverModalVisible(false);
        setIsTransitioning(true);
        onNextGame();
    };

    return isMounted ? (
        <>
            {(isLoadingGame || isTransitioning) ? (
                <div className={endlessStyles.loadingOverlay}>
                    <div className={endlessStyles.marioLoader}></div>
                </div>
            ) : (
                <div className={styles.container}>
                    {game && <ReleaseDate date={game.releaseDate} region={game.region} />}
            
            {/* Mobile stats - visible only on mobile */}
            <div className={`${styles.stats} ${styles.statsMobile} ${endlessStyles.mobileOnly}`} style={{ flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
                <div className={styles.heartsContainer}>
                    {gameState.life.hearts.map((heartSrc, index) => (
                        <Image
                            key={index}
                            src={heartSrc}
                            alt="Heart"
                            width={30}
                            height={30}
                            className={
                                isWrongGuess &&
                                index === gameState.life.remainingGuessCount - 1
                                    ? styles.blink
                                    : ""
                            }
                        />
                    ))}
                </div>
                <p style={{ 
                    fontSize: '1.3rem', 
                    fontWeight: 'bold', 
                    color: '#4CAF50',
                    fontFamily: 'var(--font-family)'
                }}>
                    Total: {totalScore}
                </p>
                <p>Score: {Math.round(animatedScore)}</p>
            </div>
            
            <SearchBar onSubmit={handleGuess} isGameOver={gameCompleted} />
            
            {game && gameState && (
                <GameCard
                    gameData={game}
                    gameState={gameState}
                    setGameState={setGameState}
                    onRevealHint={(points) => onRevealHint(points)}
                    isWrongGuess={isWrongGuess}
                    setIsGuessCountUpdated={setIsGuessCountUpdated}
                    isGameOver={gameCompleted}
                    onGiveUp={handleSkip}
                />
            )}
            
            <div className={`${styles.statsContainer} ${endlessStyles.desktopStats}`} style={{ flexDirection: 'column', gap: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div className={styles.heartsWrapper}>
                        <div className={styles.heartsContainer}>
                            {gameState.life.hearts.map((heartSrc, index) => (
                                <Image
                                    key={index}
                                    src={heartSrc}
                                    alt="Heart"
                                    width={30}
                                    height={30}
                                    className={
                                        isWrongGuess &&
                                        index === gameState.life.remainingGuessCount - 1
                                            ? styles.blink
                                            : ""
                                    }
                                />
                            ))}
                        </div>
                    </div>
                    <p>Score: {Math.round(animatedScore)}</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <p style={{
                        fontSize: '1.3rem',
                        fontWeight: 'bold', 
                        color: '#4CAF50',
                        fontFamily: 'var(--font-family)'
                    }}>
                        Total: {totalScore}
                    </p>
                </div>
            </div>

            {/* Action Buttons */}
            <div className={endlessStyles.buttonContainer}>
                <HoldButton 
                    className={endlessStyles.skipButton}
                    onComplete={handleSkip}
                    holdDuration={2000}
                    disabled={gameCompleted}
                >
                    {lives === 1 ? 'Give Up' : 'Skip'}
                </HoldButton>
            </div>

            <EndlessGameCompletionModal
                show={showContinueButton}
                won={gameResult?.won || false}
                gameTitle={game?.title || ''}
                totalScore={totalScore}
                lives={lives}
                onContinue={handleContinue}
            />
                </div>
            )}
        </>
    ) : (
        <div className={endlessStyles.loadingOverlay}>
            <div className={endlessStyles.marioLoader}></div>
        </div>
    );
};

export default EndlessGameSystem;
