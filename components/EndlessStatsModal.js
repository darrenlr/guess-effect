import React from "react";
import styles from "../styles/GameOverModal.module.css";

const EndlessStatsModal = ({ closeModal, stats }) => {
	const handleClickOutside = (event) => {
		if (event.target.className === styles.modalOverlay) {
			closeModal();
		}
	};

	return (
		<div className={styles.modalOverlay} onClick={handleClickOutside}>
		  <div className={styles.modal}>
			<div className={styles.modalContainer}>
			  <h3>Endless Mode Stats</h3>
			  <div className={styles.statsRow}>
				<div>
				  <p>{stats.highScore}</p>
				  <span>High Score</span>
				</div>
			  </div>
			  <div className={styles.statsRow}>
				<div>
				  <p>{stats.longestStreak}</p>
				  <span>Best Streak</span>
				</div>
				<div>
				  <p>{stats.totalRuns}</p>
				  <span>Total Runs</span>
				</div>
			  </div>
			</div>
		  </div>
		</div>
	  );
};
	
export default EndlessStatsModal;
