import React from "react";
import styles from "../styles/ReleaseDate.module.css";

const ReleaseDate = ({ date }) => {
	return (
		<>
			<h4 className={styles.releaseDate}>Release Date: {date}</h4>
		</>
	);
};

export default ReleaseDate;
