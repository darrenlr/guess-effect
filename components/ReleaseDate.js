import React from "react";
import styles from "../styles/ReleaseDate.module.css";

const ReleaseDate = ({ date, region, archivedOn }) => {
  const newDate = new Date(date);
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  const dateString = newDate.toLocaleDateString("en-US", options);

  return (
    <div className={styles.releaseDateWrapper}>
      <h2 className={styles.releaseDate}>{dateString} ({region})</h2>
      {archivedOn && (
        <h4 className={styles.releaseDateArchived}>Archived on: {archivedOn}</h4>
      )}
    </div>
  );
};

export default ReleaseDate;
