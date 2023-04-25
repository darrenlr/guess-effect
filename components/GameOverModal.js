import React from "react";
import styles from "../styles/GameOverModal.module.css";

const GameOverModal = ({ show, gameTitle, score, onClose }) => {
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
					<button className={styles.closeButton} onClick={onClose}>
						Close
					</button>
				</div>
			</div>
		</div>
	);
};

export default GameOverModal;
