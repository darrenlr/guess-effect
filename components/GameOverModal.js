import React, { useEffect } from "react";
import usePlayerStats from "../hooks/usePlayerStats";
import styles from "../styles/GameOverModal.module.css";
import confetti from "canvas-confetti";

const GameOverModal = ({ show, gameTitle, score, gamesPlayed, highestScore, averageScore, gamesWon, globalAverageScore, globalAverageGuesses, globalWinners, playerCount, gameWon, onClose }) => {
	useEffect(() => {
		if (show && gameWon) {
			const confettiAnimation = confetti.create(undefined, {
			  resize: true,
			  useWorker: true,
			});
			confettiAnimation({
			  zIndex: 101,
			  particleCount: 100,
			  spread: 60,
			  origin: { y: 0.6 },
			});
		  }
		}, [show, gameWon]);

	if (!show) {
		return null;
	}

	return (
		<div className={styles.modalOverlay}>
		  <div className={styles.modal}>
			<div className={styles.modalContainer}>
				<h1 style={{ textAlign: 'center' }} className={gameWon ? styles.victory : styles.defeat}>
  					{gameWon ? "VICTORY ACHIEVED" : "DEFEATED"}
				</h1>			
				<p>the game was:</p>
				<h2 style={{ textAlign: 'center' }}>{gameTitle}</h2>
			  	<h3>Score: {score}</h3>
			  <div className={styles.statsRow}  style={{ marginBottom: '1.5rem', marginTop: '1rem'}}>
				<div>
				  <p>{gamesPlayed}</p>
				  <span>Played</span>
				</div>
				<div>
				  <p>{highestScore}</p>
				  <span>High</span>
				</div>
				<div>
				  <p>{averageScore}</p>
				  <span>Avg</span>
				</div>
				<div>
				  <p>{gamesWon}</p>
				  <span>Wins</span>
				</div>
			  </div>
			  <h4>Global stats</h4>
			  <div className={styles.statsRow}>
				<div>
					<p>{globalAverageScore}</p>
					<span>Avg Score</span>
				</div>
				<div>
					<p>{globalAverageGuesses}</p>
					<span>Avg Guesses</span>
				</div>
			  </div>
			  <div className={styles.statsRow}>
				<div>
					<p>{globalWinners}</p>
					<span>Winners</span>
				</div>
				<div>
					<p>{playerCount - globalWinners}</p>
					<span>Losers</span>
				</div>
			  </div>
			  <button className={styles.closeButton} onClick={onClose}>
				Close
			  </button>
			</div>
		  </div>
		</div>
	  );
	};
	
	export default GameOverModal;
