import React, { useState, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import ReleaseDate from "./ReleaseDate";
import SearchBar from "./SearchBar";
import GameCard from "./GameCard";
import GameOverModal from "./GameOverModal";
import useLocalStorage from "../hooks/useLocalStorage";
import { stripBrackets } from '../utlis/stringUtils';
import styles from "../styles/ScoreSystem.module.css";

const initialGameState = {
	date: null,
	releaseDate: "",
	hints: {
		publisher: true,
		developer: false,
		genre: false,
		platforms: false,
		modes: true,
		engine: true,
		metacritic: false,
		plot: false,
		boxArt: 40,
		points: 100,
	},
	life: {
		guesses: [],
		remainingGuessCount: 5,
		hearts: Array(5).fill("/images/heart.png"),
	},
};



const ScoreSystem = ({ game, gameHistory, setGameHistory }) => {
	const [isMounted, setIsMounted] = useState(false);
	const [currentGameState, setCurrentGameState] = useLocalStorage(
		"CURRENT_GAME_STATE",
		initialGameState
	);
	const [isWrongGuess, setIsWrongGuess] = useState(false);
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [isGuessCountUpdated, setIsGuessCountUpdated] = useState(false);
	const [modalScore, setModalScore] = useState(null);

	const gameOverRef = useRef(null);

  	const triggerGameOver = () => {
    	setIsGuessCountUpdated(true);
	};

	const todaysDate = useMemo(() => {
		const today = new Date();
		return today.toISOString().split("T")[0];
	}, []);

	const isGameOver = gameHistory.scores.some(scoreEntry => scoreEntry.date === todaysDate);

	const highestScore = useMemo(() => {
		if (gameHistory.scores.length > 0) {
	  	return gameHistory.scores.reduce((highScore, game) => 
			game.score > highScore ? game.score : highScore, 0);
		}
		return 0;
  	}, [gameHistory]);
  
  	const averageScore = useMemo(() => {
		if (gameHistory.scores.length > 0) {
	  	let totalScore = gameHistory.scores.reduce((total, game) => total + game.score, 0);
	  	return Math.round(totalScore / gameHistory.scores.length);
		}
		return 0;
  	}, [gameHistory]);

	  const calculateStreaks = (scores) => {
		let currentStreak = 0;
		let longestStreak = 0;
		let tempStreak = 0;
	
		for (let score of scores) {
			if (score.score > 0) {
				tempStreak++;
				currentStreak++;
			} else {
				tempStreak = 0;
				currentStreak = 0;
			}
			longestStreak = Math.max(longestStreak, tempStreak);
		}
	
		return {
			currentStreak,
			longestStreak,
		};
	}	

	useEffect(() => {
		if (!currentGameState.date && game) {
			setCurrentGameState({
			  ...initialGameState,
			  releaseDate: game.releaseDate,
			  date: todaysDate,
			});
		} else if (todaysDate !== currentGameState.date && game) {
		  setCurrentGameState({
			...initialGameState,
			releaseDate: game.releaseDate,
			date: todaysDate,
		  });
		} else if (isGameOver) {
		  setCurrentGameState((prevState) => ({
			...prevState,
			hints: {
			  publisher: true,
			  developer: true,
			  genre: true,
			  platforms: true,
			  modes: true,
			  engine: true,
			  metacritic: true,
			  plot: true,
			  boxArt: 0,
			  points: prevState.hints.points,
			},
			life: {
				guesses: prevState.life.guesses,
				remainingGuessCount: prevState.life.remainingGuessCount,
				hearts: Array(5).fill("/images/heart.png"),
			},
		  }));
		}
	  }, [todaysDate, game, currentGameState.date, isGameOver]);

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

	useEffect(() => {
		gameOverRef.current = triggerGameOver;
	}, []);

	const handleGameOver = (resetScore) => {
		let finalScore = resetScore ? 0 : currentGameState.hints.points;
	
		setModalScore(finalScore);

		const { currentStreak, longestStreak } = calculateStreaks([...gameHistory.scores, {
			releaseDate: game.releaseDate,
			date: todaysDate,
			score: finalScore,
		}]);		
	
		setCurrentGameState((prevState) => {
			const updatedGameState = {
			  ...prevState,
			  hints: {
				publisher: true,
				developer: true,
				genre: true,
				platforms: true,
				modes: true,
				engine: true,
				metacritic: true,
				plot: true,
				boxArt: 0,
				points: finalScore,
			  },
			};
			
			// Save immediately to localStorage
			window.localStorage.setItem("CURRENT_GAME_STATE", JSON.stringify(updatedGameState));
			
			return updatedGameState;
		  });
	
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
	
		setModalScore(finalScore);
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
		const cleanedGuess = stripBrackets(guess).toLowerCase();
		const cleanedGameTitle = stripBrackets(game.title).toLowerCase();
	
		if (cleanedGuess === cleanedGameTitle) {
			handleGameOver(false);
		} else {
			setCurrentGameState((prevState) => {
				let updatedGuesses = [...prevState.life.guesses, guess];
				let updatedRemainingGuessCount = prevState.life.remainingGuessCount - 1;
	
				return {
					...prevState,
					life: {
						...prevState.life,
						guesses: updatedGuesses,
						remainingGuessCount: updatedRemainingGuessCount,
					},				
				};
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
			{game && <ReleaseDate date={game.releaseDate} region={game.region} />}
			<div className={`${styles.stats} ${styles.statsMobile}`}>
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
									index === currentGameState.life.remainingGuessCount
										? styles.blink
										: ""
								}
							/>
						))}
					</div>
					<p>Score: {currentGameState.hints.points ?? 100}</p>
				</div>
			<SearchBar onSubmit={handleGuess} isGameOver={isGameOver} />
			{game && currentGameState && (
				<GameCard
					gameData={game}
					gameState={currentGameState}
					setGameState={setCurrentGameState}
					onRevealHint={(points) => onRevealHint(points)}
					isWrongGuess={isWrongGuess}
					setIsGuessCountUpdated={setIsGuessCountUpdated}
					isGameOver={isGameOver}
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
									index === currentGameState.life.remainingGuessCount
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
  				gamesPlayed={gameHistory.games}
  				highestScore={highestScore}
  				averageScore={averageScore}
  				gamesWon={gameHistory.wins}
				currentStreak={gameHistory.currentStreak}
				longestStreak={gameHistory.longestStreak}
				gameWon={currentGameState.life.remainingGuessCount !== 0}
				onClose={() => setIsModalVisible(false)}
			/>
		</div>
	) : (
		<div className={styles.loader}></div>
	);
};

export default ScoreSystem;
