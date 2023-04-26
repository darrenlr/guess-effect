import React, { useState } from "react";
import styles from "../styles/Hint.module.css";

const Hint = ({ hint, data, onRevealHint, points, isRevealed }) => {
	const [revealed, setRevealed] = useState(isRevealed);
	const revealHint = () => {
		setRevealed(true);
		onRevealHint(points);
	};

	const renderData = () => {
		if (Array.isArray(data)) {
			return data.map((item, index) => (
				<React.Fragment key={index}>
					<span className={styles.hintValue}>{item}</span>
					<br />
				</React.Fragment>
			));
		} else {
			return <span className={styles.hintValue}>{data}</span>;
		}
	};

	return (
		<div className={styles.hint}>
			<div className={styles.hintKey}>{hint}: </div>

			{revealed ? (
				<div>{renderData()}</div>
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
