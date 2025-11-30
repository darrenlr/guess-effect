import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import ReleaseDate from "./ReleaseDate";
import SearchBar from "./SearchBar";
import GameCard from "./GameCard";
import EndlessGameOverModal from "./EndlessGameOverModal";
import EndlessSummaryModal from "./EndlessSummaryModal";
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
    isCompleted = false
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
    const [gameCompleted, setGameCompleted] = useState(isCompleted);
    const [showContinueButton, setShowContinueButton] = useState(isCompleted);
    const [gameResult, setGameResult] = useState(null);

    const [animatedScore, setAnimatedScore] = useState(gameState.hints.points);
    const [animatedBonus, setAnimatedBonus] = useState(gameState.life.remainingGuessCount * 25);

    // Reset game state when new game loads
    useEffect(() => {
        if (game) {
            const shouldRevealHints = isCompleted;
            setGameState({
                ...initialGameState,
                releaseDate: game.releaseDate,
                hints: shouldRevealHints ? {
                    publisher: true,
                    developer: true,
                    genre: true,
                    platforms: true,
                    modes: true,
                    engine: true,
                    metacritic: true,
                    plot: true,
                    boxArt: 0,
                    points: 0,
                } : initialGameState.hints,
                life: {
                    ...initialGameState.life,
                    remainingGuessCount: lives,
                    hearts: Array.from({ length: 10 }, (_, i) => 
                        i < lives ? "/images/heart.png" : "/images/heart-black.png"
                    ),
                }
            });
            setGameCompleted(isCompleted);
            setShowContinueButton(isCompleted);
            setIsGameOverModalVisible(false);
            if (isCompleted) {
                setGameResult({
                    gameTitle: game.title,
                    gameReleaseDate: game.releaseDate,
                    score: 0,
                    won: false,
                    guessed: false,
                    skipped: true,
                });
            } else {
                setGameResult(null);
            }
        }
    }, [game, lives, isCompleted]);

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

    // Animate bonus
    useEffect(() => {
        const targetBonus = gameState.life.remainingGuessCount * 25;
        const duration = 200;
        const stepTime = 50;
        const bonusDifference = targetBonus - animatedBonus;
        const steps = duration / stepTime;
        const stepSize = bonusDifference / steps;

        const intervalId = setInterval(() => {
            setAnimatedBonus((prevBonus) => {
                const nextBonus = prevBonus + stepSize;
                if ((stepSize > 0 && nextBonus >= targetBonus) || (stepSize < 0 && nextBonus <= targetBonus)) {
                    clearInterval(intervalId);
                    return targetBonus;
                }
                return nextBonus;
            });
        }, stepTime);

        return () => clearInterval(intervalId);
    }, [gameState.life.remainingGuessCount]);

    // Update hearts display
    useEffect(() => {
        const updatedHearts = Array.from({ length: 10 }, (_, index) =>
            index < gameState.life.remainingGuessCount
                ? "/images/heart.png"
                : "/images/heart-black.png"
        );
        setGameState((prevState) => ({
            ...prevState,
            life: {
                ...prevState.life,
                hearts: updatedHearts,
            },
        }));
    }, [gameState.life.remainingGuessCount]);

    // Handle game over when lives run out during a single game
    useEffect(() => {
        if (isGuessCountUpdated && gameState.life.remainingGuessCount === 0) {
            handleGameComplete(true); // lost all lives
        }
        setIsGuessCountUpdated(false);
    }, [isGuessCountUpdated, gameState.life.remainingGuessCount]);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const handleGameComplete = (lostLife) => {
        if (gameCompleted) return;
        
        const score = lostLife ? 0 : gameState.hints.points;
        const bonus = lostLife ? 0 : (gameState.life.remainingGuessCount * 25);
        const finalScore = score + bonus;
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
        setGameState((prevState) => ({
            ...prevState,
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
        }));

        // Show continue button after a delay to let user see the answer
        setTimeout(() => {
            setShowContinueButton(true);
        }, 1500);

        onGameComplete(result);
    };

    const handleSkip = () => {
        handleGameComplete(true);
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
        onNextGame();
    };

    return isMounted ? (
        <div className={styles.container}>
            {game && <ReleaseDate date={game.releaseDate} region={game.region} />}
            
            {/* Mobile stats - visible only on mobile */}
            <div className={`${styles.stats} ${styles.statsMobile} ${endlessStyles.mobileOnly}`}>
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
                                index === gameState.life.remainingGuessCount
                                    ? styles.blink
                                    : ""
                            }
                        />
                    ))}
                </div>
                <p>Bonus: {Math.round(animatedBonus)}</p>
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
                />
            )}
            
            <div className={`${styles.statsContainer} ${endlessStyles.desktopStats}`} style={{ justifyContent: 'space-between', alignItems: 'center' }}>
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
                                    index === gameState.life.remainingGuessCount
                                        ? styles.blink
                                        : ""
                                }
                            />
                        ))}
                    </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                    <p>Bonus: {Math.round(animatedBonus)}</p>
                    <p>Score: {Math.round(animatedScore)}</p>
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
                    Skip
                </HoldButton>
                {showContinueButton && (
                    <button 
                        className={endlessStyles.continueButton}
                        onClick={handleContinue}
                    >
                        Continue
                    </button>
                )}
            </div>

            {/* Game completed - show answer */}
            {gameCompleted && (
                <div style={{ textAlign: 'center', marginTop: '1rem', color: 'white' }}>
                    <h2 style={{ color: gameResult?.won ? '#00ce7a' : '#ffbd3f', marginBottom: '1rem', fontSize: '2rem' }}>
                        {gameResult?.won ? '✓ Correct!' : '✗ Skipped'}
                    </h2>
                    <h3 style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>{game.title}</h3>
                    {gameResult?.score > 0 && (
                        <p style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>+{gameResult?.score} points</p>
                    )}
                </div>
            )}
        </div>
    ) : (
        <div className={styles.loader}></div>
    );
};

export default EndlessGameSystem;
