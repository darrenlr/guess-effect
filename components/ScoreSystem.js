import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
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
	guesses: [],
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
	const [hearts, setHearts] = useState(Array(5).fill("/images/heart.png"));
	const [heartAnimationClass, setHeartAnimationClass] = useState("");
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
		const updatedHearts = Array.from({ length: 5 }, (_, index) =>
			index < currentGameState.remainingGuessCount
				? "/images/heart.png"
				: "/images/heart-black.png"
		);
		setHearts(updatedHearts);
	}, [currentGameState.remainingGuessCount]);

	const handleGameOver = (resetScore) => {
		if (resetScore) {
			setScore(0);
		}
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
	};

	useEffect(() => {
		if (currentGameState.remainingGuessCount === 0) {
			handleGameOver(true);
		}
	}, [currentGameState.remainingGuessCount, currentGameState.guesses]);

	const onRevealHint = (points) => {
		setScore((prevScore) => prevScore - points);
	};

	const handleGuess = (guess) => {
		setCurrentGameState((prevState) => ({
			...prevState,
			guesses: [...prevState.guesses, guess],
		}));

		if (guess === game.title) {
			handleGameOver(false);
		} else {
			setCurrentGameState((prevState) => ({
				...prevState,
				remainingGuessCount: prevState.remainingGuessCount - 1,
			}));

			setHeartAnimationClass(styles.pulse);

			setTimeout(() => {
				setHeartAnimationClass(styles.fadeOut);
			}, 500);

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
					gameState={currentGameState}
					setGameState={setCurrentGameState}
					onRevealHint={onRevealHint}
					isWrongGuess={isWrongGuess}
				/>
			)}
			<div className={styles.heartsContainer}>
				{hearts.map((heartSrc, index) => (
					<Image
						key={index}
						src={heartSrc}
						alt="Heart"
						width={30}
						height={30}
					/>
				))}
			</div>

			<p style={{ margin: "1rem" }}>Score: {score}</p>
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
