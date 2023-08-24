import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faCalendar,
	faHeart,
	faCircleQuestion,
	faChartColumn,
} from "@fortawesome/free-solid-svg-icons";
import styles from "../styles/Navbar.module.css";
import SupportModal from './SupportModal';
import ArchiveModal from "./ArchiveModal";
import GuessEffectModal from "./GuessEffectModal";

const Navbar = () => {
	const [showSupportModal, setShowSupportModal] = useState(false);
  	const [showArchiveModal, setShowArchiveModal] = useState(false);
	const [showGuessEffectModal, setShowGuessEffectModal] = useState(false);

	const handleShowSupportModal = () => {
		setShowSupportModal(true);
	};

	const handleShowArchiveModal = () => {
		setShowArchiveModal(true);
	};

	const handleShowGuessEffectModal = () => {
		setShowGuessEffectModal(true);
	};

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
			<button className={styles.iconBtn}>
				<FontAwesomeIcon icon={faChartColumn} className={styles.icon} />
			</button>

			{showSupportModal && <SupportModal closeModal={() => setShowSupportModal(false)} />}
			{showArchiveModal && <ArchiveModal closeModal={() => setShowArchiveModal(false)} />}
			{showGuessEffectModal && <GuessEffectModal closeModal={() => setShowGuessEffectModal(false)} />}

		</div>
	);
};

export default Navbar;
