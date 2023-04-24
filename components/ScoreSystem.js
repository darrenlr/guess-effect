// ScoreSystem.js
import React, { useState, useEffect } from "react";
import ReleaseDate from "./ReleaseDate";
import SearchBar from "./SearchBar";
import GameCard from "./GameCard";
import WinnerModal from "./WinnerModal";
import styles from "../styles/ScoreSystem.module.css";

const ScoreSystem = ({ gameData }) => {
	const [score, setScore] = useState(100);
	const [game, setGame] = useState(null);
	const [isWrongGuess, setIsWrongGuess] = useState(false);
	const [isModalVisible, setIsModalVisible] = useState(false);

	useEffect(() => {
		setGame(getTodaysGame(gameData));
	}, [gameData]);

	const getTodaysGame = (gameData) => {
		const today = new Date();
		const dateString = today.toISOString().split("T")[0];
		return gameData.find((game) => game.date === dateString);
	};

	const onRevealHint = (points) => {
		setScore((prevScore) => prevScore - points);
	};

	const handleGuess = (guess) => {
		if (guess === game.title) {
			setIsModalVisible(true);
		} else {
			setIsWrongGuess(true);
			setTimeout(() => {
				setIsWrongGuess(false);
			}, 500);
		}
	};

	return (
		<div className={styles.container}>
			{game && <ReleaseDate date={game.releaseDate} />}
			<SearchBar onSubmit={handleGuess} />
			{game && (
				<GameCard
					gameData={game}
					onRevealHint={onRevealHint}
					isWrongGuess={isWrongGuess}
				/>
			)}
			<p style={{ margin: "2rem" }}>Score: {score}</p>

			<WinnerModal
				show={isModalVisible}
				gameTitle={game ? game.title : ""}
				score={score}
				onClose={() => setIsModalVisible(false)}
			/>
		</div>
	);
};

export default ScoreSystem;
