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
			<div className={styles.modalContainer}>
			  <h3>Stats</h3>
			  <div className={styles.statsRow}>
			  	<div>
				  <p>{highestScore}</p>
				  <span>High Score</span>
				</div>
			  </div>
			  <div className={styles.statsRow}>
				<div>
				  <p>{gamesPlayed}</p>
				  <span>Games</span>
				</div>
				<div>
				  <p>{averageScore}</p>
				  <span>Avg</span>
				</div>
				<div>
				  <p>{gamesWon}</p>
				  <span>Wins</span>
				</div>
			  </div>
			  <div className={styles.statsRow}>
				<div>
					<p>{currentStreak}</p>
					<span>Current Streak</span>
				</div>
				<div>
					<p>{longestStreak}</p>
					<span>Max Streak</span>
				</div>
			  </div>
			</div>
		  </div>
		</div>
	  );
	};
	
export default StatsModal;
