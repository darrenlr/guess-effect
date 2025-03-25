import React, { useState, useEffect } from "react";
import Image from "next/image";
import ReleaseDate from "./ReleaseDate";
import SearchBar from "./SearchBar";
import GameCard from "./GameCard";
import GameOverModal from "./GameOverModal";
import useArchiveLocalStorage from "../hooks/useArchiveLocalStorage";
import { stripBrackets } from "../utils/stringUtils";
import styles from "../styles/ScoreSystem.module.css";

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
		boxArt: 40,
		points: 100,
	},
	life: {
		guesses: [],
		remainingGuessCount: 4,
		hearts: Array(4).fill("/images/heart.png"),
	},
	hasPlayed: false,
};

const ArchiveScoreSystem = ({ game }) => {
    console.log(game);
	const [archivedGameState, setArchivedGameState] = useArchiveLocalStorage(
		"ARCHIVED_GAME_STATE",
		initialGameState,
		game.date,
        game.releaseDate
	);

	const [isModalVisible, setIsModalVisible] = useState(false);
	const [animatedScore, setAnimatedScore] = useState(
		archivedGameState.hints.points
	);
	const [animatedBonus, setAnimatedBonus] = useState(
		archivedGameState.life.remainingGuessCount * 25
	);
	const [isWrongGuess, setIsWrongGuess] = useState(false);

	useEffect(() => {
		const targetScore = archivedGameState.hints.points;
		const duration = 200;
		const stepTime = 50;
		const scoreDifference = targetScore - animatedScore;
		const steps = duration / stepTime;
		const stepSize = scoreDifference / steps;

		const intervalId = setInterval(() => {
			setAnimatedScore((prevScore) => {
				const nextScore = prevScore + stepSize;
				if (
					(stepSize > 0 && nextScore >= targetScore) ||
					(stepSize < 0 && nextScore <= targetScore)
				) {
					clearInterval(intervalId);
					return targetScore;
				}
				return nextScore;
			});
		}, stepTime);

		return () => clearInterval(intervalId);
	}, [archivedGameState.hints.points]);

	useEffect(() => {
		const targetBonus = archivedGameState.life.remainingGuessCount * 25;
		const duration = 200;
		const stepTime = 50;
		const bonusDifference = targetBonus - animatedBonus;
		const steps = duration / stepTime;
		const stepSize = bonusDifference / steps;

		const intervalId = setInterval(() => {
			setAnimatedBonus((prevBonus) => {
				const nextBonus = prevBonus + stepSize;
				if (
					(stepSize > 0 && nextBonus >= targetBonus) ||
					(stepSize < 0 && nextBonus <= targetBonus)
				) {
					clearInterval(intervalId);
					return targetBonus;
				}
				return nextBonus;
			});
		}, stepTime);

		return () => clearInterval(intervalId);
	}, [archivedGameState.life.remainingGuessCount]);

	const handleGameOver = (resetScore) => {
		let score = resetScore ? 0 : archivedGameState.hints.points;
		let finalScore = score + archivedGameState.life.remainingGuessCount * 25;

		setArchivedGameState((prevState) => ({
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
		}));

		// Show modal
		setIsModalVisible(true);
	};

	// Handle revealing a hint
	const onRevealHint = (points) => {
		setArchivedGameState((prevState) => ({
			...prevState,
			hints: {
				...prevState.hints,
				points: prevState.hints.points - points,
			},
		}));
	};

	// Handle guesses
	const handleGuess = (guess) => {
		const cleanedGuess = stripBrackets(guess).toLowerCase();
		const cleanedGameTitle = stripBrackets(game.title).toLowerCase();

		if (cleanedGuess === cleanedGameTitle) {
			handleGameOver(false);
		} else {
			setArchivedGameState((prevState) => {
				let updatedGuesses = [...prevState.life.guesses, guess];
				let updatedRemainingGuessCount =
					prevState.life.remainingGuessCount - 1;

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
				setIsWrongGuess(false);
			}, 500);
		}
	};

	return (
		<div className={styles.container}>
			{game && <ReleaseDate date={game.releaseDate} region={game.region} />}

			<div className={`${styles.stats} ${styles.statsMobile}`}>
				<div className={styles.heartsContainer}>
					{archivedGameState.life.hearts.map((heartSrc, index) => (
						<Image
							key={index}
							src={heartSrc}
							alt="Heart"
							width={30}
							height={30}
							className={
								isWrongGuess &&
								index ===
									archivedGameState.life.remainingGuessCount
									? styles.blink
									: ""
							}
						/>
					))}
				</div>
				<p>Bonus: {Math.round(animatedBonus)}</p>
				<p>Score: {Math.round(animatedScore)}</p>
			</div>

			<SearchBar onSubmit={handleGuess} />

			{game && archivedGameState && (
				<GameCard
					gameData={game}
					gameState={archivedGameState}
					setGameState={setArchivedGameState}
					onRevealHint={onRevealHint}
					isWrongGuess={isWrongGuess}
				/>
			)}

			<GameOverModal
				show={isModalVisible}
				gameTitle={game ? game.title : ""}
				score={animatedScore + animatedBonus}
				gameWon={archivedGameState.life.remainingGuessCount !== 0}
				onClose={() => setIsModalVisible(false)}
			/>
		</div>
	);
};

export default ArchiveScoreSystem;