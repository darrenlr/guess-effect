import React from "react";
import styles from "../styles/ReleaseDate.module.css";

const ReleaseDate = ({ date }) => {
  const newDate = new Date(date);
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  const dateString = newDate.toLocaleDateString("en-US", options);

  return (
    <>
      <h4 className={styles.releaseDate}>Release Date: {dateString}</h4>
    </>
  );
};

export default ReleaseDate;
