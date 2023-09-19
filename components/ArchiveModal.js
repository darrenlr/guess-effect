import styles from "../styles/GameOverModal.module.css";

const ArchiveModal = ({ closeModal }) => {

	const handleClickOutside = (event) => {
		if (event.target.className === styles.modalOverlay) {
			closeModal();
		}
	};

	return (
		<div className={styles.modalOverlay} onClick={handleClickOutside}>
			<div className={styles.modal}>
				<div className={styles.modalContainer}>
					<h4>Archives</h4>
					<p>Coming soon...</p>
				</div>
			</div>
		</div>
	);
};

export default ArchiveModal;
