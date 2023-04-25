import React, { useState, useEffect } from "react";
import Hint from "./Hint";
import Image from "next/image";
import styles from "../styles/GameCard.module.css";

const GameCard = ({ gameData, gameState, onRevealHint, isWrongGuess }) => {
	const [blurAmount, setBlurAmount] = useState(20);

	const reduceBlur = () => {
		setBlurAmount((prevBlurAmount) => Math.max(0, prevBlurAmount - 5));
		onRevealHint(5);
	};

	const saveGameStateToLocalStorage = (newGameState) => {
		const storedGameState =
			JSON.parse(localStorage.getItem("CURRENT_GAME_STATE")) || {};

		storedGameState.hints = newGameState;
		localStorage.setItem("CURRENT_GAME_STATE", JSON.stringify(storedGameState));
	};

	const handleRevealHint = (hint, points) => {
		onRevealHint(points);

		const updatedState = { ...gameState.hints, [hint]: true };
		saveGameStateToLocalStorage(updatedState);
	};

	return (
		<>
			<div className={`${styles.gameCard} ${isWrongGuess ? styles.flash : ""}`}>
				<div className={styles.boxArt}>
					<div className={styles.boxArtWrapper}>
						<Image
							src={gameData.boxArtUrl}
							alt="Box Art"
							width={300}
							height={360}
							style={{ filter: `blur(${blurAmount}px)` }}
						/>
					</div>

					<button
						className={styles.blurButton}
						onClick={reduceBlur}
						disabled={blurAmount <= 0}
					>
						Reveal (-5)
					</button>
				</div>
				<div className={styles.gameInfo}>
					<Hint
						hint="publisher"
						data={gameData.hints.publisher}
						onRevealHint={onRevealHint}
						points={0}
						isRevealed={gameState.hints.publisher}
					/>
					<Hint
						hint="developer"
						data={gameData.hints.developer}
						onRevealHint={() => handleRevealHint("developer", 25)}
						points={25}
						isRevealed={gameState.hints.developer}
					/>
					<div className={styles.hintRow}>
						<Hint
							hint="genre"
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
					<Hint
						hint="metacritic"
						data={gameData.hints.metacritic}
						onRevealHint={() => handleRevealHint("metacritic", 10)}
						points={10}
						isRevealed={gameState.hints.metacritic}
					/>
					<Hint
						hint="plot"
						data={gameData.hints.plot}
						onRevealHint={() => handleRevealHint("plot", 40)}
						points={40}
						isRevealed={gameState.hints.plot}
					/>
				</div>
			</div>
		</>
	);
};

export default GameCard;
