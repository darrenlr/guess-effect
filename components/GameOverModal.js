import React, { useEffect, useState, useRef } from "react";
import usePlayerStats from "../hooks/usePlayerStats";
import ShareButton from "./ShareButton";
import CountdownTimer from './CountdownTimer';
import styles from "../styles/GameOverModal.module.css";
import confetti from "canvas-confetti";

const GameOverModal = ({ 
	show, 
	gameTitle, 
	score, 
	gamesPlayed, 
	highestScore, 
	averageScore, 
	gamesWon,
	remainingGuesses,
	releaseDate, 
	globalAverageScore, 
	globalAverageGuesses, 
	globalWinners, 
	playerCount, 
	gameWon,
	onClose,
	archivedGame, 
}) => {
	const [animatedScore, setAnimatedScore] = useState(0);
	const [isScoreAnimationDone, setIsScoreAnimationDone] = useState(false);
	const [highestScoreScale, setHighestScoreScale] = useState(1);

	const handleClickOutside = (event) => {
		if (event.target.className === styles.modalOverlay) {
			onClose();
		}
	};

	useEffect(() => {
        if (show) {
            const duration = 5000; 
            const increment = score / (duration / 100); 
            let currentScore = 0;

            const animateScore = () => {
                if (currentScore < score) {
                    currentScore += increment;
                    if (currentScore > score) {
                        currentScore = score; 
                    }
                    setAnimatedScore(Math.floor(currentScore));

                    requestAnimationFrame(animateScore); 
                } else {
                    setIsScoreAnimationDone(true);
                }	
            };
            animateScore();
        }
    }, [show, score]);

	useEffect(() => {
        if (isScoreAnimationDone && show) {
            const confettiAnimation = confetti.create(undefined, {
                resize: true,
                useWorker: true,
            });

            if (gameWon) {
                confettiAnimation({
                    zIndex: 101,
                    particleCount: 1000,
                    spread: 80,
                    origin: { y: 0.4, x: 0.5 },
                    scalar: 0.6,
                });
            } else {
                confettiAnimation({
                    zIndex: 101,
                    particleCount: 500,
                    spread: 80,
                    colors: ['#FF4500', '#FF6347', '#FFD700', '#FF8C00'],
                    origin: { y: 0.4, x: 0.5 },
                    scalar: 0.4,
                    drift: 0.5,
                });
            }

            if (gameWon && score > highestScore) {
                setHighestScoreScale(2.0); 
                setTimeout(() => setHighestScoreScale(1), 600);
			}
            
        }
    }, [isScoreAnimationDone, show, gameWon, score, highestScore]);

	if (! show) {
		return null;
	}

	return (
		<div className={styles.modalOverlay} onClick={handleClickOutside}>
		  <div className={styles.modal}>
			<div className={styles.modalContainer}>
				<h1 style={{ textAlign: 'center' }} className={gameWon ? styles.victory : styles.defeat}>
  					{gameWon ? "VICTORY ACHIEVED" : "DEFEATED"}
				</h1>			
				<p>the game was:</p>
				<h2 style={{ textAlign: 'center' }}>{gameTitle}</h2>
			  	<h3>Score: {animatedScore}</h3>
			  <div className={styles.statsRow}  style={{ marginBottom: '1.5rem', marginTop: '1rem'}}>
				<div>
				  <p>{gamesPlayed}</p>
				  <span>Played</span>
				</div>
				<div style={{ transform: `scale(${highestScoreScale})`, transition: 'transform 0.3s ease' }}>
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
			  {!archivedGame && (
				<>
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
					<p>{playerCount}</p>
					<span>Players</span>
				</div>	
				<div>
					<p>{playerCount > 0 ? ((globalWinners / playerCount) * 100).toFixed(1) : "0"}%</p>
					<span>Win Rate</span>
				</div>
			  </div>
			  <ShareButton
			  	score={score}
				remainingGuesses={remainingGuesses}
				releaseDate={releaseDate}
			  />
			  
			  		<CountdownTimer />
			  	</>
			  )}
			</div>
		  </div>
		</div>
	  );
	};
	
	export default GameOverModal;
