import React, { useState, useMemo } from "react";
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faCalendar,
	faHeart,
	faCircleQuestion,
	faChartColumn,
} from "@fortawesome/free-solid-svg-icons";

library.add(faCalendar, faHeart, faCircleQuestion, faChartColumn);

import styles from "../styles/Navbar.module.css";
import SupportModal from './SupportModal';
import ArchiveModal from "./ArchiveModal";
import GuessEffectModal from "./GuessEffectModal";
import StatsModal from "./StatsModal";

const Navbar = ({gameHistory, setSelectedDate}) => {
	const [showSupportModal, setShowSupportModal] = useState(false);
  	const [showArchiveModal, setShowArchiveModal] = useState(false);
	const [showGuessEffectModal, setShowGuessEffectModal] = useState(false);
	const [showStatsModal, setShowStatsModal] = useState(false);

	const handleShowSupportModal = () => {
		setShowSupportModal(true);
	};

	const handleShowArchiveModal = () => {
		setShowArchiveModal(true);
	};

	const handleShowGuessEffectModal = () => {
		setShowGuessEffectModal(true);
	};

	const handleShowStatstModal = () => {
		setShowStatsModal(true);
	};

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

	return (
		
		<div className={styles.navbar}>
			<button className={styles.iconBtn} onClick={handleShowArchiveModal}>
				<FontAwesomeIcon icon={faCalendar} className={styles.icon} />
			</button>
			<button className={styles.iconBtn} onClick={handleShowSupportModal}>
				<FontAwesomeIcon icon={faHeart} className={styles.icon} />
			</button>
			<h1 className={styles.title}>Guess Effect</h1>
			<button className={styles.iconBtn} onClick={handleShowGuessEffectModal}>
				<FontAwesomeIcon icon={faCircleQuestion} className={styles.icon} />
			</button>
			<button className={styles.iconBtn} onClick={handleShowStatstModal}>
				<FontAwesomeIcon icon={faChartColumn} className={styles.icon} />
			</button>

			{showSupportModal && <SupportModal closeModal={() => setShowSupportModal(false)} />}
			{showArchiveModal 
				&& <ArchiveModal 
					closeModal={() => setShowArchiveModal(false)} 
					gameHistory={gameHistory}
					setSelectedDate={setSelectedDate}
					/>}
			{showGuessEffectModal && <GuessEffectModal closeModal={() => setShowGuessEffectModal(false)} />}
			{showStatsModal 
				&& <StatsModal  
					closeModal={() => setShowStatsModal(false)}
					gamesPlayed={gameHistory.games}
  					highestScore={highestScore}
  					averageScore={averageScore}
  					gamesWon={gameHistory.wins}
					currentStreak={gameHistory.currentStreak}
					longestStreak={gameHistory.longestStreak}
				 />}

		</div>
	);
};

export default Navbar;
