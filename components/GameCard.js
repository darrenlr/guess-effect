import React, { useState } from "react";
import Hint from "./Hint";
import Image from "next/image";
import SearchBar from "./SearchBar";
import styles from "../styles/GameCard.module.css";

const GameCard = ({ gameData, onRevealHint }) => {
	const [blurAmount, setBlurAmount] = useState(20);
	const [isFlashing, setIsFlashing] = useState(false);

	const reduceBlur = () => {
		setBlurAmount((prevBlurAmount) => Math.max(0, prevBlurAmount - 5));
		onRevealHint(5);

		setIsFlashing(true);
		setTimeout(() => {
			setIsFlashing(false);
		}, 500);
	};

	const handleSearch = (searchText) => {
		// Perform search and update the game data based on the searchText
	};

	return (
		<>
			<SearchBar onSearch={handleSearch} />
			<div className={`${styles.gameCard} ${isFlashing ? styles.flash : ""}`}>
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
						points={15}
					/>
					<Hint
						hint="developer"
						data={gameData.hints.developer}
						onRevealHint={onRevealHint}
						points={25}
					/>
					<div className={styles.hintRow}>
						<Hint
							hint="genre"
							data={gameData.hints.genre}
							onRevealHint={onRevealHint}
							points={5}
						/>
						<Hint
							hint="platforms"
							data={gameData.hints.platforms}
							onRevealHint={onRevealHint}
							points={5}
						/>
					</div>
					<Hint
						hint="metacritic"
						data={gameData.hints.metacritic}
						onRevealHint={onRevealHint}
						points={10}
					/>
					<Hint
						hint="plot"
						data={gameData.hints.plot}
						onRevealHint={onRevealHint}
						points={40}
					/>
				</div>
			</div>
		</>
	);
};

export default GameCard;
