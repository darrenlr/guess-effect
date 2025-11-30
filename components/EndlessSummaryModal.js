import React from "react";
import styles from "../styles/GameOverModal.module.css";
import endlessStyles from "../styles/EndlessMode.module.css";

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
    personalBestStreak
}) => {
    if (!show) return null;

    const isNewHighScore = finalScore > highScore;
    const isNewStreakRecord = longestStreak > personalBestStreak;

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modal}>
                <div className={styles.modalContainer}>
                    <h2 className={endlessStyles.summaryTitle}>🎮 Run Complete! 🎮</h2>
                    
                    <div className={endlessStyles.finalScoreSection}>
                        <div className={endlessStyles.mainScore}>
                            <span className={endlessStyles.scoreLabel}>Final Score</span>
                            <span className={endlessStyles.scoreLarge}>{finalScore}</span>
                            {isNewHighScore && <span className={endlessStyles.newRecord}>🏆 NEW HIGH SCORE!</span>}
                        </div>
                    </div>

                    <div className={endlessStyles.statsGrid}>
                        <div className={endlessStyles.statItem}>
                            <span className={endlessStyles.statValue}>{gamesPlayed}</span>
                            <span className={endlessStyles.statLabel}>Games Played</span>
                        </div>
                        <div className={endlessStyles.statItem}>
                            <span className={endlessStyles.statValue}>{gamesGuessed}</span>
                            <span className={endlessStyles.statLabel}>Games Guessed</span>
                        </div>
                        <div className={endlessStyles.statItem}>
                            <span className={endlessStyles.statValue}>{longestStreak}</span>
                            <span className={endlessStyles.statLabel}>Best Streak</span>
                            {isNewStreakRecord && <span className={endlessStyles.newRecord}>✨ NEW RECORD!</span>}
                        </div>
                        <div className={endlessStyles.statItem}>
                            <span className={endlessStyles.statValue}>{Math.round(gamesGuessed / gamesPlayed * 100)}%</span>
                            <span className={endlessStyles.statLabel}>Success Rate</span>
                        </div>
                    </div>

                    <div className={endlessStyles.gamesList}>
                        <h4>Games Guessed ({gameResults.filter(r => r.won).length})</h4>
                        <div className={endlessStyles.gamesListScroll}>
                            {gameResults.filter(r => r.won).map((result, index) => (
                                <div 
                                    key={index} 
                                    className={`${endlessStyles.gameResultItem} ${endlessStyles.gameWon}`}
                                >
                                    <span className={endlessStyles.gameResultTitle}>{result.gameTitle}</span>
                                    <span className={endlessStyles.gameResultScore}>{result.score}</span>
                                </div>
                            ))}
                            {gameResults.filter(r => r.won).length === 0 && (
                                <div style={{ textAlign: 'center', opacity: 0.5, padding: '1rem' }}>
                                    No games guessed
                                </div>
                            )}
                        </div>
                    </div>

                    <div className={endlessStyles.gamesList}>
                        <h4>Games Skipped ({gameResults.filter(r => !r.won).length})</h4>
                        <div className={endlessStyles.gamesListScroll}>
                            {gameResults.filter(r => !r.won).map((result, index) => (
                                <div 
                                    key={index} 
                                    className={`${endlessStyles.gameResultItem} ${endlessStyles.gameLost}`}
                                >
                                    <span className={endlessStyles.gameResultTitle}>{result.gameTitle}</span>
                                    <span className={endlessStyles.gameResultScore}>{result.score}</span>
                                </div>
                            ))}
                            {gameResults.filter(r => !r.won).length === 0 && (
                                <div style={{ textAlign: 'center', opacity: 0.5, padding: '1rem' }}>
                                    No games skipped
                                </div>
                            )}
                        </div>
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
