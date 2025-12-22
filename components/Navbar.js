import React, { useState, useMemo } from "react";
import Link from "next/link";
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faCalendar,
	faHeart,
	faCircleQuestion,
	faChartColumn,
	faGear,
} from "@fortawesome/free-solid-svg-icons";

library.add(faCalendar, faHeart, faCircleQuestion, faChartColumn, faGear);

import styles from "../styles/Navbar.module.css";
import SupportModal from './SupportModal';
import ArchiveModal from "./ArchiveModal";
import GuessEffectModal from "./GuessEffectModal";
import StatsModal from "./StatsModal";
import SettingsModal from "./SettingsModal";

const Navbar = ({
	gameHistory = {scores: [], games: 0, wins: 0, currentStreak: 0, longestStreak: 0}, 
	showCalendar = true, 
	showStats = true,
    showHelp = true,
    showSupport = true,
	showSettings = false,
	onStatsClick = null,
	isEndlessMode = false
}) => {
	const [showSupportModal, setShowSupportModal] = useState(false);
  	const [showArchiveModal, setShowArchiveModal] = useState(false);
	const [showGuessEffectModal, setShowGuessEffectModal] = useState(false);
	const [showStatsModal, setShowStatsModal] = useState(false);
	const [showSettingsModal, setShowSettingsModal] = useState(false);

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
		if (onStatsClick) {
			onStatsClick();
		} else {
			setShowStatsModal(true);
		}
	};

	const handleShowSettingsModal = () => {
		setShowSettingsModal(true);
	};

	const highestScore = useMemo(() => {
		if (gameHistory?.scores?.length > 0) {
		  return gameHistory.scores.reduce((highScore, game) => 
			game.score > highScore ? game.score : highScore, 0);
		}
		return 0;
	  }, [gameHistory]);
	  
	  const averageScore = useMemo(() => {
		if (gameHistory?.scores?.length > 0) {
		  let totalScore = gameHistory.scores.reduce((total, game) => total + game.score, 0);
		  return Math.round(totalScore / gameHistory.scores.length);
		}
		return 0;
	  }, [gameHistory]);

	return (
		
		<div className={styles.navbar}>
			{showCalendar && (
				<button className={styles.iconBtn} onClick={handleShowArchiveModal}>
					<FontAwesomeIcon icon={faCalendar} className={styles.icon} />
				</button>
			)}
			{showSupport && (
				<button className={styles.iconBtn} onClick={handleShowSupportModal}>
					<FontAwesomeIcon icon={faHeart} className={styles.icon} />
				</button>
			)}
			<Link href="/" className={styles.title} data-text="GUESS_EFFECT">GUESS_EFFECT</Link>
			{showSettings && (
				<button className={styles.iconBtn} onClick={handleShowSettingsModal}>
					<FontAwesomeIcon icon={faGear} className={styles.icon} />
				</button>
			)}
			{showHelp && (
				<button className={styles.iconBtn} onClick={handleShowGuessEffectModal}>
					<FontAwesomeIcon icon={faCircleQuestion} className={styles.icon} />
				</button>
			)}
			{showStats && (
				<button className={styles.iconBtn} onClick={handleShowStatstModal}>
					<FontAwesomeIcon icon={faChartColumn} className={styles.icon} />
				</button>
			)}

			{showSupportModal && <SupportModal closeModal={() => setShowSupportModal(false)} />}
			{showArchiveModal 
				&& <ArchiveModal 
					closeModal={() => setShowArchiveModal(false)} 
					gameHistory={gameHistory}
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
			{showSettingsModal && <SettingsModal closeModal={() => setShowSettingsModal(false)} />}

		</div>
	);
};

export default Navbar;
