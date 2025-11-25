import React, { useState, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import ReleaseDate from "./ReleaseDate";
import SearchBar from "./SearchBar";
import GameCard from "./GameCard";
import GameOverModal from "./GameOverModal";
import useLocalStorage from "../hooks/useLocalStorage";
import useArchiveLocalStorage from "../hooks/useArchiveLocalStorage";
import usePlayerStats from "../hooks/usePlayerStats";
import { stripBrackets } from '../utils/stringUtils';
import { normaliseString } from '../utils/normaliseString';
import styles from "../styles/ScoreSystem.module.css";

import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../utils/firebase'; 
import { serverTimestamp } from 'firebase/firestore';

const getCollectionName = () => {
	const branch = process.env.NEXT_PUBLIC_BRANCH || 'main'; 
  
	if (branch === 'release') {
	  return "playerStats-release";
	}
  
	return "playerStats";
};

const initialGameState = {
	date: null,
	releaseDate: "",
	hints: {
		publisher: false,
		developer: false,
		genre: false,
		platforms: false,
		modes: true,
		engine: true,
		metacritic: true,
		plot: false,
		boxArt: 20,
		points: 100,
	},
	life: {
		guesses: [],
		remainingGuessCount: 4,
		hearts: Array(4).fill("/images/heart.png"),
	},
	hasPlayed: false,
};

const GameSystem = ({ game, gameHistory, setGameHistory, isArchive = false }) => {
	const [isMounted, setIsMounted] = useState(false);
	
	const [archiveGameState, setArchiveGameState] = useArchiveLocalStorage(
		"ARCHIVED_GAME_STATE", 
		initialGameState, 
		game.date, 
		game.releaseDate
	);
	const [currentGameState, setCurrentGameState] = useLocalStorage(
		"CURRENT_GAME_STATE", 
		initialGameState, 
		game.releaseDate
	);
	
	const [gameState, setGameState] = isArchive
		? [archiveGameState, setArchiveGameState]
		: [currentGameState, setCurrentGameState];
	
	const [playerStatsUpdated, setPlayerStatsUpdated] = useState(false);
	
	// For archive games, pass the game date; for daily, use current date
	const statsDate = isArchive ? new Date(game.date).toISOString().split("T")[0] : undefined;
	const { playerCount, globalAverageScore, globalAverageGuesses, globalWinners, globalHighScore } = usePlayerStats(playerStatsUpdated, statsDate);

	const [isWrongGuess, setIsWrongGuess] = useState(false);
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [isGuessCountUpdated, setIsGuessCountUpdated] = useState(false);
	const [modalScore, setModalScore] = useState(null);

	// For daily games, calculate today's date
	const todaysDate = useMemo(() => {
		if (isArchive) return game.date;
		const today = new Date();
		return today.toISOString().split("T")[0];
	}, [isArchive, game.date]);

	// Check if game has been played
	const matchedScore = gameHistory.scores.find(
		(score) => score.date === todaysDate && score.releaseDate === game.releaseDate
	);

	const [animatedScore, setAnimatedScore] = useState(gameState.hints.points);
	const [animatedBonus, setAnimatedBonus] = useState(gameState.life.remainingGuessCount * 25);

	// Animate score
	useEffect(() => {
		const targetScore = matchedScore ? matchedScore.score : gameState.hints.points;
		const duration = 200;
		const stepTime = 50;
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
	}, [gameState.hints.points, matchedScore]);

	// Animate bonus
	useEffect(() => {
		const targetBonus = gameState.life.remainingGuessCount * 25;
		const duration = 200;
		const stepTime = 50;
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
	}, [gameState.life.remainingGuessCount]);  

	const gameOverRef = useRef(null);

	const triggerGameOver = () => {
		setIsGuessCountUpdated(true);
	};

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
	};

	const trackPlayer = async (finalScore, usedGuesses, hasWon) => {
		const collectionName = getCollectionName();
		const dateToTrack = isArchive ? new Date(game.date).toISOString().split("T")[0] : new Date().toISOString().split("T")[0];
		const docRef = doc(db, collectionName, dateToTrack);
		const docSnap = await getDoc(docRef);
		let winner = hasWon ? 1 : 0;
	  
		if (docSnap.exists()) {
			if (isArchive) {
				// For archive games, only update archive-specific fields
				await updateDoc(docRef, { 
					count: docSnap.data().count + 1,
					archiveCount: (docSnap.data().archiveCount || 0) + 1,
					totalWinners: docSnap.data().totalWinners + winner,
					lastUpdated: serverTimestamp(),
				});
			} else {
				// For daily games, update all fields
				await updateDoc(docRef, { 
					count: docSnap.data().count + 1,
					totalScore: docSnap.data().totalScore + finalScore,
					totalGuesses: docSnap.data().totalGuesses + usedGuesses,
					totalWinners: docSnap.data().totalWinners + winner,
					highScore: finalScore > docSnap.data().highScore ? finalScore : docSnap.data().highScore,
				});
			}
		} else {
			// Create a new document
			if (isArchive) {
				await setDoc(docRef, { 
					count: 1,
					archiveCount: 1,
					totalWinners: winner,
					lastUpdated: serverTimestamp(),
				});
			} else {
				await setDoc(docRef, { 
					count: 1,
					totalScore: finalScore,
					totalGuesses: usedGuesses,
					totalWinners: winner,
					highScore: finalScore,
				});
			}
		}
	  
		const updatedDoc = await getDoc(docRef);
		return updatedDoc.exists() ? updatedDoc.data().count : null;
	};

	// Handle game state initialization for archive games
	useEffect(() => {
		if (isArchive) {
			if (matchedScore) {
				handleGameOver(true);
			} else {
				setGameState({
					...initialGameState,
					releaseDate: game.releaseDate,
					date: game.date,
					hasPlayed: false,
				});
			}
		}
	}, [matchedScore, game, gameState.date, isGameOver, isArchive]);

	// Handle game state initialization for daily games
	useEffect(() => {
		if (!isArchive && todaysDate !== gameState.date && game) {
			setGameState({
				...initialGameState,
				releaseDate: game.releaseDate,
				date: todaysDate,
				hasPlayed: false,
			});
		} else if (!isArchive && isGameOver) {
			setGameState((prevState) => ({
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
	}, [todaysDate, game, gameState.date, isGameOver, isArchive]);

	// Handle release date changes
	useEffect(() => {
		if (game && game.releaseDate !== gameState.releaseDate) {
			const existingGameEntry = gameHistory.scores.find(scoreEntry => scoreEntry.releaseDate === game.releaseDate);
			if (existingGameEntry) {
				setGameState((prevState) => ({
					...prevState,
					hints: {
						...prevState.hints,
						points: existingGameEntry.score
					}
				}));
				handleGameOver(existingGameEntry.score === 0);
			} else {
				setGameState({
					...initialGameState,
					releaseDate: game.releaseDate,
					date: isArchive ? game.date : todaysDate
				});
			}
		}
	}, [game, gameState.releaseDate, gameHistory.scores, isArchive, todaysDate]);	  

	// Update hearts display
	useEffect(() => {
		const updatedHearts = Array.from({ length: 4 }, (_, index) =>
			index < gameState.life.remainingGuessCount
				? "/images/heart.png"
				: "/images/heart-black.png"
		);
		setGameState((prevState) => ({
			...prevState,
			life: {
				...prevState.life,
				hearts: updatedHearts,
			},
		}));
	}, [gameState.life.remainingGuessCount]);

	// Handle game over when lives run out
	useEffect(() => {
		if (isGuessCountUpdated && gameState.life.remainingGuessCount === 0) {
			handleGameOver(true);
		}
		setIsGuessCountUpdated(false);
	}, [isGuessCountUpdated, gameState.life.remainingGuessCount]);

	useEffect(() => {
		setIsMounted(true);
	}, []);

	useEffect(() => {
		setIsModalVisible(isGameOver);
		setModalScore(
			matchedScore
				? matchedScore.score
				: gameState.hints.points + (gameState.life.remainingGuessCount * 25)
		);   
	}, [matchedScore, isGameOver, gameState.hints.points, gameState.life.remainingGuessCount]);

	useEffect(() => {
		gameOverRef.current = triggerGameOver;
	}, []);

	const handleGameOver = async (resetScore) => {
		let score = resetScore ? 0 : gameState.hints.points;
		let finalScore = matchedScore ? matchedScore.score : (score + (gameState.life.remainingGuessCount * 25));
		let usedGuesses = resetScore ? 4 : 4 - gameState.life.remainingGuessCount;

		usedGuesses = usedGuesses === 0 ? 1 : usedGuesses;	

		setModalScore(finalScore);

		const { currentStreak, longestStreak } = calculateStreaks([...gameHistory.scores, {
			releaseDate: game.releaseDate,
			date: todaysDate,
			score: finalScore,
		}]);
	
		setGameState((prevState) => {
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
			const storageKey = isArchive ? "ARCHIVED_GAME_STATE" : "CURRENT_GAME_STATE";
			window.localStorage.setItem(storageKey, JSON.stringify(updatedGameState));
			
			return updatedGameState;
		});

		// Only update game history if this game hasn't been played before
		if (!matchedScore) {
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

			await trackPlayer(finalScore, usedGuesses, !resetScore);
			setPlayerStatsUpdated(prev => !prev);
		}

		if (typeof twq === "function") {
			twq('event', 'tw-ou7tq-ou7tq', {
				value: finalScore,
			});
		}
	
		setModalScore(finalScore);
		setIsModalVisible(true);
	};	

	const onRevealHint = (points) => {
		setGameState((prevState) => ({
			...prevState,
			hints: {
				...prevState.hints,
				points: prevState.hints.points - points,
			},
		}));
	};

	const handleGuess = (guess) => {
		const cleanedGuess = normaliseString(stripBrackets(guess));
		const cleanedGameTitle = normaliseString(stripBrackets(game.title));

		if (cleanedGuess === cleanedGameTitle) {
			handleGameOver(false);
		} else {
			setGameState((prevState) => {
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
			{game && <ReleaseDate date={game.releaseDate} region={game.region} archivedOn={isArchive ? game.date : null} />}
			{!matchedScore && (
				<>
					<div className={`${styles.stats} ${styles.statsMobile}`}>
						<div className={styles.heartsContainer}>
							{gameState.life.hearts.map((heartSrc, index) => (
								<Image
									key={index}
									src={heartSrc}
									alt="Heart"
									width={30}
									height={30}
									className={
										isWrongGuess &&
										index === gameState.life.remainingGuessCount
											? styles.blink
											: ""
									}
								/>
							))}
						</div>
						<p>Bonus: {Math.round(animatedBonus)}</p>
						<p>Score: {Math.round(animatedScore)}</p>
					</div>
				</>
			)}
			<SearchBar onSubmit={handleGuess} isGameOver={isGameOver} />
			{game && gameState && (
				<GameCard
					gameData={game}
					gameState={gameState}
					setGameState={setGameState}
					onRevealHint={(points) => onRevealHint(points)}
					isWrongGuess={isWrongGuess}
					setIsGuessCountUpdated={setIsGuessCountUpdated}
					isGameOver={isGameOver}
				/>
			)}
			<div className={styles.statsContainer}>
				{!matchedScore && (
					<>
						<div>
							<p>Misses: </p>
							{gameState.life.guesses.map((guess, index) => (
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
							<div className={styles.heartsWrapper}>
								<div className={styles.heartsContainer}>
									{gameState.life.hearts.map((heartSrc, index) => (
										<Image
											key={index}
											src={heartSrc}
											alt="Heart"
											width={30}
											height={30}
											className={
												isWrongGuess &&
												index === gameState.life.remainingGuessCount
													? styles.blink
													: ""
											}
										/>
									))}
								</div>
							</div>
							<p>Bonus: {Math.round(animatedBonus)}</p>
							<p>Score: {Math.round(animatedScore)}</p>
						</div>
					</>
				)}
			</div>
			<GameOverModal
				show={isModalVisible}
				gameTitle={game ? game.title : ""}
				score={modalScore}
				gamesPlayed={gameHistory.games}
				highestScore={highestScore}
				averageScore={averageScore}
				gamesWon={gameHistory.wins}
				remainingGuesses={gameState.life.remainingGuessCount}
				releaseDate={game.releaseDate}
				gameWon={matchedScore
					? matchedScore.score > 0
					: gameState.life.remainingGuessCount !== 0
				}
				archivedGame={isArchive}
				globalAverageScore={globalAverageScore}
				globalAverageGuesses={globalAverageGuesses}
				globalWinners={globalWinners}
				playerCount={playerCount}
				onClose={() => setIsModalVisible(false)}
			/>
		</div>
	) : (
		<div className={styles.loader}></div>
	);
};

export default GameSystem;
