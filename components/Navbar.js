// Navbar.js
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faCalendar,
	faHeart,
	faCircleQuestion,
	faChartColumn,
} from "@fortawesome/free-solid-svg-icons";
import styles from "../styles/Navbar.module.css";

const Navbar = () => {
	return (
		<div className={styles.navbar}>
			<button className={styles.iconBtn}>
				<FontAwesomeIcon icon={faCalendar} className={styles.icon} />
			</button>
			<button className={styles.iconBtn}>
				<FontAwesomeIcon icon={faHeart} className={styles.icon} />
			</button>
			<h1 className={styles.title}>Guess Effect</h1>
			<button className={styles.iconBtn}>
				<FontAwesomeIcon icon={faCircleQuestion} className={styles.icon} />
			</button>
			<button className={styles.iconBtn}>
				<FontAwesomeIcon icon={faChartColumn} className={styles.icon} />
			</button>
		</div>
	);
};

export default Navbar;
