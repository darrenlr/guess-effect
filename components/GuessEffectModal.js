import styles from "../styles/GameOverModal.module.css";

const GuessEffectModal = ({ closeModal }) => {

	const handleClickOutside = (event) => {
		if (event.target.className === styles.modalOverlay) {
			closeModal();
		}
	};

	return (
		<div className={styles.modalOverlay} onClick={handleClickOutside}>
			<div className={styles.modal}>
				<div className={styles.modalContainer}>
					<h3>Guess Effect</h3>
					<p>How to play</p>
				</div>
			</div>
		</div>
	);
};

export default GuessEffectModal;
