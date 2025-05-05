// import React, { useState, useEffect, useMemo, useRef } from "react";
// import Image from "next/image";
// import ReleaseDate from "./ReleaseDate";
// import SearchBar from "./SearchBar";
// import GameCard from "./GameCard";
// import GameOverModal from "./GameOverModal";
// import useArchiveLocalStorage from "../hooks/useArchiveLocalStorage";
// import { stripBrackets } from "../utils/stringUtils";
// import styles from "../styles/ScoreSystem.module.css";

// const initialGameState = {
// 	date: null,
// 	releaseDate: "",
// 	hints: {
// 		publisher: false,
// 		developer: false,
// 		genre: false,
// 		platforms: false,
// 		modes: true,
// 		engine: true,
// 		metacritic: true,
// 		plot: false,
// 		boxArt: 40,
// 		points: 100,
// 	},
// 	life: {
// 		guesses: [],
// 		remainingGuessCount: 4,
// 		hearts: Array(4).fill("/images/heart.png"),
// 	},
// 	hasPlayed: false,
// };

// const ArchiveScoreSystem = ({ game, gameHistory, setGameHistory }) => {

// 	const [isMounted, setIsMounted] = useState(false);
// 	const [highestScore, setHighestScore] = useState(null);
// 	const [averageScore, setAverageScore] = useState(null);
// 	const [isModalVisible, setIsModalVisible] = useState(false);
// 	const [isGuessCountUpdated, setIsGuessCountUpdated] = useState(false);
// 	const [modalScore, setModalScore] = useState(null);

// 	const [archivedGameState, setArchivedGameState] = useArchiveLocalStorage(
// 		"ARCHIVED_GAME_STATE",
// 		initialGameState,
// 		game.date,
//         game.releaseDate
// 	);

// 	useEffect(() => {
// 			const matchedScore = gameHistory.scores.find(
// 				(score) => score.date === game.date && score.releaseDate === game.releaseDate
// 			);

// 			if (matchedScore) {
// 				setArchivedGameState((prevState) => ({
// 					...prevState,
// 					hints: {
// 						publisher: true,
// 						developer: true,
// 						genre: true,
// 						platforms: true,
// 						modes: true,
// 						engine: true,
// 						metacritic: true,
// 						plot: true,
// 						boxArt: 0,
// 						points: matchedScore.score,
// 					},
// 					life: {
// 						guesses: [],
// 						remainingGuessCount: 4,
// 						hearts: Array(4).fill("/images/heart.png"),
// 					},
// 					hasPlayed: true,
// 					score: matchedScore.score,
// 				}));
// 				setModalScore(matchedScore.score);
// 				setIsModalVisible(true);
// 			} else {
// 				// If no matching score is found, keep hints as they are in initialGameState
// 				setArchivedGameState((prevState) => ({
// 					...prevState,
// 					hints: initialGameState.hints,
// 					hasPlayed: false,
// 				}));
// 			}
		
// 	}, [game.date, game.releaseDate, gameHistory, setArchivedGameState]);

// 	const isGameOver = gameHistory.scores.some(scoreEntry => scoreEntry.date === game.date);

// 	const [animatedScore, setAnimatedScore] = useState(
// 		archivedGameState.hints.points
// 	);
// 	const [animatedBonus, setAnimatedBonus] = useState(
// 		archivedGameState.life.remainingGuessCount * 25
// 	);

// 	const [streaks, setStreaks] = useState({ currentStreak: 0, longestStreak: 0 });

// 	useEffect(() => {
//     if (gameHistory && gameHistory.scores.length > 0) {
//         const scores = gameHistory.scores;

//         const high = scores.reduce((highScore, game) =>
//             game.score > highScore ? game.score : highScore, 0);
//         setHighestScore(high);

//         const total = scores.reduce((sum, game) => sum + game.score, 0);
//         setAverageScore(Math.round(total / scores.length));

//         let currentStreak = 0;
//         let longestStreak = 0;
//         let tempStreak = 0;

//         for (let score of scores) {
//             if (score.score > 0) {
//                 tempStreak++;
//                 currentStreak++;
//             } else {
//                 tempStreak = 0;
//                 currentStreak = 0;
//             }
//             longestStreak = Math.max(longestStreak, tempStreak);
//         }

//         setStreaks({ currentStreak, longestStreak });
//     } else {
//         setHighestScore(0);
//         setAverageScore(0);
//         setStreaks({ currentStreak: 0, longestStreak: 0 });
//     }
// }	, [gameHistory]);

// 	useEffect(() => {
// 			const targetScore = archivedGameState.hints.points;
// 			const duration = 200;
// 			const stepTime = 50;
// 			const scoreDifference = targetScore - animatedScore;
// 			const steps = duration / stepTime;
// 			const stepSize = scoreDifference / steps;
		
// 			const intervalId = setInterval(() => {
// 			  setAnimatedScore((prevScore) => {
// 				const nextScore = prevScore + stepSize;
// 				if ((stepSize > 0 && nextScore >= targetScore) || (stepSize < 0 && nextScore <= targetScore)) {
// 				  clearInterval(intervalId);
// 				  return targetScore;
// 				}
// 				return nextScore;
// 			  });
// 			}, stepTime);
		
// 			return () => clearInterval(intervalId);
// 		  }, [archivedGameState.hints.points]);
	
// 		useEffect(() => {
// 			const targetBonus = archivedGameState.life.remainingGuessCount * 25;
// 			const duration = 200;
// 			const stepTime = 50;
// 			const bonusDifference = targetBonus - animatedBonus;
// 			const steps = duration / stepTime;
// 			const stepSize = bonusDifference / steps;
		
// 			const intervalId = setInterval(() => {
// 			  setAnimatedBonus((prevBonus) => {
// 				const nextBonus = prevBonus + stepSize;
// 				if ((stepSize > 0 && nextBonus >= targetBonus) || (stepSize < 0 && nextBonus <= targetBonus)) {
// 				  clearInterval(intervalId);
// 				  return targetBonus;
// 				}
// 				return nextBonus;
// 			  });
// 			}, stepTime);
		
// 			return () => clearInterval(intervalId);
// 		}, [archivedGameState.life.remainingGuessCount]);

// 	const [isWrongGuess, setIsWrongGuess] = useState(false);

// 	useEffect(() => {
// 		const targetScore = archivedGameState.hints.points;
// 		const duration = 200;
// 		const stepTime = 50;
// 		const scoreDifference = targetScore - animatedScore;
// 		const steps = duration / stepTime;
// 		const stepSize = scoreDifference / steps;

// 		const intervalId = setInterval(() => {
// 			setAnimatedScore((prevScore) => {
// 				const nextScore = prevScore + stepSize;
// 				if (
// 					(stepSize > 0 && nextScore >= targetScore) ||
// 					(stepSize < 0 && nextScore <= targetScore)
// 				) {
// 					clearInterval(intervalId);
// 					return targetScore;
// 				}
// 				return nextScore;
// 			});
// 		}, stepTime);

// 		return () => clearInterval(intervalId);
// 	}, [archivedGameState.hints.points]);

// 	useEffect(() => {
// 		const targetBonus = archivedGameState.life.remainingGuessCount * 25;
// 		const duration = 200;
// 		const stepTime = 50;
// 		const bonusDifference = targetBonus - animatedBonus;
// 		const steps = duration / stepTime;
// 		const stepSize = bonusDifference / steps;

// 		const intervalId = setInterval(() => {
// 			setAnimatedBonus((prevBonus) => {
// 				const nextBonus = prevBonus + stepSize;
// 				if (
// 					(stepSize > 0 && nextBonus >= targetBonus) ||
// 					(stepSize < 0 && nextBonus <= targetBonus)
// 				) {
// 					clearInterval(intervalId);
// 					return targetBonus;
// 				}
// 				return nextBonus;
// 			});
// 		}, stepTime);

// 		return () => clearInterval(intervalId);
// 	}, [archivedGameState.life.remainingGuessCount]);

// 	const handleGameOver = (resetScore) => {
// 		let score = resetScore ? 0 : archivedGameState.hints.points;
// 		let finalScore = score + (archivedGameState.life.remainingGuessCount * 25);
// 		let usedGuesses = resetScore ? 4 : 4 - archivedGameState.life.remainingGuessCount;

// 		usedGuesses = usedGuesses === 0 ? 1 : usedGuesses;	

// 		setModalScore(finalScore);

// 		setArchivedGameState((prevState) => {
// 			const updatedGameState = {
// 			  ...prevState,
// 			  hints: {
// 				publisher: true,
// 				developer: true,
// 				genre: true,
// 				platforms: true,
// 				modes: true,
// 				engine: true,
// 				metacritic: true,
// 				plot: true,
// 				boxArt: 0,
// 				points: score,
// 			  },
// 			  hasPlayed: true,
// 			};
			
// 			// Save immediately to localStorage
// 			window.localStorage.setItem("ARCHIVED_GAME_STATE", JSON.stringify(updatedGameState));
			
// 			return updatedGameState;
// 		});

// 	useEffect(() => {
// 			const targetScore = archivedGameState.hints.points;
// 			const duration = 200;
// 			const stepTime = 50;
// 			const scoreDifference = targetScore - animatedScore;
// 			const steps = duration / stepTime;
// 			const stepSize = scoreDifference / steps;
		
// 			const intervalId = setInterval(() => {
// 			  setAnimatedScore((prevScore) => {
// 				const nextScore = prevScore + stepSize;
// 				if ((stepSize > 0 && nextScore >= targetScore) || (stepSize < 0 && nextScore <= targetScore)) {
// 				  clearInterval(intervalId);
// 				  return targetScore;
// 				}
// 				return nextScore;
// 			  });
// 			}, stepTime);
		
// 			return () => clearInterval(intervalId);
// 		  }, [archivedGameState.hints.points]);
	
// 		useEffect(() => {
// 			const targetBonus = archivedGameState.life.remainingGuessCount * 25;
// 			const duration = 200;
// 			const stepTime = 50;
// 			const bonusDifference = targetBonus - animatedBonus;
// 			const steps = duration / stepTime;
// 			const stepSize = bonusDifference / steps;
		
// 			const intervalId = setInterval(() => {
// 			  setAnimatedBonus((prevBonus) => {
// 				const nextBonus = prevBonus + stepSize;
// 				if ((stepSize > 0 && nextBonus >= targetBonus) || (stepSize < 0 && nextBonus <= targetBonus)) {
// 				  clearInterval(intervalId);
// 				  return targetBonus;
// 				}
// 				return nextBonus;
// 			  });
// 			}, stepTime);
		
// 			return () => clearInterval(intervalId);
// 		}, [archivedGameState.life.remainingGuessCount]);  
	
// 		const gameOverRef = useRef(null);
	
// 		const triggerGameOver = () => {
// 			setIsGuessCountUpdated(true);
// 		};
// 	};

// 	// Handle revealing a hint
// 	const onRevealHint = (points) => {
// 		setArchivedGameState((prevState) => ({
// 			...prevState,
// 			hints: {
// 				...prevState.hints,
// 				points: prevState.hints.points - points,
// 			},
// 		}));
// 	};

// 	// Handle guesses
// 	const handleGuess = (guess) => {
// 		const cleanedGuess = stripBrackets(guess).toLowerCase();
// 		const cleanedGameTitle = stripBrackets(game.title).toLowerCase();

// 		if (cleanedGuess === cleanedGameTitle) {
// 			handleGameOver(false);
// 		} else {
// 			setArchivedGameState((prevState) => {
// 				let updatedGuesses = [...prevState.life.guesses, guess];
// 				let updatedRemainingGuessCount =
// 					prevState.life.remainingGuessCount - 1;

// 				return {
// 					...prevState,
// 					life: {
// 						...prevState.life,
// 						guesses: updatedGuesses,
// 						remainingGuessCount: updatedRemainingGuessCount,
// 					},
// 				};
// 			});

// 			setIsWrongGuess(true);
// 			setTimeout(() => {
// 				setIsWrongGuess(false);
// 			}, 500);
// 		}
// 	};

// 	// useEffect(() => {
// 	// 		setIsModalVisible(isGameOver);
// 	// 		setModalScore(archivedGameState.hints.points + (archivedGameState.life.remainingGuessCount * 25));
// 	// 	}, [isGameOver]);

// 	return (
// 		<div className={styles.container}>
// 			{game && <ReleaseDate date={game.releaseDate} region={game.region} />}

// 			<div className={`${styles.stats} ${styles.statsMobile}`}>
// 				<div className={styles.heartsContainer}>
// 					{archivedGameState.life.hearts.map((heartSrc, index) => (
// 						<Image
// 							key={index}
// 							src={heartSrc}
// 							alt="Heart"
// 							width={30}
// 							height={30}
// 							className={
// 								isWrongGuess &&
// 								index ===
// 									archivedGameState.life.remainingGuessCount
// 									? styles.blink
// 									: ""
// 							}
// 						/>
// 					))}
// 				</div>
// 				<p>Bonus: {Math.round(animatedBonus)}</p>
// 				<p>Score: {Math.round(animatedScore)}</p>
// 			</div>

// 			<SearchBar onSubmit={handleGuess} isGameOver={isGameOver} />

// 			{game && archivedGameState && (
// 				<GameCard
// 					gameData={game}
// 					gameState={archivedGameState}
// 					setGameState={setArchivedGameState}
// 					onRevealHint={onRevealHint}
// 					isWrongGuess={isWrongGuess}
// 					setIsGuessCountUpdated={setIsGuessCountUpdated}
// 					isGameOver={isGameOver}
// 				/>
// 			)}
// 			<div className={styles.statsContainer}>
// 				{!archivedGameState?.hasPlayed && (
// 					<>
// 					<div>
// 					<p>Misses: </p>
// 				</div>
// 				<div className={styles.stats}>
// 					<div className={styles.heartsWrapper}>
// 						<div className={styles.heartsContainer}>
// 							{archivedGameState.life.hearts.map((heartSrc, index) => (
// 								<Image
// 									key={index}
// 									src={heartSrc}
// 									alt="Heart"
// 									width={30}
// 									height={30}
// 									className={
// 										isWrongGuess &&
// 										index === archivedGameState.life.remainingGuessCount
// 											? styles.blink
// 											: ""
// 									}
// 								/>
// 							))}
// 						</div>
// 						{/* <p
// 							style={{
// 								fontSize: "0.8rem",
// 							}}
// 						>
// 							(x25)
// 						</p> */}
// 					</div>
// 					<p>Score: {Math.round(animatedScore)}</p>
// 					<p>Bonus: {Math.round(animatedBonus)}</p>
// 				</div>
// 				</>
// 				)}
// 			</div>

// 			<GameOverModal
// 				show={isModalVisible}
// 				gameTitle={game ? game.title : ""}
// 				score={modalScore}
// 				gamesPlayed={gameHistory.games?.games ?? 0}
// 				highestScore={highestScore}
//   				averageScore={averageScore}
// 				gamesWon={gameHistory.wins?.wins ?? 0}
// 				remainingGuesses={archivedGameState.life.remainingGuessCount}
// 				releaseDate={game.releaseDate}
// 				playerCount={5}
// 				gameWon={
// 					archivedGameState.hasOwnProperty('score')
// 					? archivedGameState.score > 0
// 					: archivedGameState.life.remainingGuessCount !== 0
// 				}
// 				archivedGame={true}
// 				onClose={() => setIsModalVisible(false)}
// 			/>
// 		</div>
// 	);
// };

// export default ArchiveScoreSystem;