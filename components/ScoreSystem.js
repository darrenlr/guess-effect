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

const initialGameHistory = {
	wins: 0,
	games: 0,
	scores: [],
  };

const ScoreSystem = () => {
	const [isMounted, setIsMounted] = useState(false);
	const [gameHistory, setGameHistory] = useLocalStorage("GAME_HISTORY", initialGameHistory);
	const [currentGameState, setCurrentGameState] = useLocalStorage(
		"CURRENT_GAME_STATE",
		initialGameState
	);
	const [game, setGame] = useState(null);
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

	  useEffect(() => {
		const fetchData = async () => {
			const today = new Date().toISOString().split('T')[0];
			const response = await fetch(`/api/contentfulGame?date=${today}`);
			const data = await response.json();
			setGame(data);
		};
	
		fetchData();
	}, []);

	useEffect(() => {
		if (todaysDate !== currentGameState.date && game) {
		  	setCurrentGameState({
			...initialGameState,
			releaseDate: game.releaseDate,
			date: todaysDate,
		  });
		}
	  }, [todaysDate, game, currentGameState.date]);

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
		const cleanedGuess = stripBrackets(guess);
		const cleanedGameTitle = stripBrackets(game.title);
	
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
			{game && <ReleaseDate date={game.releaseDate} />}
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
  				gamesPlayed={gameHistory.games}
  				highestScore={highestScore}
  				averageScore={averageScore}
  				gamesWon={gameHistory.wins}
  				onClose={() => setIsModalVisible(false)}
			/>
		</div>
	) : (
		<div className={styles.loader}></div>
	);
};

export default ScoreSystem;
