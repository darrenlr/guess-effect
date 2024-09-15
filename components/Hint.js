import React, { useState, useEffect } from "react";
import styles from "../styles/Hint.module.css";

const Hint = ({ hint, data, onRevealHint, points, isRevealed }) => {
  const [revealed, setRevealed] = useState(isRevealed);
  
  useEffect(() => {
    setRevealed(isRevealed);
  }, [isRevealed]);

  useEffect(() => {
    if (data === null) {
      setRevealed(true);
    }
  }, [data]);

  const revealHint = () => {
    setRevealed(true);
    onRevealHint(points);
  };

  const renderData = () => {
    if (Array.isArray(data)) {
      return data.map((item, index) => (
        <React.Fragment key={index}>
          <span className={styles.hintValueArray}>{item}</span>
          <br />
        </React.Fragment>
      ));
    } else {
      if (hint === 'metacritic') {
        let backgroundColor;
		let color = '#262626';
        const score = parseInt(data);
        if (score < 50) {
          backgroundColor = '#ff6874';
		  color = '#fff'
        } else if (score >= 50 && score <= 74) {
          backgroundColor = '#ffbd3f';
        } else {
          backgroundColor = '#00ce7a';
        }
        return (
			<div className={styles.hintMeta} style={{ backgroundColor }}>
            <span className={styles.hintMetaScore} style={{ color }}>{data || "-none-"}</span>
          </div>
        );
      }
      return <span className={styles.hintValue}>{data || "-none-"}</span>;
    }
  };

  return (
    <div className={styles.hint}>
      <div className={`${styles.hintKey} ${hint === 'plot' ? styles.hintKeyPlot : ''}`}>{hint}: </div>

      {revealed ? (
        <div>{renderData()}</div>
      ) : (
        <>
          <button className="hintButton" onClick={revealHint}>
            Reveal (-{points})
          </button>
        </>
      )}
    </div>
  );
};

export default Hint;
