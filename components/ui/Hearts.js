import styles from "../../styles/ui.module.css";

// Lives as the pixel hearts: red while you have them, black when spent.
export default function Hearts({ total, remaining, size = 24, blinkLast = false }) {
  return (
    <div className={styles.hearts} role="img" aria-label={`${remaining} of ${total} lives left`}>
      {Array.from({ length: total }, (_, index) => {
        const alive = index < remaining;
        const blinking = blinkLast && index === remaining;
        return (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={index}
            src={alive ? "/images/heart.png" : "/images/heart-black.png"}
            alt=""
            width={size}
            height={size}
            decoding="async"
            className={`${styles.heart} ${blinking ? styles.heartBlink : ""}`}
          />
        );
      })}
    </div>
  );
}
