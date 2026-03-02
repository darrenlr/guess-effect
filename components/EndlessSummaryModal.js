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
    const successRate = gamesPlayed > 0 ? Math.round(gamesGuessed / gamesPlayed * 100) : 0;

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modal}>

                {/* Terminal header */}
                <div className={styles.terminalHeader}>
                    RUN_COMPLETE.EXE — [SUMMARY]
                </div>

                {/* Scan overlays — contained to modal bounds */}
                <div className={styles.scanOverlay}>
                    <div className={endlessStyles.modalScanlines} style={{ position: 'absolute', inset: 0 }} />
                    <div className={endlessStyles.modalScanLine} />
                </div>

                <div className={styles.modalContainerEndless}>
                    {/* Score block */}
                    <div className={endlessStyles.modalScoreBlock} style={{ width: '100%' }}>
                        <div className={endlessStyles.modalScoreLabel}>&gt; FINAL_SCORE</div>
                        <div className={endlessStyles.modalScoreValue}>{finalScore}</div>
                        {isNewHighScore &&
                            <div className={endlessStyles.newRecord} style={{ fontFamily: 'var(--font-family)', marginTop: '0.4rem' }}>
                                NEW HIGH SCORE!
                            </div>
                        }
                    </div>

                    {/* Stats grid — always visible on desktop, toggle on mobile */}
                    {isMobile ? (
                        <div style={{ width: '100%' }}>
                            <button
                                className={endlessStyles.summaryToggle}
                                onClick={() => setShowStats(!showStats)}
                            >
                                <span className={endlessStyles.continueButtonText}>
                                    &gt; STATS {showStats ? '▼' : '▶'}
                                </span>
                            </button>
                            {showStats && (
                                <div className={endlessStyles.summaryStatsGrid} style={{ marginTop: '0.5rem' }}>
                                    <div className={endlessStyles.summaryStatItem}>
                                        <span className={endlessStyles.summaryStatValue}>{gamesPlayed}</span>
                                        <span className={endlessStyles.summaryStatLabel}>&gt; GAMES_PLAYED</span>
                                    </div>
                                    <div className={endlessStyles.summaryStatItem}>
                                        <span className={endlessStyles.summaryStatValue}>{highScore}</span>
                                        <span className={endlessStyles.summaryStatLabel}>&gt; HIGH_SCORE</span>
                                    </div>
                                    <div className={endlessStyles.summaryStatItem}>
                                        <span className={endlessStyles.summaryStatValue}>{longestStreak}</span>
                                        <span className={endlessStyles.summaryStatLabel}>&gt; BEST_STREAK</span>
                                        {isNewStreakRecord && <span className={endlessStyles.newRecord} style={{ fontFamily: 'var(--font-family)' }}>NEW RECORD!</span>}
                                    </div>
                                    <div className={endlessStyles.summaryStatItem}>
                                        <span className={endlessStyles.summaryStatValue}>{successRate}%</span>
                                        <span className={endlessStyles.summaryStatLabel}>&gt; SUCCESS_RATE</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className={endlessStyles.summaryStatsGrid}>
                            <div className={endlessStyles.summaryStatItem}>
                                <span className={endlessStyles.summaryStatValue}>{gamesPlayed}</span>
                                <span className={endlessStyles.summaryStatLabel}>GAMES_PLAYED</span>
                            </div>
                            <div className={endlessStyles.summaryStatItem}>
                                <span className={endlessStyles.summaryStatValue}>{highScore}</span>
                                <span className={endlessStyles.summaryStatLabel}>HIGH_SCORE</span>
                            </div>
                            <div className={endlessStyles.summaryStatItem}>
                                <span className={endlessStyles.summaryStatValue}>{longestStreak}</span>
                                <span className={endlessStyles.summaryStatLabel}>BEST_STREAK</span>
                                {isNewStreakRecord && <span className={endlessStyles.newRecord} style={{ fontFamily: 'var(--font-family)' }}>NEW RECORD!</span>}
                            </div>
                            <div className={endlessStyles.summaryStatItem}>
                                <span className={endlessStyles.summaryStatValue}>{successRate}%</span>
                                <span className={endlessStyles.summaryStatLabel}>SUCCESS_RATE</span>
                            </div>
                        </div>
                    )}

                    {/* Guessed games toggle */}
                    <div className={endlessStyles.gamesList}>
                        <button
                            className={endlessStyles.summaryToggle}
                            onClick={() => setShowGuessedGames(!showGuessedGames)}
                        >
                            <span className={endlessStyles.continueButtonText}>
                                &gt; GAMES_GUESSED ({guessedGames.length}) {showGuessedGames ? '▼' : '▶'}
                            </span>
                        </button>
                        {showGuessedGames && (
                            <div className={endlessStyles.gamesListScroll}>
                                {guessedGames.map((result, index) => (
                                    <div key={index} className={`${endlessStyles.gameResultItem} ${endlessStyles.gameWon}`}>
                                        <span className={endlessStyles.gameResultTitle}>{result.gameTitle}</span>
                                        <span className={endlessStyles.gameResultScore}>{result.score}</span>
                                    </div>
                                ))}
                                {guessedGames.length === 0 && (
                                    <div style={{ textAlign: 'center', opacity: 0.5, padding: '1rem', fontFamily: 'var(--font-family-main)' }}>
                                        No games guessed
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Skipped games toggle */}
                    <div className={endlessStyles.gamesList}>
                        <button
                            className={endlessStyles.summaryToggle}
                            onClick={() => setShowSkippedGames(!showSkippedGames)}
                        >
                            <span className={endlessStyles.continueButtonText}>
                                &gt; GAMES_SKIPPED ({skippedGames.length}) {showSkippedGames ? '▼' : '▶'}
                            </span>
                        </button>
                        {showSkippedGames && (
                            <div className={endlessStyles.gamesListScroll}>
                                {skippedGames.map((result, index) => (
                                    <div key={index} className={`${endlessStyles.gameResultItem} ${endlessStyles.gameLost}`}>
                                        <span className={endlessStyles.gameResultTitle}>{result.gameTitle}</span>
                                        <span className={endlessStyles.gameResultScore}>{result.score}</span>
                                    </div>
                                ))}
                                {skippedGames.length === 0 && (
                                    <div style={{ textAlign: 'center', opacity: 0.5, padding: '1rem', fontFamily: 'var(--font-family-main)' }}>
                                        No games skipped
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Buttons */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' }}>
                        <button className={endlessStyles.continueButton} onClick={onPlayAgain}>
                            <span className={endlessStyles.continueButtonText}>[ PLAY_AGAIN.EXE ]</span>
                        </button>
                        <button className={endlessStyles.summarySecondaryButton} onClick={onBackToMenu}>
                            <span className={endlessStyles.continueButtonText}>[ BACK_TO_MENU.EXE ]</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EndlessSummaryModal;
