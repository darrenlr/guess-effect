import React, { useEffect, useState } from "react";
import ShareButton from "./ShareButton";
import CountdownTimer from './CountdownTimer';
import styles from "../styles/GameOverModal.module.css";
import confetti from "canvas-confetti";
import endlessStyles from "../styles/EndlessMode.module.css";

const GameOverModal = ({ 
	show, 
	gameTitle,
   gameDate,
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
    archivedOn,
}) => {
	const [animatedScore, setAnimatedScore] = useState(0);
	const [isScoreAnimationDone, setIsScoreAnimationDone] = useState(false);

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
        }
    }, [isScoreAnimationDone, show, gameWon]);

	if (!show) {
		return null;
	}

    console.log("archivedOn", archivedOn);

	return (
		<div className={styles.modalOverlay} onClick={handleClickOutside}>
		  <div className={styles.modal}>
              { archivedGame ? (
                  <div className={styles.terminalHeader}>C:\\GAMES\\ARCHIVED\\{archivedOn}\\RESULTS.EXE</div>
              ) : <div className={styles.terminalHeader}>C:\\GAMES\\DAILY\\{archivedOn}\\RESULTS.EXE</div>
              }

              {/* Scan overlays — contained to modal bounds */}
              <div className={styles.scanOverlay}>
                  <div className={endlessStyles.modalScanlines} style={{ position: 'absolute', inset: 0 }} />
                  <div className={endlessStyles.modalScanLine} />
              </div>

			<div className={styles.modalContainer}>
			  <div className={styles.gameResultSection}>
				<div className={gameWon ? styles.victory : styles.defeat}>
				  {gameWon ? '>>> SUCCESS <<<' : '>>> FAILURE <<<'}
				</div>
				<div className={styles.gameIdentifiedLabel}>GAME_IDENTIFIED</div>
				<div className={styles.gameTitle}>{gameTitle}</div>
                  <div className={styles.scoreLabel}>SCORE</div>
                  <div className={styles.scoreValue}>{animatedScore}</div>
			  </div>
			  
			  {!archivedGame && (
				<div className={styles.globalStatsSection}>
				  <div className={styles.globalStatsHeader}>&gt; GLOBAL STATISTICS:</div>
				  <div className={styles.statLine}>
					<span>AVG_SCORE:</span>
					<span>{globalAverageScore}</span>
				  </div>
				  <div className={styles.statLine}>
					<span>AVG_GUESSES:</span>
					<span>{globalAverageGuesses}</span>
				  </div>
				  <div className={styles.statLine}>
					<span>TOTAL_PLAYERS:</span>
					<span>{playerCount}</span>
				  </div>
				  <div className={styles.statLine}>
					<span>WIN_RATE:</span>
					<span>{playerCount > 0 ? ((globalWinners / playerCount) * 100).toFixed(1) : "0"}%</span>
				  </div>
				</div>
			  )}

			  {!archivedGame && (
				<>
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
