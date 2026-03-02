import styles from "../styles/Modal.module.css";

const GuessEffectModal = ({ closeModal, isEndlessMode = false }) => {

	const handleClickOutside = (event) => {
		if (event.target.className === styles.modalOverlay) {
			closeModal();
		}
	};

	return (
		<div className={styles.modalOverlay} onClick={handleClickOutside}>
			<div className={styles.modal}>
				<div className={styles.terminalHeader}>{isEndlessMode ? 'C:\\GAMES\\ENDLESS\\HELP.EXE' : 'C:\\GAMES\\HELP.EXE'}</div>
				<div className={styles.modalContainer}>
					{isEndlessMode ? (
						<ul className={styles.help}>
							<li>Guess as many videogames as you can before running out of lives.</li>
							<li>Each game is identified by its earliest global release date, accounting for staggered regional launches.</li>
							<li>Trade points to reveal hints, including platforms (based on the first platform the game launched on globally).</li>
							<li>You have 10 lives across the entire run — a wrong guess or skip costs one life.</li>
							<li>Score as many points as possible before your lives run out.</li>
						</ul>
					) : (
						<ul className={styles.help}>
							<li>Guess the videogame based on the initial release date (the earliest release date, considering staggered regional launches).</li>
							<li>Trade points to reveal hints, including platforms (considering the first platform the game was released on globally).</li>
							<li>Recieve bonus points for making fewer guesses.</li>
							<li>The game ends after 4 incorrect guesses.</li>
						</ul>
					)}
				</div>
			</div>
		</div>
	);
};

export default GuessEffectModal;
