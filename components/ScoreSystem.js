import React, { useState, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import ReleaseDate from "./ReleaseDate";
import SearchBar from "./SearchBar";
import GameCard from "./GameCard";
import GameOverModal from "./GameOverModal";
import useLocalStorage from "../hooks/useLocalStorage";
import { stripBrackets } from '../utils/stringUtils';
import styles from "../styles/ScoreSystem.module.css";

import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../utils/firebase'; 

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
	hasPlayed: false,
};

const trackPlayer = async () => {
	const today = new Date().toISOString().split("T")[0];
	const docRef = doc(db, 'playerCounts', today);
	const docSnap = await getDoc(docRef);
  
	if (docSnap.exists()) {
	  // Increment the existing count
	  await updateDoc(docRef, { count: docSnap.data().count + 1 });
	} else {
	  // Create a new document for today with count 1
	  await setDoc(docRef, { count: 1 });
	}
  
	const updatedDoc = await getDoc(docRef);
	return updatedDoc.data().count;
  };

  const fetchPlayerCount = async () => {
	const today = new Date().toISOString().split("T")[0];
	const docRef = doc(db, "playerCounts", today);
	const docSnap = await getDoc(docRef);
  
	if (docSnap.exists()) {
	  return docSnap.data().count;
	}

	return 0;
  };  

const ScoreSystem = ({ game, gameHistory, setGameHistory }) => {
	const [isMounted, setIsMounted] = useState(false);
	const [currentGameState, setCurrentGameState] = useLocalStorage(
		"CURRENT_GAME_STATE",
		initialGameState,
		game.date
	);
	const [isWrongGuess, setIsWrongGuess] = useState(false);
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [isGuessCountUpdated, setIsGuessCountUpdated] = useState(false);
	const [modalScore, setModalScore] = useState(null);
	const [playerCount, setPlayerCount] = useState(0);

	const [animatedScore, setAnimatedScore] = useState(currentGameState.hints.points);
	const [animatedBonus, setAnimatedBonus] = useState(currentGameState.life.remainingGuessCount * 20);

	useEffect(() => {
		// Fetch the player count on component mount
		fetchPlayerCount().then((count) => {
		  setPlayerCount(count);
		});
	  }, []);

	useEffect(() => {
		const targetScore = currentGameState.hints.points;
		const duration = 200; // Duration of the animation in milliseconds
		const stepTime = 50; // Interval between updates
		const scoreDifference = targetScore - animatedScore;
		const steps = duration / stepTime;
		const stepSize = scoreDifference / steps;
	
		const intervalId = setInterval(() => {
		  setAnimatedScore((prevScore) => {
			const nextScore = prevScore + stepSize;
			if ((stepSize > 0 && nextScore >= targetScore) || (stepSize < 0 && nextScore <= targetScore)) {
			  clearInterval(intervalId);
			  return targetScore;
			}
			return nextScore;
		  });
		}, stepTime);
	
		return () => clearInterval(intervalId);
	  }, [currentGameState.hints.points]);

	useEffect(() => {
		const targetBonus = currentGameState.life.remainingGuessCount * 20;
		const duration = 200; // Duration of the animation in milliseconds
		const stepTime = 50; // Interval between updates
		const bonusDifference = targetBonus - animatedBonus;
		const steps = duration / stepTime;
		const stepSize = bonusDifference / steps;
	
		const intervalId = setInterval(() => {
		  setAnimatedBonus((prevBonus) => {
			const nextBonus = prevBonus + stepSize;
			if ((stepSize > 0 && nextBonus >= targetBonus) || (stepSize < 0 && nextBonus <= targetBonus)) {
			  clearInterval(intervalId);
			  return targetBonus;
			}
			return nextBonus;
		  });
		}, stepTime);
	
		return () => clearInterval(intervalId);
	}, [currentGameState.life.remainingGuessCount]);  

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
		if (todaysDate !== currentGameState.date && game) {
		  setCurrentGameState({
			...initialGameState,
			releaseDate: game.releaseDate,
			date: todaysDate,
			hasPlayed: false,
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
				hearts: prevState.life.hearts,
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
		setModalScore(currentGameState.hints.points + (currentGameState.life.remainingGuessCount * 20));
	}, [isGameOver]);

	useEffect(() => {
		gameOverRef.current = triggerGameOver;
	}, []);

	const handleGameOver = (resetScore) => {
		let score = resetScore ? 0 : currentGameState.hints.points;
		let finalScore = score + (currentGameState.life.remainingGuessCount * 20);
	
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
				points: score,
			  },
			  hasPlayed: true,
			};
			
			// Save immediately to localStorage
			window.localStorage.setItem("CURRENT_GAME_STATE", JSON.stringify(updatedGameState));
			
			return updatedGameState;
		});
	
		setGameHistory((prevState) => ({
			...prevState,
			wins: resetScore ? prevState.wins : prevState.wins + 1,
			games: prevState.games + 1,
			currentStreak: currentStreak,
			longestStreak: longestStreak,
			scores: [
			  ...prevState.scores,
			  {
				releaseDate: game.releaseDate,
				date: todaysDate,
				score: finalScore,
			  },
			],
		}));

		trackPlayer().then((count) => {
			setPlayerCount(count); 
		});
	
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
					<p>Bonus: {Math.round(animatedBonus)}</p>
					<p>Score: {Math.round(animatedScore)}</p>
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
					<p>Misses: </p>
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
				<div>
					<p
						style={{
							fontSize: "0.55rem",
						}}
					>
						Players today: {playerCount}
					</p>
					<p
						style={{
							marginTop: "1rem",
							marginBottom: "1rem",
							fontSize: "0.55rem",
						}}
					>
						Avg score: {playerCount}
					</p>
					<p
						style={{
							fontSize: "0.55rem",
						}}
					>
						Avg attempts: {playerCount}
					</p>
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

					<p>Bonus: {Math.round(animatedBonus)}</p>
					<p>Score: {Math.round(animatedScore)}</p>
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
