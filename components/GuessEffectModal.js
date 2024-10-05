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
					<h3>Guess Effect</h3>
					<ul className={styles.help}>
						<li>Guess the videogame based on the initial release date (the earliest release date, considering staggered regional launches).</li>
						<li>Trade points to reveal hints, including platforms (considering the first platform the game was released on globally).</li>
						<li>Recieve bonus points for making fewer guesses.</li>
						<li>The game ends after 4 incorrect guesses.</li>
					</ul>
				
				</div>
			</div>
		</div>
	);
};

export default GuessEffectModal;
