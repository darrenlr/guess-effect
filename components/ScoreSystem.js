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
	life: {
		guesses: [],
		remainingGuessCount: 5,
		hearts: Array(5).fill("/images/heart.png"),
	},
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
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [isGameOver, setIsGameOver] = useLocalStorage("IS_GAME_OVER", false);
	const [isGuessCountUpdated, setIsGuessCountUpdated] = useState(false);
	const [modalScore, setModalScore] = useState(null);

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
		if (todaysDate !== currentGameState.date && getTodaysGame) {
			setGameHistory(initialGameHistory);
		  	setCurrentGameState({
			...initialGameState,
			releaseDate: getTodaysGame.releaseDate,
			date: todaysDate,
		  });
		  setIsGameOver(false);
		}
	  }, [todaysDate, getTodaysGame, currentGameState.date]);

	useEffect(() => {
		if (game && game.releaseDate !== currentGameState.releaseDate) {
		  const existingGameEntry = gameHistory.scores.find(scoreEntry => scoreEntry.releaseDate === game.releaseDate);
		  if (existingGameEntry) {
			setCurrentGameState((prevState) => ({
			  ...prevState,
			  hints: {
				...prevState.hints,
				points: existingGameEntry.score
			  }
			}));
			handleGameOver(existingGameEntry.score === 0);
		  } else {
			setCurrentGameState({
			  ...initialGameState,
			  releaseDate: game.releaseDate
			});
		  }
		}
	  }, [game, currentGameState.releaseDate, gameHistory.scores]);	  

	  useEffect(() => {
		const updatedHearts = Array.from({ length: 5 }, (_, index) =>
			index < currentGameState.life.remainingGuessCount
				? "/images/heart.png"
				: "/images/heart-black.png"
		);
		setCurrentGameState((prevState) => ({
			...prevState,
			life: {
				...prevState.life,
				hearts: updatedHearts,
			},
		}));
	}, [currentGameState.life.remainingGuessCount]);

	useEffect(() => {
		if (isGuessCountUpdated && currentGameState.life.remainingGuessCount === 0) {
			handleGameOver(true);
		  }
		  setIsGuessCountUpdated(false);
		}, [isGuessCountUpdated, currentGameState.life.remainingGuessCount]);

	useEffect(() => {
		setIsMounted(true);
	}, []);

	useEffect(() => {
		setIsModalVisible(isGameOver);
		setModalScore(currentGameState.hints.points);
	}, [isGameOver]);

	const handleGameOver = (resetScore) => {
		setIsGameOver(true);
		let finalScore = resetScore ? 0 : currentGameState.hints.points;
	
		setModalScore(finalScore);
	
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
				points: finalScore, 
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
					score: finalScore,
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
		if (guess === game.title) {
			handleGameOver(false);
		} else {
			setCurrentGameState((prevState) => {
				let updatedGuesses = [...prevState.life.guesses, guess];
				let updatedRemainingGuessCount = prevState.life.remainingGuessCount - 1;
	
				if (updatedRemainingGuessCount === 0) {
					handleGameOver(true);
				}
	
				return {
					...prevState,
					life: {
						...prevState.life,
						guesses: updatedGuesses,
						remainingGuessCount: updatedRemainingGuessCount,
					},				};
			});
	
			setIsWrongGuess(true);
			setTimeout(() => {
				setIsGuessCountUpdated(true);
				setIsWrongGuess(false);
			}, 500);
		}
	};

	return isMounted ? (
		<div className={styles.container}>
			{game && <ReleaseDate date={game.releaseDate} />}
			<SearchBar onSubmit={handleGuess} isGameOver={isGameOver} />
			{game && currentGameState && (
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
					{currentGameState.life.guesses.map((guess, index) => (
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
						{currentGameState.life.hearts.map((heartSrc, index) => (
							<Image
								key={index}
								src={heartSrc}
								alt="Heart"
								width={30}
								height={30}
								className={
									isWrongGuess &&
									index === currentGameState.life.remainingGuessCount - 1
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
				score={modalScore}
				onClose={() => setIsModalVisible(false)}
			/>
		</div>
	) : (
		<div className={styles.loader}></div>
	);
};

export default ScoreSystem;
