import React from "react";
import styles from "../styles/WinnerModal.module.css";

const WinnerModal = ({ show, gameTitle, score, onClose }) => {
	if (!show) {
		return null;
	}

	return (
		<div className={styles.modalOverlay}>
			<div className={styles.modal}>
				<div className={styles.modalContainer}>
					<h2>Winner!</h2>
					<p>{gameTitle}</p>
					<p>Score: {score}</p>
					<button className={styles.closeButton} onClick={onClose}>
						Close
					</button>
				</div>
			</div>
		</div>
	);
};

export default WinnerModal;
