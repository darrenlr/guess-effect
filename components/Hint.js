// Hint.js
import React, { useState } from "react";

const Hint = ({ hint, data }) => {
	const [revealed, setRevealed] = useState(false);

	const revealHint = () => {
		setRevealed(true);
	};

	return (
		<li>
			{revealed ? (
				`${hint}: ${data}`
			) : (
				<button onClick={revealHint}>Reveal {hint}</button>
			)}
		</li>
	);
};

export default Hint;
