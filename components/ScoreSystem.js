import React, { useState, useEffect } from "react";
import ReleaseDate from "./ReleaseDate";
import SearchBar from "./SearchBar";
import GameCard from "./GameCard";
import WinnerModal from "./WinnerModal";
import useLocalStorage from "../hooks/useLocalStorage";
import styles from "../styles/ScoreSystem.module.css";

const initialGameState = {
	releaseDate: "",
	hints: {
		publisher: true,
		developer: false,
		genre: false,
		platforms: false,
		metacritic: false,
		plot: false,
	},
	wrongGuesses: [],
	remainingGuessCount: 5,
};

const ScoreSystem = ({ gameData }) => {
	const [gameHistory, setGameHistory] = useLocalStorage("GAME_HISTORY", []);

	const [currentGameState, setCurrentGameState] = useLocalStorage(
		"CURRENT_GAME_STATE",
		initialGameState
	);

	const [score, setScore] = useState(100);
	const [game, setGame] = useState(null);
	const [isWrongGuess, setIsWrongGuess] = useState(false);
	const [isModalVisible, setIsModalVisible] = useState(false);

	useEffect(() => {
		const todaysGame = getTodaysGame(gameData);
		setGame(todaysGame);
	}, [gameData]);

	const getTodaysGame = (gameData) => {
		const today = new Date();
		const dateString = today.toISOString().split("T")[0];
		return gameData.find((game) => game.date === dateString);
	};

	useEffect(() => {
		if (game) {
			if (game.releaseDate !== currentGameState.releaseDate) {
				setCurrentGameState({
					...initialGameState,
					releaseDate: game.releaseDate,
				});
			}
		}
	}, [game]);

	const onRevealHint = (points) => {
		setScore((prevScore) => prevScore - points);
	};

	const handleGuess = (guess) => {
		if (guess === game.title) {
			setIsModalVisible(true);
		} else {
			setIsWrongGuess(true);

			setGameState((prevState) => ({
				...prevState,
				remainingGuessCount: prevState.remainingGuessCount - 1,
			}));

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
					gameState={currentGameState}
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
