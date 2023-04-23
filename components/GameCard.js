import React from "react";
import Hint from "./Hint";
import styles from "../styles/GameCard.module.css";

const hintPoints = [
	{ hint: "publisher", points: 15 },
	{ hint: "developer", points: 25 },
	{ hint: "genre", points: 5 },
	{ hint: "platforms", points: 5 },
	{ hint: "metacritic", points: 10 },
	{ hint: "plot", points: 40 },
	// and so on
];

const GameCard = ({ gameData, onRevealHint }) => {
	return (
		<div className={styles.card}>
			<img src={gameData.boxArtUrl} alt="Box Art" className={styles.boxArt} />
			<table className={styles.hints}>
				<thead>
					<tr>
						<th>
							<h4>???</h4>
						</th>
					</tr>
				</thead>
				<tbody>
					{hintPoints.map((hintObj) => (
						<tr key={hintObj.hint}>
							<td>
								<Hint
									hint={hintObj.hint}
									data={gameData.hints[hintObj.hint]}
									onRevealHint={onRevealHint}
									points={hintObj.points}
								/>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
};

export default GameCard;
