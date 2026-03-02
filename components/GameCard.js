import React, { useState, useEffect, useRef } from "react";
import Hint from "./Hint";
import styles from "../styles/GameCard.module.css";
import RevealAllModal from "./RevealAllModal";
import Image from 'next/image';
import BoxArtCanvas from "./BoxArtCanvas";

const GameCard = ({
	gameData,
	gameState,
	setGameState,
	onRevealHint,
	isWrongGuess,
	setIsGuessCountUpdated,
	isGameOver,
	onGiveUp,
	isEndlessMode = false,
	gameWon = false
}) => {
	const [pixelationLevel, setPixelationLevel] = useState(gameState.hints.boxArt);
	const [primaryColors, setPrimaryColors] = useState(["", ""]);
	const [firstClick, setFirstClick] = useState(true);
	const [isModalOpen, setIsModalOpen] = useState(false);

	const imgRef = useRef(null);

	useEffect(() => {
		if (imgRef.current && imgRef.current.complete) {
			extractColors();
		}
	}, [imgRef]);

	const extractColors = async () => {
		const { default: ColorThief } = await import("colorthief");
		const colorThief = new ColorThief();
		const colors = colorThief.getPalette(imgRef.current, 2);

		const formattedColors = colors.map(
			(color) => `rgb(${color[0]}, ${color[1]}, ${color[2]})`
		);
		setPrimaryColors(formattedColors);
	};

	const reducePixelation = () => {
		const scanContainer = document.querySelector(`.${styles.scanContainer}`);
		const scanElement = scanContainer?.querySelector(`.${styles.scanEffect}`);

		let hintPenalty;
		let reductionAmount;

		if (firstClick) {
			hintPenalty = 10;
			reductionAmount = 6;
			setFirstClick(false);
		} else {
			reductionAmount = 4;
			hintPenalty = 20;
		}

		onRevealHint(hintPenalty);

		if (scanContainer && !scanElement) {
			const newScanElement = document.createElement("div");
			newScanElement.className = styles.scanEffect;
			scanContainer.appendChild(newScanElement);

			newScanElement.addEventListener("animationend", () => {
				scanContainer.removeChild(newScanElement);
			});
		}

		const initialPixelation = pixelationLevel;
		const duration = 1000;
		const stepTime = 20;

		const steps = duration / stepTime;
		const reductionPerStep = reductionAmount / steps;
		let currentStep = 0;

		const interval = setInterval(() => {
			setPixelationLevel((prev) => {
				const newLevel = Math.max(1, prev - reductionPerStep);
				return newLevel;
			});

			currentStep++;
			if (currentStep >= steps) {
				clearInterval(interval);

				setGameState((prevState) => {
					const updatedHints = { ...prevState.hints, boxArt: Math.max(1, initialPixelation - reductionAmount) };
					return { ...prevState, hints: updatedHints };
				});

				setPixelationLevel(Math.max(1, initialPixelation - reductionAmount));
			}
		}, stepTime);
	};

	const handleRevealHint = (hint, points) => {
		if (hint !== null) {
			onRevealHint(points);
		}

		setTimeout(() => {
			setGameState((prevState) => {
				const updatedHints = { ...prevState.hints, [hint]: true };
				return { ...prevState, hints: updatedHints };
			});
		}, 650);
	};

	const handleRevealAll = () => {
		setIsModalOpen(false);

		setGameState(prevState => {
			let updatedHints = {};
			for (let key in prevState.hints) {
				updatedHints[key] = key === "boxArt" ? 10 : true;
			}
			updatedHints.points = 0;
			return { ...prevState, hints: updatedHints };
		});
	};

	const areAllHintsRevealed = () => {
		for (let key in gameState.hints) {
			if (key !== "points" && key !== "boxArt" && !gameState.hints[key]) {
				return false;
			}
		}
		return true;
	};

	const handleGiveUp = () => {
		// If onGiveUp handler is provided (endless mode), use it directly
		if (onGiveUp) {
			onGiveUp();
		} else {
			// Default behavior for daily mode
			setGameState(prevState => ({
				...prevState,
				life: {
					...prevState.life,
					remainingGuessCount: 0
				}
			}));

			setIsGuessCountUpdated(true);
		}
	};


	return (
		<>
			<div className={styles.gameCardWrapper}>
				<div
					className={`${styles.gameCard} ${isWrongGuess ? styles.flash : ""}`}
					style={{
						background: `linear-gradient(to bottom, ${primaryColors[0]}, ${primaryColors[1]})`,
					}}
				>
				<div className={styles.boxArt}>
					<div className={styles.scanContainer}>
						<div className={styles.boxArtWrapper}>
							<BoxArtCanvas
								src={`https://${gameData.boxArtUrl}`}
								showCleanImage={isEndlessMode ? gameWon : isGameOver}
								pixelSize={gameState.hints.boxArt}
								width={264}
								height={352}
								onColorsExtracted={setPrimaryColors}
							/>
						</div>
					</div>

					<button
						style={{ marginTop: "5px" }}
						className={`hintButton ${gameState.hints.boxArt <= 11 ? styles.hidden : ""}`}
						onClick={reducePixelation}
					>
						{gameState.hints.boxArt > 14 && firstClick ? (
							<>
								[CLEAR_HEAVY_SMOG.exe] (-10)
							</>
						) : gameState.hints.boxArt > 11 ? (
							<>
								[CLEAR_SMOG.exe] (-20)
							</>
						) : null}
					</button>
				</div>
				<div className={styles.gameInfo}>
					<Hint
						hint="publishers"
						data={gameData.hints.publisher}
						onRevealHint={() => handleRevealHint("publisher", 10)}
						points={10}
						isRevealed={gameState.hints.publisher}
					/>
					<Hint
						hint="developers"
						data={gameData.hints.developer}
						onRevealHint={() => handleRevealHint("developer", 10)}
						points={10}
						isRevealed={gameState.hints.developer}
					/>
					<div className={styles.hintRow}>
						<Hint
							hint="genres"
							data={gameData.hints.genre}
							onRevealHint={() => handleRevealHint("genre", 5)}
							points={5}
							isRevealed={gameState.hints.genre}
						/>
						<Hint
							hint="platforms"
							data={gameData.hints.platforms}
							onRevealHint={() => handleRevealHint("platforms", 5)}
							points={5}
							isRevealed={gameState.hints.platforms}
						/>
					</div>
					<div className={styles.hintRow}>
						<Hint
							hint="modes"
							data={gameData.hints.modes}
							onRevealHint={onRevealHint}
							points={0}
							isRevealed={gameState.hints.modes}
						/>
						<Hint
							hint="engine"
							data={gameData.hints.engine}
							onRevealHint={onRevealHint}
							points={0}
							isRevealed={gameState.hints.engine}
						/>
					</div>
					<Hint
						hint="metacritic"
						data={gameData.hints.metacritic}
						onRevealHint={onRevealHint}
						points={0}
						isRevealed={gameState.hints.metacritic}
					/>
					<Hint
						hint="plot"
						data={gameData.hints.plot}
						onRevealHint={() => handleRevealHint("plot", 40)}
						points={40}
						isRevealed={gameState.hints.plot}
					/>
					{!isGameOver && (!isEndlessMode || !areAllHintsRevealed()) && (
						<button className={`hintButton revealAll ${styles.revealAllButton}`} onClick={areAllHintsRevealed() ? handleGiveUp : () => setIsModalOpen(true)}>
							{areAllHintsRevealed() ? "[ABORT]" : `[REVEAL_ALL.exe] (-${gameState.hints.points})`}
						</button>
					)}
				</div>

			</div>
			</div>
			<RevealAllModal
				isOpen={isModalOpen}
				onCancel={() => setIsModalOpen(false)}
				onConfirm={handleRevealAll}
			/>
		</>
	);
};

export default GameCard;
