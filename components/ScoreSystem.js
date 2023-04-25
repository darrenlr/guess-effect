import React, { useState, useEffect, useMemo } from "react";
import ReleaseDate from "./ReleaseDate";
import SearchBar from "./SearchBar";
import GameCard from "./GameCard";
import GameOverModal from "./GameOverModal";
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
		boxArt: 25,
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

	const todaysDate = useMemo(() => {
		const today = new Date();
		return today.toISOString().split("T")[0];
	}, []);

	const getTodaysGame = useMemo(() => {
		return gameData.find((game) => game.date === todaysDate);
	}, [gameData, todaysDate]);

	useEffect(() => {
		setGame(getTodaysGame);
	}, [getTodaysGame]);

	useEffect(() => {
		if (game && game.releaseDate !== currentGameState.releaseDate) {
			setCurrentGameState({
				...initialGameState,
				releaseDate: game.releaseDate,
			});
		}
	}, [game, currentGameState.releaseDate]);

	useEffect(() => {
		if (currentGameState.remainingGuessCount === 0) {
			setScore(0);
			setCurrentGameState((prevState) => ({
				...prevState,
				hints: {
					publisher: true,
					developer: true,
					genre: true,
					platforms: true,
					metacritic: true,
					plot: true,
					boxArt: 0,
				},
			}));
			setIsModalVisible(true);
		}
	}, [currentGameState.remainingGuessCount]);

	const onRevealHint = (points) => {
		setScore((prevScore) => prevScore - points);
	};

	const handleGuess = (guess) => {
		if (guess === game.title) {
			setIsModalVisible(true);
		} else {
			setIsWrongGuess(true);
			setCurrentGameState((prevState) => ({
				...prevState,
				remainingGuessCount: prevState.remainingGuessCount - 1,
				wrongGuesses: [...prevState.wrongGuesses, guess],
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
					setGameState={setCurrentGameState}
					onRevealHint={onRevealHint}
					isWrongGuess={isWrongGuess}
				/>
			)}
			<p style={{ margin: "2rem" }}>Score: {score}</p>
			<GameOverModal
				show={isModalVisible}
				gameTitle={game ? game.title : ""}
				score={score}
				onClose={() => setIsModalVisible(false)}
			/>
		</div>
	);
};

export default ScoreSystem;
