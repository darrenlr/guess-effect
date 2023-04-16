// ScoreSystem.js
import React, { useState, useEffect } from "react";
import Navbar from "./Navbar";
import ReleaseDate from "./ReleaseDate";
import GameCard from "./GameCard";
import styles from "../styles/ScoreSystem.module.css";

const ScoreSystem = ({ gameData }) => {
	const [score, setScore] = useState(100);
	const [game, setGame] = useState(null);

	useEffect(() => {
		setGame(getTodaysGame(gameData));
	}, [gameData]);

	const onRevealHint = () => {
		setScore(score - 10);
	};

	const getTodaysGame = (gameData) => {
		const today = new Date();
		const dateString = today.toISOString().split("T")[0];
		return gameData.find((game) => game.date === dateString);
	};

	return (
		<div className={styles.container}>
			{game && <ReleaseDate date={game.releaseDate} />}
			{game && <GameCard gameData={game} onRevealHint={onRevealHint} />}
			<p>Score: {score}</p>
		</div>
	);
};

export default ScoreSystem;
