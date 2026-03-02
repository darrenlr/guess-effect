import React from "react";
import endlessStyles from "../styles/EndlessMode.module.css";
import gameOverStyles from "../styles/GameOverModal.module.css";

const EndlessStatsModal = ({ closeModal, stats }) => {
    const handleClickOutside = (event) => {
        if (event.target.className === endlessStyles.modalOverlay) {
            closeModal();
        }
    };

    return (
        <div className={endlessStyles.modalOverlay} onClick={handleClickOutside}>
            <div className={endlessStyles.modal}>
                <div className={endlessStyles.modalHeader}>
                    C:\GAMES\ENDLESS\STATS.SYS
                </div>

                <div className={gameOverStyles.scanOverlay}>
                    <div className={endlessStyles.modalScanlines} style={{ position: 'absolute', inset: 0 }} />
                    <div className={endlessStyles.modalScanLine} />
                </div>

                <div className={endlessStyles.modalBody}>
                    <div className={endlessStyles.modalScoreBlock}>
                        <div className={endlessStyles.modalScoreLabel}>&gt; HIGH_SCORE</div>
                        <div className={endlessStyles.modalScoreValue}>{stats.highScore ?? 0}</div>
                    </div>

                    <div className={endlessStyles.summaryStatsGrid}>
                        <div className={endlessStyles.summaryStatItem}>
                            <div className={endlessStyles.summaryStatValue}>{stats.longestStreak ?? 0}</div>
                            <div className={endlessStyles.summaryStatLabel}>BEST_STREAK</div>
                        </div>
                        <div className={endlessStyles.summaryStatItem}>
                            <div className={endlessStyles.summaryStatValue}>{stats.totalRuns ?? 0}</div>
                            <div className={endlessStyles.summaryStatLabel}>TOTAL_RUNS</div>
                        </div>
                    </div>

                    <button className={endlessStyles.continueButton} onClick={closeModal}>
                        <span className={endlessStyles.continueButtonText}>[CLOSE.EXE]</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EndlessStatsModal;
