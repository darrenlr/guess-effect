import React from "react";
import styles from "../styles/GameOverModal.module.css";

const StatsModal = ({ closeModal, gamesPlayed, highestScore, averageScore, gamesWon }) => {
	const handleClickOutside = (event) => {
		if (event.target.className === styles.modalOverlay) {
			closeModal();
		}
	};

	return (
		<div className={styles.modalOverlay} onClick={handleClickOutside}>
		  <div className={styles.modal}>
			<div className={styles.modalContainer}>
			  <h2>Stats</h2>
			  <div className={styles.statsRow}>
				<div>
				  <p>{gamesPlayed}</p>
				  <span>Played</span>
				</div>
				<div>
				  <p>{highestScore}</p>
				  <span>High</span>
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
			</div>
		  </div>
		</div>
	  );
	};
	
export default StatsModal;
