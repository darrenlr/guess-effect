import React, { useState, useEffect, useRef } from "react";
import Hint from "./Hint";
import styles from "../styles/GameCard.module.css";
import RevealAllModal from "./RevealAllModal";
import Image from 'next/image';

const GameCard = ({
	gameData,
	gameState,
	setGameState,
	onRevealHint,
	isWrongGuess,
	setIsGuessCountUpdated,
	isGameOver
}) => {
	const [blurAmount, setBlurAmount] = useState(gameState.hints.boxArt);
	const [primaryColors, setPrimaryColors] = useState(["", ""]);
	const [firstClick, setFirstClick] = useState(true);
	const [isModalOpen, setIsModalOpen] = useState(false);

	const imgRef = useRef(null);

	useEffect(() => {
		if (imgRef.current && imgRef.current.complete) {
			extractColors();
		}
	}, [imgRef]);

	useEffect(() => {
		setBlurAmount(gameState.hints.boxArt);
	}, [gameState.hints.boxArt]);

	const extractColors = async () => {
		const { default: ColorThief } = await import("colorthief");
		const colorThief = new ColorThief();
		const colors = colorThief.getPalette(imgRef.current, 2);

		const formattedColors = colors.map(
			(color) => `rgb(${color[0]}, ${color[1]}, ${color[2]})`
		);
		setPrimaryColors(formattedColors);
	};

	const reduceBlur = () => {
		const scanContainer = document.querySelector(`.${styles.scanContainer}`);
		const scanElement = scanContainer.querySelector(`.${styles.scanEffect}`);
	
		let newBlurAmount;
		let hintPenalty;
	
		if (firstClick) {
			newBlurAmount = Math.max(0, blurAmount - 20);
			hintPenalty = 5;
			setFirstClick(false);
		} else {
			newBlurAmount = Math.max(0, blurAmount - 7);
			hintPenalty = 10;
		}
	
		setBlurAmount(newBlurAmount);
		onRevealHint(hintPenalty);
	
		setGameState((prevState) => {
			const updatedHints = { ...prevState.hints, boxArt: newBlurAmount };
			return { ...prevState, hints: updatedHints };
		});
	
		if (!scanElement) {
			const newScanElement = document.createElement('div');
			newScanElement.className = styles.scanEffect;
			scanContainer.appendChild(newScanElement);
			newScanElement.addEventListener("animationend", () => {
				scanContainer.removeChild(newScanElement);
			});
		}
	};	
	  
	const handleRevealHint = (hint, points) => {
		if (hint !== null) {
			onRevealHint(points);
		  }

		setGameState((prevState) => {
			const updatedHints = { ...prevState.hints, [hint]: true };
			return { ...prevState, hints: updatedHints };
		});
	};

	const handleRevealAll = () => {
		setIsModalOpen(false);
	
		setGameState(prevState => {
			let updatedHints = {};
			for (let key in prevState.hints) {
				updatedHints[key] = key === "boxArt" ? 13 : true;
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
		setGameState(prevState => ({
			...prevState,
			life: {
				...prevState.life,
				remainingGuessCount: 0
			}
		}));

		setIsGuessCountUpdated(true);
	};



	return (
		<>
			<div
				className={`${styles.gameCard} ${isWrongGuess ? styles.flash : ""}`}
				style={{
					background: `linear-gradient(to bottom, ${primaryColors[0]}, ${primaryColors[1]})`,
				}}
			>
				<div className={styles.boxArt}>
					<div className={styles.boxArtWrapper}>
						<div className={styles.scanContainer}>
    						<Image
								src={`https://${gameData.boxArtUrl}`}
								crossOrigin="anonymous"
								alt="Game Box Art"
        						width={300}
        						height={360}
								priority
								style={{ filter: `blur(${blurAmount}px)`, transition: 'filter 2s ease', pointerEvents: 'none' }}
        						onLoadingComplete={extractColors}
        						ref={imgRef}
							// 	placeholder="blur"
							// 	blurDataURL="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zY2h3YXJlPSJodHRwOi8vc3YyMDAyLnhtbCIgYWJsaWVuY2U9Im1pY3JvZm9yaW5ndCImZmlsbD0iIzAwMDAwMDAiIHZpZXdCb3g9IjAgMCAxMDAgMTAwIiBzdHJva2U9IiMwMDAwMDAiPjxwYXRoIGQ9Ik0wLDEwMHEtMTEtMTUtMTAtMTgtMTAtMTgtMTcgYWxzbyBwb3NpdGl2ZXMgbm9zdCBhbmltYXRlcyBhbmQgc2luZ2xlYXIgdGV4dC1kZWFsZXMuIiBzdHJva2U9IiMwMDAwMDAiIHZpZXdCb3g9IjAgMCAxMDAgMTAwIiA+PC9zdHJva2U+PC9wYXRoPjwvc3ZnPjw="
						 	/>
						</div>
					</div>
					<button
						className={`hintButton ${blurAmount <= 13 ? styles.hidden : ""}`}
						onClick={blurAmount > 13 ? reduceBlur : null}
					>
						{blurAmount > 19 && firstClick ? "Clear Heavy Smog (-5)" : (blurAmount > 13 ? "Clear Smog (-10)" : "")}
					</button>
				</div>
				<div className={styles.gameInfo}>
					<Hint
						hint="publishers"
						data={gameData.hints.publisher}
						onRevealHint={() => handleRevealHint("publisher", 20)}
						points={20}
						isRevealed={gameState.hints.publisher}
					/>
					<Hint
						hint="developers"
						data={gameData.hints.developer}
						onRevealHint={() => handleRevealHint("developer", 20)}
						points={20}
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
							hint="modes(s)"
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
					{!isGameOver && (
        				<button className={`hintButton revealAll ${styles.revealAllButton}`} onClick={areAllHintsRevealed() ? handleGiveUp : () => setIsModalOpen(true)}>
            				{areAllHintsRevealed() ? "Give Up" : `Reveal All? (-${gameState.hints.points})`}
        				</button>
   					)}
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
