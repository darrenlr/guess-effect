import React, { useState, useEffect } from "react";
import styles from "../styles/Hint.module.css";

const Hint = ({ hint, data, onRevealHint, points, isRevealed }) => {
  const [revealed, setRevealed] = useState(isRevealed);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    setRevealed(isRevealed);
  }, [isRevealed]);

  useEffect(() => {
    if (data === null) {
      setRevealed(true);
    }
  }, [data]);

  const revealHint = () => {
    if (animating) return;
    setAnimating(true);
    onRevealHint(points);
    setTimeout(() => {
      setRevealed(true);
      setAnimating(false);
    }, 650);
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

        // If no data, return early with just a dash and no background
        if (!data) {
          return (
            <div className={styles.hintMeta}>
              <span className={styles.hintMetaScore} style={{ fontSize: "1rem" }}>{"-"}</span>
            </div>
          );
        }

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
            <span className={styles.hintMetaScore} style={{ color }}>{data}</span>
          </div>
        );
      }

      return <span className={styles.hintValue}>{data || "-"}</span>;
    }
  };

  return (
    <div className={styles.hint}>
      <div className={`${styles.hintKey} ${hint === 'plot' ? styles.hintKeyPlot : ''}`}>&gt; {hint}: </div>

      {revealed ? (
        <div>{renderData()}</div>
      ) : (
        <>
          <div className={styles.hintButton}>
            <button
              className={`hintButton ${animating ? styles.decryptAnimating : ""}`}
              onClick={revealHint}
              style={animating ? { pointerEvents: 'none' } : {}}
            >
              {animating && <span className={styles.decryptFill} />}
              <span className={styles.decryptLabel}>
                {animating ? "DECRYPTING..." : `[DECRYPT] (-${points})`}
              </span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Hint;
