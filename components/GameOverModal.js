import React, { useEffect } from "react";
import styles from "../styles/GameOverModal.module.css";
import confetti from "canvas-confetti";

const GameOverModal = ({ show, gameTitle, score, gamesPlayed, highestScore, averageScore, gamesWon, onClose }) => {
	useEffect(() => {
		if (show) {
			const confettiAnimation = confetti.create(undefined, {
				resize: true,
				useWorker: true,
			});
			confettiAnimation({
				zIndex: 101,
				particleCount: 100,
				spread: 60,
				origin: { y: 0.6 },
			});
		}
	}, [show]);

	if (!show) {
		return null;
	}

	return (
		<div className={styles.modalOverlay}>
		  <div className={styles.modal}>
			<div className={styles.modalContainer}>
			  <h2>GAME OVER</h2>
			  <p>the game was:</p>
			  <h3>{gameTitle}</h3>
			  <p>Score: {score}</p>
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
			  <button className={styles.closeButton} onClick={onClose}>
				Close
			  </button>
			</div>
		  </div>
		</div>
	  );
	};
	
	export default GameOverModal;
