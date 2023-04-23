import React, { useState } from "react";
import styles from "../styles/Hint.module.css";

const Hint = ({ hint, data, onRevealHint, points }) => {
	const [revealed, setRevealed] = useState(false);

	const revealHint = () => {
		setRevealed(true);
		onRevealHint(points);
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
						Reveal (-{points})
					</button>
				</>
			)}
		</>
	);
};

export default Hint;
