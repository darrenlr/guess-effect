// GameCard.js
import React from "react";
import Hint from "./Hint";
import styles from "../styles/GameCard.module.css";

const GameCard = ({ gameData }) => {
	return (
		<div className={styles.card}>
			<img src={gameData.boxArtUrl} alt="Box Art" className={styles.boxArt} />
			<ul className={styles.hints}>
				{Object.entries(gameData).map(([key, value]) => (
					<Hint key={key} hint={key} data={value} />
				))}
			</ul>
		</div>
	);
};

export default GameCard;
