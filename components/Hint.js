import React, { useState, useEffect } from "react";
import styles from "../styles/Hint.module.css";

const Hint = ({ hint, data, onRevealHint, points, isRevealed }) => {
	const [revealed, setRevealed] = useState(isRevealed);
	const revealHint = () => {
		setRevealed(true);
		onRevealHint(points);
	};

	useEffect(() => {
		setRevealed(isRevealed);
	  }, [isRevealed]);

	useEffect(() => {
		if (data === null) {
			setRevealed(true);
		}
	}, [data]);

	const renderData = () => {
		if (Array.isArray(data)) {
			return data.map((item, index) => (
				<React.Fragment key={index}>
					<span className={styles.hintValue}>{item}</span>
					<br />
				</React.Fragment>
			));
		} else {
			return <span className={styles.hintValue}>{data || "-none-"}</span>;
		}
	};

	return (
		<div className={styles.hint}>
			<div className={styles.hintKey}>{hint}: </div>

			{revealed ? (
				<div>{renderData()}</div>
			) : (
				<>
					<button className="hintButton" onClick={revealHint}>
						Reveal (-{points})
					</button>
				</>
			)}
		</div>
	);
};

export default Hint;
