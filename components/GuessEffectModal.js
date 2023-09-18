import styles from "../styles/Modal.module.css";

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
					<h4>Guess Effect</h4>
					<div>• Guess the video based on the original release date.</div>
					<div>• Trade points to reveal hints</div>
					<div>• Game ends after 5 incorrect guesses</div>
				</div>
			</div>
		</div>
	);
};

export default GuessEffectModal;
