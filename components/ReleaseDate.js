import React from "react";
import styles from "../styles/ReleaseDate.module.css";

const ReleaseDate = ({ date, region }) => {
  const newDate = new Date(date);
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  const dateString = newDate.toLocaleDateString("en-US", options);

  return (
    <>
      <h2 className={styles.releaseDate}>{dateString} ({region})</h2>
    </>
  );
};

export default ReleaseDate;
