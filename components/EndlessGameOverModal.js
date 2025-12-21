import React from "react";
import styles from "../styles/GameOverModal.module.css";
import endlessStyles from "../styles/EndlessMode.module.css";

const EndlessGameOverModal = ({ show, gameTitle, score, won, onContinue }) => {
    if (!show) return null;

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modal}>
                <div className={styles.modalContainer}>
                    <h3>{won ? "🎉 Correct!" : "Game Skipped"}</h3>
                    <div className={endlessStyles.gameTitle}>{gameTitle}</div>
                    
                    <div className={endlessStyles.scoreSection}>
                        <div className={endlessStyles.finalScore}>
                            <span className={endlessStyles.scoreLabel}>Score</span>
                            <span className={endlessStyles.scoreValue}>{score}</span>
                        </div>
                    </div>

                    {won ? (
                        <p className={endlessStyles.successMessage}>Great job! Keep the streak going! 🎮</p>
                    ) : (
                        <p className={endlessStyles.skipMessage}>Better luck with the next one! 💪</p>
                    )}

                    <button 
                        className={endlessStyles.continueButton}
                        onClick={onContinue}
                    >
                        Continue to Next Game
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EndlessGameOverModal;
