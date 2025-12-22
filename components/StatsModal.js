import React from "react";
import styles from "../styles/GameOverModal.module.css";

const StatsModal = ({ closeModal, gamesPlayed, highestScore, averageScore, gamesWon, currentStreak, longestStreak }) => {
	const handleClickOutside = (event) => {
		if (event.target.className === styles.modalOverlay) {
			closeModal();
		}
	};

	return (
		<div className={styles.modalOverlay} onClick={handleClickOutside}>
		  <div className={styles.modal}>
			<div className={styles.terminalHeader}>C:\GAMES\STATS.EXE</div>
			<div className={styles.modalContainer}>
			  <div className={styles.directoryHeader}>
				Directory of C:\GAMES\USER\STATS
			  </div>
			  <div className={styles.fileList}>
				<div className={styles.fileItem}>
				  <span>HIGH_SCORE.DAT</span>
				  <span>{highestScore}</span>
				</div>
				<div className={styles.fileItem}>
				  <span>GAMES_PLAYED.DAT</span>
				  <span>{gamesPlayed}</span>
				</div>
				<div className={styles.fileItem}>
				  <span>AVG_SCORE.DAT</span>
				  <span>{averageScore}</span>
				</div>
				<div className={styles.fileItem}>
				  <span>WINS.DAT</span>
				  <span>{gamesWon}</span>
				</div>
				<div className={styles.fileItem}>
				  <span>STREAK.DAT</span>
				  <span>{currentStreak}</span>
				</div>
				<div className={styles.fileItem}>
				  <span>MAX_STREAK.DAT</span>
				  <span>{longestStreak}</span>
				</div>
			  </div>
			  <div className={styles.directoryFooter}>
				6 File(s)     {gamesPlayed} game(s) completed
			  </div>
			</div>
		  </div>
		</div>
	  );
	};
	
export default StatsModal;
