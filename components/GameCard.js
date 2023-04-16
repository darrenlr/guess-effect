import React from "react";
import Hint from "./Hint";
import styles from "../styles/GameCard.module.css";

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
					{Object.entries(gameData.hints).map(([key, value]) => (
						<tr key={key}>
							<td>
								<Hint
									key={key}
									hint={key}
									data={value}
									onRevealHint={onRevealHint}
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
