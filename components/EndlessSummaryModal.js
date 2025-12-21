import React, { useState, useEffect } from "react";
import styles from "../styles/GameOverModal.module.css";
import endlessStyles from "../styles/EndlessMode.module.css";
import confetti from "canvas-confetti";

const EndlessSummaryModal = ({ 
    show, 
    finalScore, 
    gamesPlayed, 
    gamesGuessed,
    longestStreak,
    gameResults,
    onPlayAgain,
    onBackToMenu,
    highScore,
    personalBestStreak,
    isNewHighScore,
    isNewStreakRecord
}) => {
    const [showGuessedGames, setShowGuessedGames] = useState(false);
    const [showSkippedGames, setShowSkippedGames] = useState(false);
    const [showStats, setShowStats] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 767);
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);
    
    useEffect(() => {
        if (show) {
            const confettiAnimation = confetti.create(undefined, {
                resize: true,
                useWorker: true,
            });

            // Standard confetti for run complete
            confettiAnimation({
                zIndex: 101,
                particleCount: 1000,
                spread: 80,
                origin: { y: 0.4, x: 0.5 },
                scalar: 0.6,
            });
        }
    }, [show]);
    
    if (!show) return null;
    
    const guessedGames = gameResults.filter(r => r.won);
    const skippedGames = gameResults.filter(r => !r.won);

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modal}>
                <div className={styles.modalContainerEndless}>
                    <h2 className={endlessStyles.summaryTitle} style={{ textAlign: 'center' }}>Run Complete!</h2>
                    
                    <div className={endlessStyles.finalScoreSection}>
                        <div className={endlessStyles.mainScore}>
                            <span className={endlessStyles.scoreLabel} style={{ fontFamily: 'var(--font-family-main)', color: 'white', fontSize: '1.5rem' }}>Score</span>
                            <span className={endlessStyles.scoreLarge}>{finalScore}</span>
                            {isNewHighScore && <span className={endlessStyles.newRecord} style={{ fontFamily: 'var(--font-family)' }}>NEW HIGH SCORE!</span>}
                        </div>
                    </div>

                    {isMobile ? (
                        <div className={endlessStyles.gamesList}>
                            <button 
                                className={endlessStyles.gameListToggle}
                                onClick={() => setShowStats(!showStats)}
                            >
                                Stats {showStats ? '▼' : '▶'}
                            </button>
                            {showStats && (
                                <div className={endlessStyles.statsGrid} style={{ marginTop: '0.5rem' }}>
                                    <div className={endlessStyles.statItem}>
                                        <span className={endlessStyles.statValue}>{gamesPlayed}</span>
                                        <span className={endlessStyles.statLabel} style={{ fontFamily: 'var(--font-family-main)', color: 'white' }}>Games Played</span>
                                    </div>
                                    <div className={endlessStyles.statItem}>
                                        <span className={endlessStyles.statValue}>{highScore}</span>
                                        <span className={endlessStyles.statLabel} style={{ fontFamily: 'var(--font-family-main)', color: 'white' }}>High Score</span>
                                    </div>
                                    <div className={endlessStyles.statItem}>
                                        <span className={endlessStyles.statValue}>{longestStreak}</span>
                                        <span className={endlessStyles.statLabel} style={{ fontFamily: 'var(--font-family-main)', color: 'white' }}>Best Streak</span>
                                        {isNewStreakRecord && <span className={endlessStyles.newRecord} style={{ fontFamily: 'var(--font-family)' }}>NEW RECORD!</span>}
                                    </div>
                                    <div className={endlessStyles.statItem}>
                                        <span className={endlessStyles.statValue}>{Math.round(gamesGuessed / gamesPlayed * 100)}%</span>
                                        <span className={endlessStyles.statLabel} style={{ fontFamily: 'var(--font-family-main)', color: 'white' }}>Success Rate</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className={endlessStyles.statsGrid}>
                            <div className={endlessStyles.statItem}>
                                <span className={endlessStyles.statValue}>{gamesPlayed}</span>
                                <span className={endlessStyles.statLabel} style={{ fontFamily: 'var(--font-family-main)', color: 'white' }}>Games Played</span>
                            </div>
                            <div className={endlessStyles.statItem}>
                                <span className={endlessStyles.statValue}>{highScore}</span>
                                <span className={endlessStyles.statLabel} style={{ fontFamily: 'var(--font-family-main)', color: 'white' }}>High Score</span>
                            </div>
                            <div className={endlessStyles.statItem}>
                                <span className={endlessStyles.statValue}>{longestStreak}</span>
                                <span className={endlessStyles.statLabel} style={{ fontFamily: 'var(--font-family-main)', color: 'white' }}>Best Streak</span>
                                {isNewStreakRecord && <span className={endlessStyles.newRecord} style={{ fontFamily: 'var(--font-family)' }}>NEW RECORD!</span>}
                            </div>
                            <div className={endlessStyles.statItem}>
                                <span className={endlessStyles.statValue}>{Math.round(gamesGuessed / gamesPlayed * 100)}%</span>
                                <span className={endlessStyles.statLabel} style={{ fontFamily: 'var(--font-family-main)', color: 'white' }}>Success Rate</span>
                            </div>
                        </div>
                    )}

                    <div className={endlessStyles.gamesList}>
                        <button 
                            className={endlessStyles.gameListToggle}
                            onClick={() => setShowGuessedGames(!showGuessedGames)}
                        >
                            {isMobile ? 'Guessed' : 'Games Guessed'} ({guessedGames.length}) {showGuessedGames ? '▼' : '▶'}
                        </button>
                        {showGuessedGames && (
                            <div className={endlessStyles.gamesListScroll}>
                                {guessedGames.map((result, index) => (
                                    <div 
                                        key={index} 
                                        className={`${endlessStyles.gameResultItem} ${endlessStyles.gameWon}`}
                                    >
                                        <span className={endlessStyles.gameResultTitle}>{result.gameTitle}</span>
                                        <span className={endlessStyles.gameResultScore}>{result.score}</span>
                                    </div>
                                ))}
                                {guessedGames.length === 0 && (
                                    <div style={{ textAlign: 'center', opacity: 0.5, padding: '1rem', fontFamily: 'var(--font-family-main)', color: 'white' }}>
                                        No games guessed
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className={endlessStyles.gamesList}>
                        <button 
                            className={endlessStyles.gameListToggle}
                            onClick={() => setShowSkippedGames(!showSkippedGames)}
                        >
                            {isMobile ? 'Skipped' : 'Games Skipped'} ({skippedGames.length}) {showSkippedGames ? '▼' : '▶'}
                        </button>
                        {showSkippedGames && (
                            <div className={endlessStyles.gamesListScroll}>
                                {skippedGames.map((result, index) => (
                                    <div 
                                        key={index} 
                                        className={`${endlessStyles.gameResultItem} ${endlessStyles.gameLost}`}
                                    >
                                        <span className={endlessStyles.gameResultTitle}>{result.gameTitle}</span>
                                        <span className={endlessStyles.gameResultScore}>{result.score}</span>
                                    </div>
                                ))}
                                {skippedGames.length === 0 && (
                                    <div style={{ textAlign: 'center', opacity: 0.5, padding: '1rem', fontFamily: 'var(--font-family-main)', color: 'white' }}>
                                        No games skipped
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className={endlessStyles.buttonGroup}>
                        <button 
                            className={endlessStyles.primaryButton}
                            onClick={onPlayAgain}
                        >
                            Play Again
                        </button>
                        <button 
                            className={endlessStyles.secondaryButton}
                            onClick={onBackToMenu}
                        >
                            Back to Menu
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EndlessSummaryModal;
