import styles from "../styles/GameOverModal.module.css";

const SupportModal = ({ closeModal }) => {

	const handleClickOutside = (event) => {
		if (event.target.className === styles.modalOverlay) {
			closeModal();
		}
	};

	return (
		<div className={styles.modalOverlay} onClick={handleClickOutside}>
			<div className={styles.modal}>
				<div className={styles.modalContainer}>
					<h3>Support</h3>
					<p>Thank you so much for playing!</p>
					<p>If you've enjoyed, please consider supporting, this will give you access to the game archives when they go live!</p>
				</div>
			</div>
		</div>
	);
};

export default SupportModal;
