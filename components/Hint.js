import React, { useState } from "react";
import styles from "../styles/Hint.module.css";

const Hint = ({ hint, data, onRevealHint }) => {
	const [revealed, setRevealed] = useState(false);

	const revealHint = () => {
		setRevealed(true);
		onRevealHint();
	};

	return (
		<>
			{revealed ? (
				<>
					<span className={styles.label}>{hint}: </span>
					<span className={styles.hint}>{data}</span>
				</>
			) : (
				<>
					<span className={styles.label}>{hint}: </span>
					<button className={styles.button} onClick={revealHint}>
						Reveal
					</button>
				</>
			)}
		</>
	);
};

export default Hint;
