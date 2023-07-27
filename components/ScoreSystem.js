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
		points: 100,
	},
	guesses: [],
	remainingGuessCount: 1,
};

const initialGameHistory = {
	wins: 0,
	games: 0,
	scores: [],
  };

const ScoreSystem = ({ gameData }) => {
	const [isMounted, setIsMounted] = useState(false);
	const [gameHistory, setGameHistory] = useLocalStorage("GAME_HISTORY", initialGameHistory);
	const [currentGameState, setCurrentGameState] = useLocalStorage(
		"CURRENT_GAME_STATE",
		initialGameState
	);
	const [score, setScore] = useState(100);
	const [game, setGame] = useState(null);
	const [isWrongGuess, setIsWrongGuess] = useState(false);
	const [hearts, setHearts] = useState(Array(5).fill("/images/heart.png"));
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [isGameOver, setIsGameOver] = useState(false);

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

	useEffect(() => {
		if (currentGameState.remainingGuessCount === 0) {
			handleGameOver(true);
		}
	}, [currentGameState.remainingGuessCount, currentGameState.guesses]);

	useEffect(() => {
		setIsMounted(true);
	}, []);

	const handleGameOver = (resetScore) => {
		setIsGameOver(true);

		if (resetScore) {
			setCurrentGameState((prevState) => ({
				...prevState,
				hints: {
					...prevState.hints,
					points: 0,
				},
			}));
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
				points: currentGameState.hints.points, 
			},
		}));

		setGameHistory((prevState) => ({
			...prevState,
			wins: resetScore ? prevState.wins : prevState.wins + 1,
			games: prevState.games + 1,
			scores: [
			  ...prevState.scores,
			  {
				releaseDate: game.releaseDate,
				date: todaysDate,
				score: currentGameState.hints.points ?? 0,
			  },
			],
		}));

		setIsModalVisible(true);
	};

	const onRevealHint = (points) => {
		setCurrentGameState((prevState) => ({
			...prevState,
			hints: {
				...prevState.hints,
				points: prevState.hints.points - points,
			},
		}));
	};

	const handleGuess = (guess) => {
		setCurrentGameState((prevState) => ({
			...prevState,
			guesses: [...prevState.guesses, guess],
		}));

		if (guess === game.title) {
			handleGameOver(false);
		} else {
			setIsWrongGuess(true);

			setTimeout(() => {
				setCurrentGameState((prevState) => ({
					...prevState,
					remainingGuessCount: prevState.remainingGuessCount - 1,
				}));
				setIsWrongGuess(false);
			}, 500);
		}
	};

	return isMounted ? (
		<div className={styles.container}>
			{game && <ReleaseDate date={game.releaseDate} />}
			<SearchBar onSubmit={handleGuess} isGameOver={isGameOver} />
			{game && (
				<GameCard
					gameData={game}
					gameState={currentGameState}
					setGameState={setCurrentGameState}
					onRevealHint={(points) => onRevealHint(points)}
					isWrongGuess={isWrongGuess}
				/>
			)}
			<div className={styles.statsContainer}>
				<div>
					<h4>Misses: </h4>
					{currentGameState.guesses.map((guess, index) => (
						<p
							key={index}
							style={{
								marginTop: "1rem",
								fontSize: "0.8rem",
							}}
						>
							{guess}
						</p>
					))}
				</div>
				<div className={styles.stats}>
					<div className={styles.heartsContainer}>
						{hearts.map((heartSrc, index) => (
							<Image
								key={index}
								src={heartSrc}
								alt="Heart"
								width={30}
								height={30}
								className={
									isWrongGuess &&
									index === currentGameState.remainingGuessCount - 1
										? styles.blink
										: ""
								}
							/>
						))}
					</div>

					<p>Score: {currentGameState.hints.points ?? 100}</p>
				</div>
			</div>
			<GameOverModal
				show={isModalVisible}
				gameTitle={game ? game.title : ""}
				score={currentGameState.hints.points ?? 100}
				onClose={() => setIsModalVisible(false)}
			/>
		</div>
	) : (
		<div className={styles.loader}></div>
	);
};

export default ScoreSystem;
