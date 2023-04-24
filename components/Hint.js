import React, { useState } from "react";
import styles from "../styles/Hint.module.css";

const Hint = ({ hint, data, onRevealHint, points }) => {
	const [revealed, setRevealed] = useState(false);

	const revealHint = () => {
		setRevealed(true);
		onRevealHint(points);
	};

	return (
		<div className={styles.hint}>
			<div className={styles.hintKey}>{hint}: </div>

			{revealed ? (
				<>
					<span className={styles.hintValue}>{data}</span>
				</>
			) : (
				<>
					<button className={styles.hintButton} onClick={revealHint}>
						Reveal (-{points})
					</button>
				</>
			)}
		</div>
	);
};

export default Hint;
